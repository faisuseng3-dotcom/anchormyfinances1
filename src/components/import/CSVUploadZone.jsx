import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, ClipboardPaste, FileText, FileType } from 'lucide-react';

export default function CSVUploadZone({ onFileParsed, onPdfFile, onPasteText }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteValue, setPasteValue] = useState('');

  const parseCSV = (text) => {
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length < 2) { setError('Filen verkar tom.'); return; }
    const headers = lines[0].split(/[;,]/).map(h => h.trim().replace(/"/g, ''));
    const rows = lines.slice(1).map(line => {
      const cols = line.split(/[;,]/).map(c => c.trim().replace(/"/g, ''));
      const obj = {};
      headers.forEach((h, i) => { obj[h] = cols[i] || ''; });
      return obj;
    }).filter(r => Object.values(r).some(v => v));
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
    <div className="space-y-3">
      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        animate={{ borderColor: dragging ? '#0D7377' : 'rgba(0,0,0,0.1)' }}
        className="border-2 border-dashed rounded-3xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors"
        style={{ background: dragging ? 'rgba(13,115,119,0.05)' : '#F4F6F8' }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.12)' }}>
          <Upload className="w-7 h-7" style={{ color: '#0D7377' }} />
        </div>
        <p className="text-sm font-bold text-center" style={{ color: '#1A2332' }}>Dra & släpp din bankexport här</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(13,115,119,0.1)', color: '#0D7377' }}>
            <FileText className="w-3 h-3" /> CSV
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(167,139,250,0.12)', color: '#A78BFA' }}>
            <FileType className="w-3 h-3" /> PDF
          </div>
        </div>
        <span className="px-4 py-2 rounded-full text-xs font-bold text-white" style={{ background: '#0D7377' }}>Välj fil</span>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.pdf,text/csv,application/pdf"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />
      </motion.div>

      {/* Paste button */}
      <button
        onClick={() => setPasteMode(v => !v)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-colors"
        style={{
          background: pasteMode ? 'rgba(13,115,119,0.08)' : '#fff',
          border: `1px solid ${pasteMode ? '#0D7377' : 'rgba(0,0,0,0.08)'}`,
          color: pasteMode ? '#0D7377' : '#4A5568',
        }}
      >
        <ClipboardPaste className="w-4 h-4" />
        Klistra in text från banken
      </button>

      {/* Paste textarea */}
      {pasteMode && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(13,115,119,0.3)', background: '#fff' }}
        >
          <textarea
            autoFocus
            value={pasteValue}
            onChange={e => setPasteValue(e.target.value)}
            placeholder="Klistra in rader från din bank-app, e-post eller kontoutdrag här..."
            rows={7}
            className="w-full p-4 text-xs resize-none outline-none"
            style={{ color: '#1A2332', fontFamily: 'monospace' }}
          />
          <div className="flex gap-2 p-3 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <button
              onClick={() => { setPasteMode(false); setPasteValue(''); }}
              className="flex-1 py-2 rounded-xl text-xs font-bold"
              style={{ background: '#F4F6F8', color: '#4A5568' }}
            >
              Avbryt
            </button>
            <button
              onClick={handlePasteSubmit}
              disabled={!pasteValue.trim()}
              className="flex-1 py-2 rounded-xl text-xs font-bold text-white"
              style={{ background: pasteValue.trim() ? '#0D7377' : '#9AA5B4' }}
            >
              Analysera med AI ✨
            </button>
          </div>
        </motion.div>
      )}

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}