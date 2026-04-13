import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, Download, Loader2, FileImage } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { jsPDF } from 'jspdf';

async function exportReceiptsPDF(transactions) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text('Kvittopärm — Anchor Business', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Exporterad: ${new Date().toLocaleDateString('sv-SE')}`, 14, 28);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 32, pageW - 14, 32);
  let y = 40;
  for (const tx of transactions) {
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(`${tx.vendor || '–'}`, 14, y);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Belopp: ${Math.abs(tx.amount || 0).toLocaleString('sv-SE')} kr  |  Moms: ${tx.vatRate ?? '–'}%  |  Konto: ${tx.account || '–'}  |  ${tx.date || ''}`,
      14, y + 5
    );
    if (tx.note) doc.text(`Anteckning: ${tx.note}`, 14, y + 10);
    if (tx.receiptUrl) {
      try {
        const res = await fetch(tx.receiptUrl);
        const blob = await res.blob();
        const dataUrl = await new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
        const imgProps = doc.getImageProperties(dataUrl);
        const ratio = imgProps.height / imgProps.width;
        const imgW = 60;
        const imgH = imgW * ratio;
        doc.addImage(dataUrl, 'JPEG', pageW - 14 - imgW, y - 4, imgW, imgH);
        y += Math.max(20, imgH + 4);
      } catch { y += 20; }
    } else {
      y += 22;
    }
    doc.setDrawColor(240, 240, 240);
    doc.line(14, y - 2, pageW - 14, y - 2);
  }
  doc.save('anchor_kvittopärm.pdf');
}

export default function ReceiptVault({ transactions = [], onUploadStandalone }) {
  const fileRef = useRef();
  const [exporting, setExporting] = useState(false);
  const withReceipts = transactions.filter(t => t.receiptUrl);
  const withoutReceipts = transactions.filter(t => !t.receiptUrl);

  const handleQuickUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !onUploadStandalone) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUploadStandalone(file_url);
  };

  return (
    <div className="space-y-3">
      {/* Header card */}
      <div className="rounded-3xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F0F2F5' }}>
          <div>
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Kvitton & Underlag</p>
            <p className="text-xs" style={{ color: '#9AA5B4' }}>
              {withReceipts.length} sparade · {withoutReceipts.length} saknas
            </p>
          </div>
          {transactions.length > 0 && (
            <button
              onClick={async () => { setExporting(true); await exportReceiptsPDF(transactions); setExporting(false); }}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-bold"
              style={{ background: '#F4F6F8', color: '#4A5568' }}>
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              Exportera
            </button>
          )}
        </div>

        {/* Scan CTA */}
        <div className="px-5 py-4">
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm"
            style={{ background: '#0D7377', color: '#fff', boxShadow: '0 4px 16px rgba(13,115,119,0.25)' }}>
            <Camera className="w-5 h-5" />
            Fota ett kvitto
          </button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
            onChange={handleQuickUpload} />
        </div>

        {/* Receipt thumbnails */}
        {withReceipts.length > 0 && (
          <div className="px-5 pb-4">
            <div className="grid grid-cols-3 gap-2">
              {withReceipts.slice(0, 6).map((tx, i) => (
                <motion.a
                  key={i}
                  href={tx.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileTap={{ scale: 0.95 }}
                  className="relative aspect-square rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{ background: '#F4F6F8' }}>
                  <img src={tx.receiptUrl} alt={tx.vendor} className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = 'none'; }} />
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }}>
                    <p className="text-[9px] font-bold truncate text-white">{tx.vendor}</p>
                  </div>
                  <div className="absolute top-1.5 right-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" style={{ color: '#0D7377' }} />
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        )}

        {transactions.length === 0 && (
          <div className="pb-6 flex flex-col items-center gap-2">
            <FileImage className="w-8 h-8" style={{ color: '#D0D7E0' }} />
            <p className="text-xs text-center" style={{ color: '#9AA5B4' }}>
              Fota ditt första kvitto för att komma igång
            </p>
          </div>
        )}
      </div>

      {/* Missing receipts — soft pastel warning */}
      {withoutReceipts.length > 0 && (
        <div className="rounded-3xl px-5 py-4"
          style={{ background: '#FFF8F0', border: '1px solid #FFE0B2' }}>
          <p className="text-sm font-bold mb-2" style={{ color: '#B45309' }}>
            {withoutReceipts.length} transaktioner saknar kvitto
          </p>
          <div className="space-y-2">
            {withoutReceipts.slice(0, 3).map((tx, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm" style={{ color: '#92400E' }}>{tx.vendor}</span>
                <span className="text-sm font-bold" style={{ color: '#B45309' }}>
                  {Math.abs(tx.amount).toLocaleString('sv-SE')} kr
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: '#D97706' }}>
            Fota kvittona för att hålla bokföringen komplett
          </p>
        </div>
      )}
    </div>
  );
}