import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, Loader2, ChevronDown, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { categorizePipeline } from '@/lib/categoryRouter';
import { normalizeCSVRows, rowsToTransactions } from '@/lib/bankImportHelpers';

export default function OnboardingHistoryImport({ pendingRows = [], onChange }) {
  const [open, setOpen] = useState(pendingRows.length > 0);
  const [paste, setPaste] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePasteAnalyze = async () => {
    if (!paste.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Extrahera transaktioner från svensk banktext:\n${paste.slice(0, 8000)}`,
        response_json_schema: {
          type: 'object',
          properties: {
            transactions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  date: { type: 'string' },
                  description: { type: 'string' },
                  amount: { type: 'number' },
                },
              },
            },
          },
        },
      });

      const txs = result?.transactions || [];
      if (!txs.length) {
        setError('Hittade inga transaktioner — prova klistra fler rader.');
        setLoading(false);
        return;
      }

      const normalized = txs
        .slice(0, 40)
        .map((t, i) => ({
          id: i,
          _date: t.date || '',
          _description: t.description || '',
          _amount: t.amount || 0,
        }))
        .filter((r) => r._description);

      const items = normalized.map((r, i) => ({
        id: i,
        description: r._description,
        amount: r._amount,
      }));

      const { categories } = await categorizePipeline(base44, items);

      const rows = normalized.map((r, i) => ({
        ...r,
        _category: categories[i]?.category || 'other',
        _needsReview: categories[i]?.needsReview,
      }));

      onChange?.(rows);
      setPaste('');
    } catch {
      setError('Kunde inte tolka texten. Försök igen.');
    }

    setLoading(false);
  };

  const handleCSV = async (file) => {
    if (!file) return;
    setLoading(true);
    setError(null);

    const text = await file.text();
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length < 2) {
      setError('CSV-filen verkar tom.');
      setLoading(false);
      return;
    }

    const headers = lines[0].split(/[;,]/).map((h) => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map((line) => {
      const cols = line.split(/[;,]/).map((c) => c.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((h, i) => {
        obj[h] = cols[i] || '';
      });
      return obj;
    });

    const normalized = normalizeCSVRows(rows, headers, 40);
    const items = normalized.map((r, i) => ({
      id: i,
      description: r._description,
      amount: r._amount,
    }));

    const { categories } = await categorizePipeline(base44, items);
    const withCats = normalized.map((r, i) => ({
      ...r,
      _category: categories[i]?.category || 'other',
      _needsReview: categories[i]?.needsReview,
    }));

    onChange?.(withCats);
    setLoading(false);
  };

  const reviewCount = pendingRows.filter((r) => r._needsReview).length;

  return (
    <div className="rounded-2xl border border-white/12 overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2">
          <FileUp className="w-4 h-4 text-[#9FB5FF]" />
          <span className="text-sm font-medium text-white">Importera bankhistorik</span>
          <span className="text-[10px] text-white/40">valfritt</span>
        </div>
        <div className="flex items-center gap-2">
          {pendingRows.length > 0 && (
            <span className="text-[11px] font-semibold text-emerald-300">
              {pendingRows.length} klara
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-white/45 transition-transform ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/10"
          >
            <div className="p-4 space-y-3">
              <p className="text-xs text-[#B7C2D9] leading-relaxed">
                Klistra in från bankappen eller ladda upp CSV. Vi kategoriserar automatiskt så Framtidspuls och läckage fungerar direkt.
              </p>

              <textarea
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                placeholder="Klistra transaktionsrader här…"
                rows={4}
                className="w-full rounded-xl px-3 py-2.5 text-xs font-mono text-white bg-white/8 border-0 placeholder:text-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-white/20"
              />

              <div className="flex gap-2">
                <label className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center cursor-pointer bg-white/8 text-white/80 hover:bg-white/12">
                  Välj CSV
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => handleCSV(e.target.files?.[0])}
                  />
                </label>
                <button
                  type="button"
                  onClick={handlePasteAnalyze}
                  disabled={loading || !paste.trim()}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #7FA0FF 0%, #5B7CFA 100%)' }}
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Analysera
                </button>
              </div>

              {error && <p className="text-xs text-rose-300">{error}</p>}

              {pendingRows.length > 0 && (
                <div className="rounded-xl p-3 bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-emerald-200">
                        {pendingRows.length} transaktioner importeras när du slutför
                      </p>
                      {reviewCount > 0 && (
                        <p className="text-[11px] text-emerald-200/70 mt-0.5">
                          {reviewCount} kan granskas i transaktionslistan efteråt
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}