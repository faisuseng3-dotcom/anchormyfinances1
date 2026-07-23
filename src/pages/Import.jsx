// @ts-nocheck
import React, { useState } from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { categorizePipeline } from '@/lib/categoryRouter';
import { saveOverride } from '@/lib/enrichmentEngine';
import CSVUploadZone from '@/components/import/CSVUploadZone';
import TransactionActiveReview from '@/components/transactions/TransactionActiveReview';
import PageShell, { GlassSection } from '@/components/layout/PageShell';
import { createPageUrl } from '@/utils';
import { normalizeCSVRows, rowsToTransactions } from '@/lib/bankImportHelpers';
import { copilotPrimaryBtnClass } from '@/lib/copilotTheme';

const stepMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export default function Import() {
  const [parsedRows, setParsedRows] = useState(null);
  const [step, setStep] = useState('upload');
  const [saving, setSaving] = useState(false);
  const [analyzeLabel, setAnalyzeLabel] = useState('Kategoriserar transaktioner…');

  const IMPORT_ROW_LIMIT = 1000;

  const handleFileParsed = async (rows, headers) => {
    setStep('analyzing');
    setAnalyzeLabel('Kategoriserar transaktioner…');
    if (rows.length > IMPORT_ROW_LIMIT) {
      toast.warning(
        `Filen har ${rows.length} rader — importerar de första ${IMPORT_ROW_LIMIT}. Kör en ny import för resten.`,
      );
    }
    await categorizeAndShow(normalizeCSVRows(rows, headers, IMPORT_ROW_LIMIT));
  };

  const handlePdfFile = async (file) => {
    setStep('analyzing');
    setAnalyzeLabel('Läser PDF…');
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
      prompt: 'Bank-PDF. Extrahera transaktioner: date, description, amount (negativ=utgift).',
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
    setAnalyzeLabel('Tolkar inklistrad text…');
    const result = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
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
      setAnalyzeLabel(`${stats.localOnly} lokalt · ${stats.llmUsed} tolkade`);
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
    <PageShell
      title="Importera från banken"
      subtitle="Ladda upp CSV — Lago analyserar allt"
      backHref={createPageUrl('Dashboard')}
      headerExtra={
        <p className="text-[13px] text-[var(--copilot-text-secondary)] mt-3 leading-relaxed">
          Swajpa och godkänn varje transaktion — du behåller kontrollen, som i Excel.
        </p>
      }
    >
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div key="upload" {...stepMotion}>
            <CSVUploadZone
              onFileParsed={handleFileParsed}
              onPdfFile={handlePdfFile}
              onPasteText={handlePasteText}
            />
            <GlassSection title="Så exporterar du" className="mt-5">
              <p className="text-[14px] text-[var(--copilot-text-secondary)] leading-relaxed">
                Swedbank, SEB, Nordea och Handelsbanken: exportera transaktioner som CSV eller PDF.
                Du kan också klistra in text direkt från bankappen.
              </p>
            </GlassSection>
          </motion.div>
        )}

        {step === 'analyzing' && (
          <motion.div
            key="analyzing"
            {...stepMotion}
            className="flex flex-col items-center py-24 gap-4"
          >
            <Loader2 className="w-10 h-10 animate-spin text-[var(--copilot-accent-blue)]" />
            <p className="text-[16px] font-semibold text-white">{analyzeLabel}</p>
            <p className="text-[13px] text-[var(--copilot-text-muted)]">Detta tar några sekunder</p>
          </motion.div>
        )}

        {step === 'preview' && parsedRows && (
          <motion.div key="preview" {...stepMotion}>
            <GlassSection
              title="Granska transaktioner"
              subtitle={`${parsedRows.length} hittade — godkänn en i taget`}
            >
              <TransactionActiveReview
                rows={parsedRows}
                isLoading={saving}
                onConfirm={handleConfirm}
                onCancel={reset}
                onCategoryChange={handleCategoryChange}
              />
            </GlassSection>
          </motion.div>
        )}

        {step === 'done' && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-20 gap-4 text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(79, 174, 130, 0.15)', boxShadow: 'var(--anchor-shadow-1)' }}
            >
              <CheckCircle2 className="w-8 h-8 text-[var(--copilot-accent-green)]" />
            </div>
            <p className="text-[22px] font-bold text-white">Import klar</p>
            <p className="text-[14px] text-[var(--copilot-text-secondary)] max-w-xs">
              Transaktionerna är sparade. Din översikt uppdateras med dina fria pengar.
            </p>
            <Link to={createPageUrl('Dashboard')} className={`mt-4 max-w-xs ${copilotPrimaryBtnClass} inline-flex items-center justify-center no-underline`}>
              <Sparkles className="w-4 h-4 mr-2" />
              Till översikt
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}

export const pageSeo = pageSeoFor('Import');
