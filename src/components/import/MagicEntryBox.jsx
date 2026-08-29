// @ts-nocheck
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Send, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { categorizeTransaction } from '@/lib/categoryRouter';
import { saveOverride } from '@/lib/enrichmentEngine';
import { elevatedSheet } from '@/lib/anchorTheme';
import { techCta, techCtaGhost, dashLabel } from '@/lib/appSurface';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';

const CATEGORY_LABELS = {
  food: 'Mat',
  transport: 'Transport',
  entertainment: 'Nöje',
  shopping: 'Shopping',
  health: 'Hälsa',
  home: 'Boende',
  savings: 'Sparande',
  income: 'Inkomst',
  other: 'Övrigt',
};

export default function MagicEntryBox({ isOpen, onClose, onSaved }) {
  const { createTransaction } = useOptimisticTransactions();
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setParsed(null);
    const today = new Date().toISOString().split('T')[0];

    const result = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
      prompt: `Extrahera transaktionsdata från denna text: "${text}"
Dagens datum är ${today}.
Returnera JSON med: description (string), amount (negativt om utgift), date (YYYY-MM-DD).
Lämna kategori tom — den sätts separat.`,
      response_json_schema: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          amount: { type: 'number' },
          date: { type: 'string' },
        },
      },
    });

    const catResult = await categorizeTransaction(base44, result.description, {
      amount: result.amount,
      useLLM: true,
    });

    setParsed({
      ...result,
      category: catResult.category,
      needsReview: catResult.needsReview,
      confidenceLabel: catResult.confidenceLabel,
    });
    setLoading(false);
  };

  const handleSave = () => {
    if (!parsed) return;

    const payload = {
      type: (parsed.amount || 0) > 0 ? 'income' : 'expense',
      amount: Math.abs(parsed.amount),
      label: parsed.description,
      vendor: parsed.description,
      category: parsed.category || 'other',
    };

    createTransaction(payload);

    if (parsed.description && parsed.category) {
      saveOverride(parsed.description, parsed.category);
    }

    setText('');
    setParsed(null);
    onSaved?.();
    onClose?.();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center anchor-overlay p-4"
          onClick={(e) => e.target === e.currentTarget && onClose?.()}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="w-full max-w-md rounded-[28px] p-5 space-y-4 shadow-[var(--anchor-shadow-1)]"
            style={elevatedSheet()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center -mt-1 mb-1">
              <div className="w-9 h-1 rounded-full bg-white/15" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#4fae82]/80" />
                <p className="text-[15px] font-medium text-white">Snabb inmatning</p>
              </div>
              <button type="button" onClick={onClose} className="text-white/40 hover:text-white/70">
                <X className="w-4 h-4" />
              </button>
            </div>

            <textarea
              className="w-full rounded-2xl p-3 text-[15px] resize-none focus:outline-none focus:ring-1 focus:ring-white/20 bg-white/[0.06] text-white placeholder:text-white/35"
              style={{ minHeight: 80 }}
              placeholder='T.ex. "Lunch 145 kr" eller "Tidning igår 49 kr"'
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setParsed(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleParse();
                }
              }}
            />

            {!parsed && (
              <button
                type="button"
                onClick={handleParse}
                disabled={loading || !text.trim()}
                className={`${techCta} w-full`}
              >
                {loading ? (
                  'Tolkar…'
                ) : (
                  'Tolka text'
                )}
              </button>
            )}

            {parsed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-[20px] p-4 space-y-3 ring-1 ring-inset ring-[#4fae82]/20 bg-[#4fae82]/5"
              >
                <div className="flex items-center justify-between">
                  <p className={dashLabel}>Förslag</p>
                  {parsed.needsReview && (
                    <span className="flex items-center gap-1 text-[11px] text-amber-300/90">
                      <AlertCircle className="w-3 h-3" />
                      Granska
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div>
                    <span className="text-white/40">Beskrivning</span>
                    <p className="text-white font-medium mt-0.5">{parsed.description}</p>
                  </div>
                  <div>
                    <span className="text-white/40">Belopp</span>
                    <p className={`font-medium tabular-nums mt-0.5 ${parsed.amount < 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
                      {parsed.amount} kr
                    </p>
                  </div>
                  <div>
                    <span className="text-white/40">Datum</span>
                    <p className="text-white font-medium mt-0.5">{parsed.date}</p>
                  </div>
                  <div>
                    <span className="text-white/40">Kategori</span>
                    <p className="text-white font-medium mt-0.5">
                      {CATEGORY_LABELS[parsed.category] || parsed.category}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button type="button" onClick={() => setParsed(null)} className={`${techCtaGhost} flex-1`}>
                    Ändra
                  </button>
                  <button type="button" onClick={handleSave} className={`${techCta} flex-1`}>
                    <Send className="w-3 h-3" />
                    Spara
                  </button>
                </div>
              </motion.div>
            )}

            <p className="text-[11px] text-center text-white/35">Enter = tolka</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
