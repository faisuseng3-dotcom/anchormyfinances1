import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Camera, FileImage, CheckCircle2, Download, Loader2 } from 'lucide-react';
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
      doc.setFontSize(8);
      doc.setTextColor(200, 80, 80);
      doc.text('⚠ Kvitto saknas', 14, y + 13);
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
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(75,124,243,0.2)', border: '1px solid rgba(75,124,243,0.3)' }}>
            <FolderOpen className="w-3.5 h-3.5" style={{ color: '#4B7CF3' }} />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: '#4B7CF3' }}>RECEIPT VAULT</p>
            <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>
              {withReceipts.length} kvitton sparade · {withoutReceipts.length} saknar underlag
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {transactions.length > 0 && (
            <button
              onClick={async () => { setExporting(true); await exportReceiptsPDF(transactions); setExporting(false); }}
              disabled={exporting}
              className="flex items-center gap-1.5 px-3 h-8 rounded-full text-[11px] font-bold"
              style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
              {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
              PDF
            </button>
          )}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 px-3 h-8 rounded-full text-[11px] font-bold"
            style={{ background: 'rgba(75,124,243,0.15)', color: '#4B7CF3', border: '1px solid rgba(75,124,243,0.3)' }}>
            <Camera className="w-3 h-3" /> Fota kvitto
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
          onChange={handleQuickUpload} />
      </div>

      <div className="px-4 pt-3 pb-4 space-y-3">
        {withReceipts.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {withReceipts.slice(0, 6).map((tx, i) => (
              <motion.a
                key={i}
                href={tx.receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileTap={{ scale: 0.95 }}
                className="relative aspect-square rounded-xl overflow-hidden flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(75,124,243,0.2)' }}>
                <img src={tx.receiptUrl} alt={tx.vendor} className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none'; }} />
                <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                  <p className="text-[9px] font-bold truncate" style={{ color: '#F0EAD6' }}>{tx.vendor}</p>
                  <p className="text-[9px]" style={{ color: '#D4AF37' }}>{Math.abs(tx.amount).toLocaleString('sv-SE')} kr</p>
                </div>
                <div className="absolute top-1 right-1">
                  <CheckCircle2 className="w-3 h-3" style={{ color: '#3DAA7A' }} />
                </div>
              </motion.a>
            ))}
          </div>
        )}

        {withoutReceipts.length > 0 && (
          <div className="p-3 rounded-xl"
            style={{ background: 'rgba(217,95,95,0.08)', border: '1px solid rgba(217,95,95,0.2)' }}>
            <p className="text-xs font-bold mb-1.5" style={{ color: '#D95F5F' }}>
              ⚠️ {withoutReceipts.length} transaktioner saknar kvitto
            </p>
            <div className="space-y-1">
              {withoutReceipts.slice(0, 3).map((tx, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-[11px]" style={{ color: 'rgba(155,173,184,0.6)' }}>{tx.vendor}</span>
                  <span className="text-[11px] font-bold" style={{ color: '#D95F5F' }}>
                    {Math.abs(tx.amount).toLocaleString('sv-SE')} kr
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] mt-2" style={{ color: 'rgba(155,173,184,0.4)' }}>
              Bokföringslagens krav: underlag krävs för varje affärshändelse
            </p>
          </div>
        )}

        {transactions.length === 0 && (
          <div className="py-6 flex flex-col items-center gap-2">
            <FileImage className="w-8 h-8" style={{ color: 'rgba(155,173,184,0.2)' }} />
            <p className="text-xs text-center" style={{ color: 'rgba(155,173,184,0.4)' }}>
              Fota ditt första kvitto — AI:n läser av beloppet automatiskt
            </p>
          </div>
        )}
      </div>
    </div>
  );
}