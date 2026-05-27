import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { categorizePipeline } from '@/lib/categoryRouter';
import { saveOverride } from '@/lib/enrichmentEngine';
import CSVUploadZone from '@/components/import/CSVUploadZone';
import CSVPreviewTable from '@/components/import/CSVPreviewTable';
import { BusinessPageHeader, BusinessSection, bizSubtitleClass } from '@/components/business/BusinessChrome';
import { createPageUrl } from '@/utils';
import { normalizeCSVRows, rowsToTransactions } from '@/lib/bankImportHelpers';

export default function ImportPage() {
  const [parsedRows, setParsedRows] = useState(null);
  const [step, setStep] = useState('upload');
  const [saving, setSaving] = useState(false);
  const [analyzeLabel, setAnalyzeLabel] = useState('AI kategoriserar dina transaktioner...');

  const handleFileParsed = async (rows, headers) => {
    setStep('analyzing');
    setAnalyzeLabel('Kategoriserar transaktioner…');
    await categorizeAndShow(normalizeCSVRows(rows, headers, 50));
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
    setAnalyzeLabel('Kategoriserar transaktioner…');

    const items = normalized.map((r, i) => ({
      id: i,
      description: r._description,
      amount: r._amount,
    }));

    const { categories, stats } = await categorizePipeline(base44, items);

    if (stats.llmUsed > 0) {
      setAnalyzeLabel(`${stats.localOnly} lokalt · ${stats.llmUsed} via AI`);
    }

    setParsedRows(
      normalized.map((r, i) => ({
        ...r,
        _category: categories[i]?.category || 'other',
        _confidence: categories[i]?.confidence,
        _needsReview: categories[i]?.needsReview,
      })),
    );
    setStep('preview');
  };

  const handleConfirm = async () => {
    setSaving(true);
    await base44.entities.Transaction.bulkCreate(rowsToTransactions(parsedRows));
    toast.success(`${parsedRows.length} transaktioner importerade!`);
    setSaving(false);
    setStep('done');
  };

  const handleCategoryChange = (index, newCategory) => {
    setParsedRows((rows) => {
      const desc = rows[index]?._description;
      if (desc) saveOverride(desc, newCategory);
      return rows.map((r, i) =>
        i === index ? { ...r, _category: newCategory, _needsReview: false } : r,
      );
    });
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
              <CSVPreviewTable
                rows={parsedRows}
                isLoading={saving}
                onConfirm={handleConfirm}
                onCancel={reset}
                onCategoryChange={handleCategoryChange}
              />
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
