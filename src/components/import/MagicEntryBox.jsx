import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const CATEGORY_EMOJIS = {
  food: '🍔', transport: '🚌', entertainment: '🎮', shopping: '🛍️',
  health: '💪', home: '🏠', savings: '💰', income: '💵', other: '📦',
};

export default function MagicEntryBox({ isOpen, onClose, onSaved }) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setParsed(null);
    const today = new Date().toISOString().split('T')[0];
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extrahera transaktionsdata från denna text: "${text}"\nDagens datum är ${today}.\nReturnera JSON med fälten: description (string), amount (negativt tal om utgift), date (YYYY-MM-DD, "igår" = gårdagens datum), category (ett av: food, transport, entertainment, shopping, health, home, savings, income, other).`,
      response_json_schema: {
        type: 'object',
        properties: {
          description: { type: 'string' },
          amount: { type: 'number' },
          date: { type: 'string' },
          category: { type: 'string' },
        }
      }
    });
    setParsed(result);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!parsed) return;
    setSaving(true);
    await base44.entities.Transaction.create({
      type: (parsed.amount || 0) > 0 ? 'income' : 'expense',
      amount: parsed.amount,
      label: parsed.description,
      category: parsed.category || 'other',
    });
    toast.success('Transaktion sparad! ✓');
    setText('');
    setParsed(null);
    setSaving(false);
    onSaved?.();
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={(e) => e.target === e.currentTarget && onClose?.()}>
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
            className="w-full max-w-md rounded-3xl p-6 space-y-4"
            style={{ background: '#fff', boxShadow: '0 -4px 40px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: '#0D7377' }} />
                <p className="font-bold text-sm" style={{ color: '#1A2332' }}>Magisk inmatning</p>
              </div>
              <button onClick={onClose}><X className="w-4 h-4" style={{ color: '#9AA5B4' }} /></button>
            </div>
            <div className="rounded-2xl p-1" style={{ background: '#F4F6F8' }}>
              <textarea
                className="w-full bg-transparent p-3 text-sm resize-none focus:outline-none"
                style={{ color: '#1A2332', minHeight: 72 }}
                placeholder='Skriv fritt, t.ex. "Lunch på stan 145kr" eller "Tidning igår 49kr"'
                value={text}
                onChange={e => { setText(e.target.value); setParsed(null); }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleParse(); } }}
              />
            </div>
            {!parsed && (
              <button onClick={handleParse} disabled={loading || !text.trim()}
                className="w-full py-3 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                style={{ background: '#0D7377', opacity: !text.trim() ? 0.5 : 1 }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {loading ? 'AI analyserar...' : 'Analysera'}
              </button>
            )}
            {parsed && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 space-y-3"
                style={{ background: 'rgba(13,115,119,0.06)', border: '1px solid rgba(13,115,119,0.15)' }}>
                <p className="text-xs font-semibold" style={{ color: '#0D7377' }}>AI hittade:</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><span style={{ color: '#9AA5B4' }}>Beskrivning</span><p className="font-bold" style={{ color: '#1A2332' }}>{parsed.description}</p></div>
                  <div><span style={{ color: '#9AA5B4' }}>Belopp</span><p className="font-bold" style={{ color: parsed.amount < 0 ? '#E53E3E' : '#0D7377' }}>{parsed.amount} kr</p></div>
                  <div><span style={{ color: '#9AA5B4' }}>Datum</span><p className="font-bold" style={{ color: '#1A2332' }}>{parsed.date}</p></div>
                  <div><span style={{ color: '#9AA5B4' }}>Kategori</span><p className="font-bold" style={{ color: '#1A2332' }}>{CATEGORY_EMOJIS[parsed.category] || '📦'} {parsed.category}</p></div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={() => setParsed(null)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold"
                    style={{ background: '#ECEEF1', color: '#4A5568' }}>Ändra</button>
                  <button onClick={handleSave} disabled={saving}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1"
                    style={{ background: '#0D7377' }}>
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                    Spara
                  </button>
                </div>
              </motion.div>
            )}
            <p className="text-[10px] text-center" style={{ color: '#9AA5B4' }}>Tryck Enter för att analysera snabbt</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}