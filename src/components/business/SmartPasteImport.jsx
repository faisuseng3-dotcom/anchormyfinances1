import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clipboard, Sparkles, Check, X, Loader2, ChevronRight, Bot, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const VAT_BADGE = {
  25: { label: '25% moms', color: '#E53E3E' },
  12: { label: '12% moms', color: '#D69E2E' },
  6:  { label: '6% moms',  color: '#0D7377' },
  0:  { label: 'Momsfri', color: '#9AA5B4' },
};

const ACCOUNT_COLOR = '#0D7377';

export default function SmartPasteImport({ onBooked }) {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | parsing | review | booking | done
  const [parsed, setParsed] = useState([]);
  const [aiInsight, setAiInsight] = useState('');

  const handleParse = async () => {
    if (!text.trim()) return;
    setPhase('parsing');
    try {
      // Pass recent transactions as context for better categorization
      const recentTxs = await base44.entities.Transaction.list('-created_date', 10).catch(() => []);
      const result = await base44.functions.invoke('parseBankText', {
        rawText: text,
        recentTransactions: recentTxs.map(t => ({ label: t.label, vendor: t.vendor, amount: t.amount, category: t.category })),
      });
      setParsed(result.data.transactions || []);
      setPhase('review');
    } catch (e) {
      setPhase('idle');
      alert('Kunde inte tolka texten. Försök igen.');
    }
  };

  const removeRow = (idx) => setParsed(p => p.filter((_, i) => i !== idx));

  const handleBookAll = async () => {
    if (parsed.length === 0) return;
    setPhase('booking');
    try {
      // Save all parsed transactions to database
      for (const tx of parsed) {
        await base44.entities.Transaction.create({
          type: tx.amount > 0 ? 'income' : 'expense',
          amount: tx.amount,
          label: tx.description,
          vendor: tx.vendor || tx.description,
          category: tx.category || 'other',
          note: `Konto: ${tx.accountCode} — ${tx.accountName}`,
          aiNote: `AI-bokfört: ${tx.accountCode} ${tx.accountName}. Moms: ${tx.vatRate}%`,
          aiAgent: 'SmartPaste',
        });
      }

      // Generate AI insight from booked transactions
      const totalDeductible = parsed
        .filter(t => t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0);
      const taxSaving = Math.round(totalDeductible * 0.20);

      const insightResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Du är en svensk bokföringsrådgivare. Sammanfatta dessa ${parsed.length} nyligen bokförda transaktioner och ge ett specifikt råd: ${JSON.stringify(parsed.map(t => ({ description: t.description, amount: t.amount, account: t.accountCode, vat: t.vatRate })))}. Skriv 2 meningar max, konkret och direkt. Nämn gärna skattebesparingen om avdragsgilla utgifter bokförs korrekt.`,
      });
      setAiInsight(insightResult || `Jag bokförde ${parsed.length} transaktioner. ${taxSaving > 0 ? `Genom korrekt bokföring kan du minska din skattebas med ${taxSaving.toLocaleString('sv-SE')} kr.` : ''}`);

      setPhase('done');
      onBooked?.(parsed);
    } catch (e) {
      setPhase('review');
      alert('Fel vid bokföring: ' + e.message);
    }
  };

  const reset = () => {
    setText('');
    setParsed([]);
    setAiInsight('');
    setPhase('idle');
  };

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.07)' }}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center gap-3 border-b" style={{ borderColor: '#F0F2F5' }}>
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(13,115,119,0.12)' }}>
          <Clipboard className="w-5 h-5" style={{ color: '#0D7377' }} />
        </div>
        <div>
          <p className="text-sm font-black" style={{ color: '#1A2332' }}>Snabb-import (Klistra in)</p>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>AI tolkar & bokför direkt från din nätbank</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE: textarea input */}
        {phase === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-5">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={7}
              placeholder="Klistra in dina transaktioner från banken här (t.ex. Datum, Beskrivning, Belopp)..."
              className="w-full rounded-2xl p-4 text-sm resize-none focus:outline-none"
              style={{
                background: '#F8FAFB',
                border: '1.5px solid #DDE1E7',
                color: '#1A2332',
                lineHeight: 1.6,
              }}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleParse}
              disabled={!text.trim()}
              className="w-full mt-3 py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-opacity"
              style={{
                background: text.trim() ? 'linear-gradient(135deg, #0D7377, #0a5f63)' : '#DDE1E7',
                color: text.trim() ? '#fff' : '#9AA5B4',
              }}
            >
              <Sparkles className="w-4 h-4" />
              Analysera med AI
            </motion.button>
          </motion.div>
        )}

        {/* PARSING: loading */}
        {phase === 'parsing' && (
          <motion.div key="parsing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0D7377' }} />
            <p className="text-sm font-semibold" style={{ color: '#4A5568' }}>AI tolkar din banktext...</p>
            <p className="text-xs" style={{ color: '#9AA5B4' }}>Strukturerar, kategoriserar & bokför</p>
          </motion.div>
        )}

        {/* REVIEW: table */}
        {phase === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="px-5 pt-4 pb-2 flex items-center justify-between">
              <p className="text-xs font-black uppercase tracking-wide" style={{ color: '#4A5568' }}>
                {parsed.length} tolkade transaktioner — granska
              </p>
              <button onClick={reset} className="text-xs font-semibold" style={{ color: '#9AA5B4' }}>Rensa</button>
            </div>

            {/* needs_review summary bar */}
            {parsed.some(t => t.needs_review) && (
              <div className="mx-5 mb-2 mt-1 flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.25)' }}>
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#dc2626' }} />
                <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>
                  {parsed.filter(t => t.needs_review).length} rad{parsed.filter(t => t.needs_review).length > 1 ? 'er' : ''} markerade för granskning (AI-konfidens &lt;90%)
                </p>
              </div>
            )}

            <div className="divide-y" style={{ borderColor: '#F0F2F5' }}>
              {parsed.map((tx, i) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3"
                  style={tx.needs_review ? { background: 'rgba(220,38,38,0.03)' } : {}}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate" style={{ color: '#1A2332' }}>{tx.vendor || tx.description}</p>
                      {tx.date && <p className="text-xs" style={{ color: '#9AA5B4' }}>{tx.date}</p>}
                      {tx.needs_review && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(220,38,38,0.12)', color: '#dc2626' }}>
                          <AlertTriangle className="w-3 h-3" />
                          Granska
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{
                          background: tx.needs_review ? 'rgba(214,158,46,0.12)' : 'rgba(13,115,119,0.1)',
                          color: tx.needs_review ? '#D69E2E' : ACCOUNT_COLOR,
                          border: tx.needs_review ? '1px solid rgba(214,158,46,0.3)' : 'none',
                        }}>
                        {tx.accountCode} {tx.accountName}
                      </span>
                      {tx.vatRate != null && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                          style={{
                            background: `${VAT_BADGE[tx.vatRate]?.color}18`,
                            color: VAT_BADGE[tx.vatRate]?.color,
                          }}>
                          {VAT_BADGE[tx.vatRate]?.label || `${tx.vatRate}% moms`}
                        </span>
                      )}
                      {tx.confidence != null && (
                        <span className="text-xs" style={{ color: '#9AA5B4' }}>
                          {Math.round(tx.confidence * 100)}% säker
                        </span>
                      )}
                    </div>
                    {tx.vatAmount != null && tx.netAmount != null && (
                      <p className="text-xs mt-0.5" style={{ color: '#9AA5B4' }}>
                        Netto: {tx.netAmount.toLocaleString('sv-SE')} kr · Moms: {tx.vatAmount.toLocaleString('sv-SE')} kr
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-sm font-bold"
                      style={{ color: (tx.amount ?? tx.grossAmount) > 0 ? '#0D7377' : '#E53E3E' }}>
                      {(tx.amount ?? tx.grossAmount) > 0 ? '+' : ''}{Math.abs(tx.amount ?? tx.grossAmount).toLocaleString('sv-SE')} kr
                    </p>
                    <button onClick={() => removeRow(i)}
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(229,62,62,0.1)' }}>
                      <X className="w-3 h-3" style={{ color: '#E53E3E' }} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleBookAll}
                disabled={parsed.length === 0}
                className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #0D7377, #0a5f63)', color: '#fff' }}
              >
                <Check className="w-4 h-4" />
                Bokför alla ({parsed.length})
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* BOOKING: loading */}
        {phase === 'booking' && (
          <motion.div key="booking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-3 py-12">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0D7377' }} />
            <p className="text-sm font-semibold" style={{ color: '#4A5568' }}>Bokför i systemet...</p>
          </motion.div>
        )}

        {/* DONE: AI insight */}
        {phase === 'done' && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="p-5 space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-2xl"
              style={{ background: 'rgba(13,115,119,0.08)', border: '1.5px solid rgba(13,115,119,0.2)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: '#0D7377' }}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#1A2332' }}>{aiInsight}</p>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-2xl"
              style={{ background: 'rgba(13,115,119,0.06)' }}>
              <Check className="w-4 h-4 flex-shrink-0" style={{ color: '#0D7377' }} />
              <p className="text-xs font-semibold" style={{ color: '#4A5568' }}>
                {parsed.length} transaktioner bokförda & sparade
              </p>
            </div>
            <button onClick={reset}
              className="w-full py-3 rounded-2xl font-bold text-sm"
              style={{ background: '#F0F2F5', color: '#4A5568' }}>
              Klistra in fler
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}