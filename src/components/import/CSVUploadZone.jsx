import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X } from 'lucide-react';

export default function CSVUploadZone({ onFileParsed }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

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
    if (!file || !file.name.endsWith('.csv')) { setError('Välj en .csv-fil.'); return; }
    const reader = new FileReader();
    reader.onload = (e) => parseCSV(e.target.result);
    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div>
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        animate={{ borderColor: dragging ? '#0D7377' : 'rgba(0,0,0,0.1)' }}
        className="border-2 border-dashed rounded-3xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors"
        style={{ background: dragging ? 'rgba(13,115,119,0.05)' : '#F4F6F8' }}
      >
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(13,115,119,0.12)' }}>
          <Upload className="w-7 h-7" style={{ color: '#0D7377' }} />
        </div>
        <p className="text-sm font-bold text-center" style={{ color: '#1A2332' }}>Dra & släpp din bankexport</p>
        <p className="text-xs text-center" style={{ color: '#9AA5B4' }}>Stödjer Swedbank, SEB, Nordea, Handelsbanken CSV</p>
        <span className="px-4 py-2 rounded-full text-xs font-bold text-white" style={{ background: '#0D7377' }}>Välj fil</span>
        <input ref={inputRef} type="file" accept=".csv" className="hidden" onChange={e => handleFile(e.target.files[0])} />
      </motion.div>
      {error && <p className="mt-2 text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}