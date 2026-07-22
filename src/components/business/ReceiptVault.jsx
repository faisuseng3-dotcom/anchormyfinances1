// @ts-nocheck
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, CheckCircle2, Download, Loader2, FileImage } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { jsPDF } from 'jspdf';
import { BusinessDivider } from '@/components/business/BusinessChrome';

async function exportReceiptsPDF(transactions) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFontSize(18);
  doc.setTextColor(30, 30, 30);
  doc.text('Kvittopärm — Lago Business', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(`Exporterad: ${new Date().toLocaleDateString('sv-SE')}`, 14, 28);
  doc.setDrawColor(220, 220, 220);
  doc.line(14, 32, pageW - 14, 32);
  let y = 40;
  for (const tx of transactions) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(`${tx.vendor || '–'}`, 14, y);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Belopp: ${Math.abs(tx.amount || 0).toLocaleString('sv-SE')} kr  |  Moms: ${tx.vatRate ?? '–'}%  |  Konto: ${tx.account || '–'}  |  ${tx.date || ''}`,
      14,
      y + 5,
    );
    if (tx.note) doc.text(`Anteckning: ${tx.note}`, 14, y + 10);
    if (tx.receiptUrl) {
      try {
        const res = await fetch(tx.receiptUrl);
        const blob = await res.blob();
        const dataUrl = await new Promise((resolve) => {
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
      } catch {
        y += 20;
      }
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
  const withReceipts = transactions.filter((t) => t.receiptUrl);
  const withoutReceipts = transactions.filter((t) => !t.receiptUrl);

  const handleQuickUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !onUploadStandalone) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onUploadStandalone(file_url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[14px] text-[#9AA5B4]">
          {withReceipts.length} sparade · {withoutReceipts.length} saknas
        </p>
        {transactions.length > 0 && (
          <button
            type="button"
            onClick={async () => {
              setExporting(true);
              await exportReceiptsPDF(transactions);
              setExporting(false);
            }}
            disabled={exporting}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#0D7377]"
          >
            {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Exportera PDF
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-semibold text-[15px] text-white bg-[#0D7377] active:opacity-90"
      >
        <Camera className="w-5 h-5" />
        Fota ett kvitto
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={handleQuickUpload}
      />

      {withReceipts.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {withReceipts.slice(0, 6).map((tx, i) => (
            <motion.a
              key={i}
              href={tx.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              whileTap={{ scale: 0.97 }}
              className="relative aspect-square rounded-xl overflow-hidden bg-[#F0F2F5]"
            >
              <img
                src={tx.receiptUrl}
                alt={tx.vendor}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-[9px] font-medium truncate text-white">{tx.vendor}</p>
              </div>
              <CheckCircle2 className="absolute top-1.5 right-1.5 w-3.5 h-3.5 text-[#0D7377]" />
            </motion.a>
          ))}
        </div>
      )}

      {transactions.length === 0 && (
        <div className="py-6 flex flex-col items-center gap-2">
          <FileImage className="w-8 h-8 text-[#D0D7E0]" />
          <p className="text-[14px] text-[#9AA5B4] text-center">Fota ditt första kvitto för att komma igång</p>
        </div>
      )}

      {withoutReceipts.length > 0 && (
        <div className="pt-3 border-t border-[#FFE0B2]">
          <p className="text-[15px] font-medium text-[#B45309] mb-2">
            {withoutReceipts.length} transaktioner saknar kvitto
          </p>
          <div className="space-y-2">
            {withoutReceipts.slice(0, 3).map((tx, i) => (
              <React.Fragment key={i}>
                {i > 0 && <BusinessDivider />}
                <div className="flex items-center justify-between py-2">
                  <span className="text-[14px] text-[#92400E]">{tx.vendor}</span>
                  <span className="text-[14px] font-semibold text-[#B45309] tabular-nums">
                    {Math.abs(tx.amount).toLocaleString('sv-SE')} kr
                  </span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
