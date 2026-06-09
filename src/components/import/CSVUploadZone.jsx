import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ClipboardPaste, FileText, FileType } from 'lucide-react';
import CopilotCard from '@/components/ui-premium/copilot/CopilotCard';
import { copilotInputClass, copilotPrimaryBtnClass, copilotSecondaryBtnClass } from '@/lib/copilotTheme';

export default function CSVUploadZone({ onFileParsed, onPdfFile, onPasteText }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteValue, setPasteValue] = useState('');

  const parseCSV = (text) => {
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length < 2) { setError('Filen verkar tom.'); return; }
    const headers = lines[0].split(/[;,]/).map((h) => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map((line) => {
      const cols = line.split(/[;,]/).map((c) => c.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
      return obj;
    }).filter((r) => Object.values(r).some((v) => v));
    onFileParsed(rows, headers);
  };

  const handleFile = (file) => {
    setError(null);
    if (!file) return;

    if (file.name.endsWith('.pdf') || file.type === 'application/pdf') {
      onPdfFile?.(file);
      return;
    }

    if (file.name.endsWith('.csv') || file.type === 'text/csv' || file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => parseCSV(e.target.result);
      reader.readAsText(file, 'UTF-8');
      return;
    }

    setError('Välj en .csv eller .pdf-fil.');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handlePasteSubmit = () => {
    if (!pasteValue.trim()) return;
    onPasteText?.(pasteValue.trim());
    setPasteValue('');
    setPasteMode(false);
  };

  return (
    <div className="space-y-4">
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        whileTap={{ scale: 0.99 }}
        animate={{
          borderColor: dragging ? 'rgba(74,122,255,0.6)' : 'rgba(255,255,255,0.12)',
          background: dragging ? 'rgba(74,122,255,0.08)' : 'var(--copilot-bg-card)',
        }}
        className="border-2 border-dashed rounded-3xl p-8 flex flex-col items-center gap-4 cursor-pointer transition-colors min-h-[200px] justify-center"
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(74,122,255,0.15)', border: '1px solid rgba(74,122,255,0.25)' }}
        >
          <Upload className="w-7 h-7 text-[var(--copilot-accent-blue)]" />
        </div>
        <div className="text-center">
          <p className="text-[15px] font-semibold text-white">Dra & släpp din bankexport</p>
          <p className="text-[13px] text-[var(--copilot-text-muted)] mt-1">CSV eller PDF från Swedbank, SEB, Nordea…</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[rgba(74,122,255,0.12)] text-[var(--copilot-accent-cyan)]">
            <FileText className="w-3 h-3" /> CSV
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-[rgba(167,139,250,0.12)] text-purple-300">
            <FileType className="w-3 h-3" /> PDF
          </span>
        </div>
        <span className="px-5 py-2.5 rounded-full text-[13px] font-semibold text-white bg-gradient-to-r from-[#4a7aff] to-[#6d4aff] min-h-12 flex items-center">
          Välj fil
        </span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.pdf,text/csv,application/pdf"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </motion.div>

      <button
        type="button"
        onClick={() => setPasteMode((v) => !v)}
        className={`w-full flex items-center justify-center gap-2 min-h-12 rounded-2xl text-[14px] font-semibold transition-all active:scale-[0.98] ${
          pasteMode
            ? 'bg-[rgba(74,122,255,0.12)] border border-[rgba(74,122,255,0.35)] text-white'
            : 'bg-[var(--copilot-bg-card)] border border-[var(--copilot-border)] text-[var(--copilot-text-secondary)]'
        }`}
      >
        <ClipboardPaste className="w-4 h-4" />
        Klistra in text från banken
      </button>

      <AnimatePresence>
        {pasteMode && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25 }}
          >
            <CopilotCard className="!p-0 overflow-hidden">
              <textarea
                autoFocus
                value={pasteValue}
                onChange={(e) => setPasteValue(e.target.value)}
                placeholder="Klistra in rader från din bank-app, e-post eller kontoutdrag…"
                rows={7}
                className={`${copilotInputClass} !rounded-none !border-0 !h-auto min-h-[140px] py-4 font-mono text-[12px] resize-none`}
              />
              <div className="flex gap-2 p-3 border-t border-[var(--copilot-border)]">
                <button
                  type="button"
                  onClick={() => { setPasteMode(false); setPasteValue(''); }}
                  className={`flex-1 ${copilotSecondaryBtnClass}`}
                >
                  Avbryt
                </button>
                <button
                  type="button"
                  onClick={handlePasteSubmit}
                  disabled={!pasteValue.trim()}
                  className={`flex-1 ${copilotPrimaryBtnClass}`}
                >
                  Tolka och kategorisera
                </button>
              </div>
            </CopilotCard>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-[12px] text-rose-400 text-center font-medium">{error}</p>}
    </div>
  );
}
