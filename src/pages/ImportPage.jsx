import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import CSVUploadZone from '@/components/import/CSVUploadZone';
import CSVPreviewTable from '@/components/import/CSVPreviewTable';
import { BusinessPageHeader, BusinessSection, bizSubtitleClass } from '@/components/business/BusinessChrome';
import { createPageUrl } from '@/utils';

const BANK_COLUMN_MAPS = {
  date: ['datum', 'date', 'bokföringsdag', 'transaktionsdatum', 'bokf.dag'],
  description: ['transaktion', 'text', 'beskrivning', 'referens', 'ändamål', 'mottagare', 'transaction', 'description'],
  amount: ['belopp', 'amount', 'summa', 'debet', 'kredit', 'saldo', 'transaktionsbelopp'],
};

function detectColumn(headers, candidates) {
  for (const c of candidates) {
    const found = headers.find((h) => h.toLowerCase().trim() === c);
    if (found) return found;
  }
  return null;
}

export default function ImportPage() {
  const [parsedRows, setParsedRows] = useState(null);
  const [step, setStep] = useState('upload');
  const [saving, setSaving] = useState(false);
  const [analyzeLabel, setAnalyzeLabel] = useState('AI kategoriserar dina transaktioner...');

  const handleFileParsed = async (rows, headers) => {
    setStep('analyzing');
    setAnalyzeLabel('AI kategoriserar dina transaktioner...');
    const dateCol = detectColumn(headers, BANK_COLUMN_MAPS.date);
    const descCol = detectColumn(headers, BANK_COLUMN_MAPS.description);
    const amtCol = detectColumn(headers, BANK_COLUMN_MAPS.amount);
    const normalized = rows
      .slice(0, 50)
      .map((r) => ({
        _date: dateCol ? r[dateCol] : r[headers[0]] || '',
        _description: descCol ? r[descCol] : r[headers[1]] || '',
        _amount: amtCol
          ? parseFloat((r[amtCol] || '0').toString().replace(',', '.').replace(/\s/g, ''))
          : 0,
      }))
      .filter((r) => r._description);
    await categorizeAndShow(normalized);
  };

  const handlePdfFile = async (file) => {
    setStep('analyzing');
    setAnalyzeLabel('Läser din PDF med AI...');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Bank-PDF. Extrahera transaktioner: date, description, amount (negativ=utgift).`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          transactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: { date: { type: 'string' }, description: { type: 'string' }, amount: { type: 'number' } },
            },
          },
        },
      },
    });
    const txs = result?.transactions || [];
    if (!txs.length) {
      toast.error('Kunde inte läsa PDF — prova CSV.');
      setStep('upload');
      return;
    }
    await categorizeAndShow(
      txs.map((t) => ({ _date: t.date || '', _description: t.description || '', _amount: t.amount || 0 })).filter((r) => r._description),
    );
  };

  const handlePasteText = async (text) => {
    setStep('analyzing');
    setAnalyzeLabel('AI tolkar inklistrad text...');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extrahera transaktioner från banktext:\n${text.slice(0, 8000)}`,
      response_json_schema: {
        type: 'object',
        properties: {
          transactions: {
            type: 'array',
            items: {
              type: 'object',
              properties: { date: { type: 'string' }, description: { type: 'string' }, amount: { type: 'number' } },
            },
          },
        },
      },
    });
    const txs = result?.transactions || [];
    if (!txs.length) {
      toast.error('Hittade inga transaktioner i texten.');
      setStep('upload');
      return;
    }
    await categorizeAndShow(
      txs.map((t) => ({ _date: t.date || '', _description: t.description || '', _amount: t.amount || 0 })).filter((r) => r._description),
    );
  };

  const categorizeAndShow = async (normalized) => {
    setAnalyzeLabel('AI kategoriserar transaktionerna...');
    const descriptions = normalized.map((r) => r._description).join('\n');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Kategorisera dessa svenska banktransaktioner. Returnera JSON med "categories" — food, transport, entertainment, shopping, health, home, savings, income, other.\n\n${descriptions}`,
      response_json_schema: {
        type: 'object',
        properties: { categories: { type: 'array', items: { type: 'string' } } },
      },
    });
    const cats = result?.categories || [];
    setParsedRows(normalized.map((r, i) => ({ ...r, _category: cats[i] || 'other' })));
    setStep('preview');
  };

  const handleConfirm = async () => {
    setSaving(true);
    const toCreate = parsedRows.map((r) => ({
      type: (r._amount || 0) > 0 ? 'income' : 'expense',
      amount: r._amount,
      label: r._description,
      category: r._category,
      context: 'PERSONAL',
    }));
    await base44.entities.Transaction.bulkCreate(toCreate);
    toast.success(`${toCreate.length} transaktioner importerade!`);
    setSaving(false);
    setStep('done');
  };

  const reset = () => {
    setStep('upload');
    setParsedRows(null);
  };

  return (
    <div className="min-h-screen pb-20" style={{ background: '#F4F6F8' }}>
      <BusinessPageHeader
        title="Importera"
        subtitle="CSV, PDF eller klistra in"
        backHref={createPageUrl('Dashboard')}
      />

      <div className="px-5 space-y-6">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CSVUploadZone onFileParsed={handleFileParsed} onPdfFile={handlePdfFile} onPasteText={handlePasteText} />
              <BusinessSection title="Så exporterar du" className="!px-0 mt-6">
                <div className={`${bizSubtitleClass} space-y-2`}>
                  <p>Swedbank, SEB, Nordea och Handelsbanken: exportera transaktioner som CSV eller PDF.</p>
                  <p className="text-[#0D7377] font-medium">Du kan också klistra in text från bankappen.</p>
                </div>
              </BusinessSection>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center py-20 gap-4"
            >
              <Loader2 className="w-8 h-8 animate-spin text-[#0D7377]" />
              <p className="text-[15px] font-medium text-[#1A2332]">{analyzeLabel}</p>
              <p className={bizSubtitleClass}>Detta tar några sekunder</p>
            </motion.div>
          )}

          {step === 'preview' && parsedRows && (
            <motion.div key="preview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <CSVPreviewTable rows={parsedRows} isLoading={saving} onConfirm={handleConfirm} onCancel={reset} />
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center py-20 gap-4 text-center"
            >
              <Sparkles className="w-8 h-8 text-[#0D7377]" />
              <p className="text-[20px] font-semibold text-[#1A2332]">Import klar</p>
              <p className={bizSubtitleClass}>Transaktionerna är sparade och kategoriserade.</p>
              <Link
                to={createPageUrl('Dashboard')}
                className="mt-4 px-8 py-3 rounded-xl text-[15px] font-semibold text-white bg-[#0D7377]"
              >
                Till översikt
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
