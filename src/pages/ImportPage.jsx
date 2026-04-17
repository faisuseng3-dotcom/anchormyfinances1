import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import CSVUploadZone from '@/components/import/CSVUploadZone';
import CSVPreviewTable from '@/components/import/CSVPreviewTable';

const BANK_COLUMN_MAPS = {
  // Swedbank: Datum, Transaktion, Belopp
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
  const [rawRows, setRawRows] = useState(null);
  const [parsedRows, setParsedRows] = useState(null);
  const [step, setStep] = useState('upload'); // upload | analyzing | preview | done
  const [saving, setSaving] = useState(false);

  const handleFileParsed = async (rows, headers) => {
    setRawRows(rows);
    setStep('analyzing');

    const dateCol = detectColumn(headers, BANK_COLUMN_MAPS.date);
    const descCol = detectColumn(headers, BANK_COLUMN_MAPS.description);
    const amtCol = detectColumn(headers, BANK_COLUMN_MAPS.amount);

    // Build normalized rows
    const normalized = rows.slice(0, 50).map(r => ({
      _date: dateCol ? r[dateCol] : (r[headers[0]] || ''),
      _description: descCol ? r[descCol] : (r[headers[1]] || ''),
      _amount: amtCol ? parseFloat((r[amtCol] || '0').toString().replace(',', '.').replace(/\s/g, '')) : 0,
      _raw: r,
    })).filter(r => r._description);

    // Ask AI to categorize all descriptions at once
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

  const handleConfirm = async () => {
    setSaving(true);
    const toCreate = parsedRows.map(r => ({
      type: (r._amount || 0) > 0 ? 'income' : 'expense',
      amount: r._amount,
      label: r._description,
      category: r._category,
    }));
    await base44.entities.Transaction.bulkCreate(toCreate);
    toast.success(`${toCreate.length} transaktioner importerade!`);
    setSaving(false);
    setStep('done');
  };

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
          <p className="text-xs" style={{ color: '#9AA5B4' }}>Ladda upp CSV från din bank</p>
        </div>
      </div>

      <div className="px-5 space-y-4">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CSVUploadZone onFileParsed={handleFileParsed} />
              <div className="mt-4 p-4 rounded-2xl" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#1A2332' }}>Hur exporterar jag CSV?</p>
                <div className="space-y-1.5 text-xs" style={{ color: '#9AA5B4' }}>
                  <p>🏦 <strong>Swedbank:</strong> Mina sidor → Konton → Exportera transaktioner</p>
                  <p>🏦 <strong>SEB:</strong> Internetbanken → Mitt konto → Ladda ner transaktioner</p>
                  <p>🏦 <strong>Nordea:</strong> Konton → Transaktioner → Exportera</p>
                  <p>🏦 <strong>Handelsbanken:</strong> Mitt konto → Transaktionshistorik → CSV</p>
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
              <p className="text-sm font-bold" style={{ color: '#1A2332' }}>AI kategoriserar dina transaktioner...</p>
              <p className="text-xs" style={{ color: '#9AA5B4' }}>Detta tar några sekunder</p>
            </motion.div>
          )}

          {step === 'preview' && parsedRows && (
            <motion.div key="preview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CSVPreviewTable
                rows={parsedRows}
                isLoading={saving}
                onConfirm={handleConfirm}
                onCancel={() => { setStep('upload'); setParsedRows(null); setRawRows(null); }}
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