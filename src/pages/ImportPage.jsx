import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import CSVUploadZone from '@/components/import/CSVUploadZone';
import CSVPreviewTable from '@/components/import/CSVPreviewTable';

const BANK_COLUMN_MAPS = {
  date: ['datum', 'date', 'bokföringsdag', 'transaktionsdatum', 'bokf.dag'],
  description: ['transaktion', 'text', 'beskrivning', 'referens', 'ändamål', 'mottagare', 'transaction', 'description'],
  amount: ['belopp', 'amount', 'summa', 'debet', 'kredit', 'saldo', 'transaktionsbelopp'],
};

function detectColumn(headers, candidates) {
  for (const c of candidates) {
    const found = headers.find(h => h.toLowerCase().trim() === c);
    if (found) return found;
  }
  return null;
}

export default function ImportPage() {
  const [parsedRows, setParsedRows] = useState(null);
  const [step, setStep] = useState('upload'); // upload | analyzing | preview | done
  const [saving, setSaving] = useState(false);
  const [analyzeLabel, setAnalyzeLabel] = useState('AI kategoriserar dina transaktioner...');

  // ── CSV parsed ──────────────────────────────────────────────────────────────
  const handleFileParsed = async (rows, headers) => {
    setStep('analyzing');
    setAnalyzeLabel('AI kategoriserar dina transaktioner...');

    const dateCol = detectColumn(headers, BANK_COLUMN_MAPS.date);
    const descCol = detectColumn(headers, BANK_COLUMN_MAPS.description);
    const amtCol  = detectColumn(headers, BANK_COLUMN_MAPS.amount);

    const normalized = rows.slice(0, 50).map(r => ({
      _date:        dateCol ? r[dateCol] : (r[headers[0]] || ''),
      _description: descCol ? r[descCol] : (r[headers[1]] || ''),
      _amount:      amtCol  ? parseFloat((r[amtCol] || '0').toString().replace(',', '.').replace(/\s/g, '')) : 0,
    })).filter(r => r._description);

    await categorizeAndShow(normalized);
  };

  // ── PDF file ─────────────────────────────────────────────────────────────────
  const handlePdfFile = async (file) => {
    setStep('analyzing');
    setAnalyzeLabel('Läser din PDF med AI...');

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Det här är ett bankkontoutdrag som PDF. Extrahera alla transaktioner och returnera dem som JSON.
För varje transaktion, ge: date (YYYY-MM-DD eller tom sträng), description (text), amount (nummer, negativt = utgift, positivt = inkomst).
Returnera bara riktiga transaktioner, inte rubriker eller summor.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          transactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date:        { type: 'string' },
                description: { type: 'string' },
                amount:      { type: 'number' },
              }
            }
          }
        }
      }
    });

    const txs = result?.transactions || [];
    if (!txs.length) {
      toast.error('Kunde inte läsa transaktioner från PDF:en. Prova CSV.');
      setStep('upload');
      return;
    }

    const normalized = txs.map(t => ({
      _date:        t.date || '',
      _description: t.description || '',
      _amount:      t.amount || 0,
    })).filter(r => r._description);

    await categorizeAndShow(normalized);
  };

  // ── Pasted text ──────────────────────────────────────────────────────────────
  const handlePasteText = async (text) => {
    setStep('analyzing');
    setAnalyzeLabel('AI tolkar din inklistrade text...');

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Nedanstående text är ett kontoutdrag kopierat från en bank-app eller e-post. Extrahera alla transaktioner.
För varje transaktion, ge: date (YYYY-MM-DD eller tom sträng), description (text), amount (nummer, negativt = utgift, positivt = inkomst).

Text:
${text}`,
      response_json_schema: {
        type: 'object',
        properties: {
          transactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date:        { type: 'string' },
                description: { type: 'string' },
                amount:      { type: 'number' },
              }
            }
          }
        }
      }
    });

    const txs = result?.transactions || [];
    if (!txs.length) {
      toast.error('Kunde inte tolka texten. Kontrollera att du klistrat in rätt innehåll.');
      setStep('upload');
      return;
    }

    const normalized = txs.map(t => ({
      _date:        t.date || '',
      _description: t.description || '',
      _amount:      t.amount || 0,
    })).filter(r => r._description);

    await categorizeAndShow(normalized);
  };

  // ── Shared: categorize + show preview ────────────────────────────────────────
  const categorizeAndShow = async (normalized) => {
    setAnalyzeLabel('AI kategoriserar transaktionerna...');
    const descriptions = normalized.map(r => r._description).join('\n');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Kategorisera dessa svenska banktransaktioner. Returnera JSON med en array "categories" där varje element är ett av: food, transport, entertainment, shopping, health, home, savings, income, other.\n\nTransaktioner (en per rad):\n${descriptions}`,
      response_json_schema: {
        type: 'object',
        properties: { categories: { type: 'array', items: { type: 'string' } } }
      }
    });

    const cats = result?.categories || [];
    const withCategories = normalized.map((r, i) => ({ ...r, _category: cats[i] || 'other' }));
    setParsedRows(withCategories);
    setStep('preview');
  };

  // ── Confirm import ────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    setSaving(true);
    const toCreate = parsedRows.map(r => ({
      type:     (r._amount || 0) > 0 ? 'income' : 'expense',
      amount:   r._amount,
      label:    r._description,
      category: r._category,
    }));
    await base44.entities.Transaction.bulkCreate(toCreate);
    toast.success(`${toCreate.length} transaktioner importerade!`);
    setSaving(false);
    setStep('done');
  };

  const reset = () => { setStep('upload'); setParsedRows(null); };

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F4F6F8' }}>
      <div className="px-5 pt-8 pb-4 flex items-center gap-3">
        <Link to="/">
          <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <ArrowLeft className="w-4 h-4" style={{ color: '#1A2332' }} />
          </button>
        </Link>
        <div>
          <h1 className="text-xl font-black" style={{ color: '#1A2332' }}>Importera bank-data</h1>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>CSV, PDF eller klistra in text</p>
        </div>
      </div>

      <div className="px-5 space-y-4">
        <AnimatePresence mode="wait">

          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CSVUploadZone
                onFileParsed={handleFileParsed}
                onPdfFile={handlePdfFile}
                onPasteText={handlePasteText}
              />
              <div className="mt-4 p-4 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#1A2332' }}>Hur exporterar jag min bankdata?</p>
                <div className="space-y-1.5 text-xs" style={{ color: '#9AA5B4' }}>
                  <p>🏦 <strong>Swedbank:</strong> Mina sidor → Konton → Exportera transaktioner (CSV eller PDF)</p>
                  <p>🏦 <strong>SEB:</strong> Internetbanken → Mitt konto → Ladda ner transaktioner</p>
                  <p>🏦 <strong>Nordea:</strong> Konton → Transaktioner → Exportera</p>
                  <p>🏦 <strong>Handelsbanken:</strong> Mitt konto → Transaktionshistorik → CSV/PDF</p>
                  <p className="pt-1" style={{ color: '#0D7377' }}>💡 Du kan också kopiera text direkt från din bank-app och klistra in.</p>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(13,115,119,0.1)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#0D7377' }} />
              </div>
              <p className="text-sm font-bold text-center" style={{ color: '#1A2332' }}>{analyzeLabel}</p>
              <p className="text-xs" style={{ color: '#9AA5B4' }}>Detta tar några sekunder</p>
            </motion.div>
          )}

          {step === 'preview' && parsedRows && (
            <motion.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CSVPreviewTable
                rows={parsedRows}
                isLoading={saving}
                onConfirm={handleConfirm}
                onCancel={reset}
              />
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(13,115,119,0.1)' }}>
                <Sparkles className="w-8 h-8" style={{ color: '#0D7377' }} />
              </div>
              <p className="text-lg font-black" style={{ color: '#1A2332' }}>Import klar! 🎉</p>
              <p className="text-sm text-center" style={{ color: '#9AA5B4' }}>Dina transaktioner är sparade och kategoriserade.</p>
              <Link to="/">
                <button className="px-8 py-3 rounded-full text-sm font-bold text-white" style={{ background: '#0D7377' }}>
                  Tillbaka till Dashboard
                </button>
              </Link>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}