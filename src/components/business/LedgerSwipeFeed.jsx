import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { CheckCircle2, X, Camera, AlertTriangle, ChevronRight, Rocket, Loader2, Check, Monitor, Palette, Train, UtensilsCrossed, Package, Apple } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const ACCOUNTS = [
  { code: '5420', label: 'Programvaror & IT' },
  { code: '5800', label: 'Resekostnader' },
  { code: '5900', label: 'Representation' },
  { code: '5410', label: 'Förbrukningsinventarier' },
  { code: '6212', label: 'Mobiltelefon' },
  { code: '5100', label: 'Lokalkostnader' },
  { code: '4000', label: 'Varuinköp' },
];

const TX_ICON_MAP = {
  equipment: Monitor,
  software: Palette,
  travel: Train,
  dining: UtensilsCrossed,
  supplies: Package,
  apple: Apple,
};

const MOCK_TRANSACTIONS = [
  { id: 0, vendor: 'Apple Store', amount: 14990, vat: 2998, vatRate: 25, account: '5410', accountLabel: 'Förbrukningsinventarier', iconKey: 'apple', hasReceipt: false, date: 'Importerad från kontoutdrag', aiText: 'Jag hittade detta i ditt kontoutdrag. Det ser ut som en arbetsdator – vill du bokföra den som inventarie? (Konto 5410 Inventarier rekommenderas)', fromImport: true },
  { id: 1, vendor: 'Adobe Inc', amount: 699, vat: 139.80, vatRate: 25, account: '5420', accountLabel: 'Programvaror & IT', iconKey: 'software', hasReceipt: true, date: 'Idag 14:22', aiText: 'Adobe Creative Cloud — 25% moms automatiskt dragen. Fullt avdragsgill.' },
  { id: 2, vendor: 'SJ AB', amount: 580, vat: 52.73, vatRate: 10, account: '5800', accountLabel: 'Resekostnader', iconKey: 'travel', hasReceipt: true, date: 'Idag 09:15', aiText: 'Tågresa Stockholm–Göteborg — 10% moms. Affärsresa antagen baserat på din profil.' },
  { id: 3, vendor: 'Webhallen', amount: 4990, vat: 998, vatRate: 25, account: '5410', accountLabel: 'IT-utrustning', iconKey: 'equipment', hasReceipt: false, date: 'Igår 18:40', aiText: 'Elektronik — kvitto saknas. Bokföringen är pausad tills underlag finns.' },
  { id: 4, vendor: 'Restaurang PM & Vänner', amount: 1840, vat: 220.80, vatRate: 12, account: '5900', accountLabel: 'Representation', iconKey: 'dining', hasReceipt: false, date: 'Igår 20:10', aiText: 'Representation — kvitto + kundnamn krävs för Skatteverket. Bokföringen pausad.' },
  { id: 5, vendor: 'Kontorsmaterial AB', amount: 340, vat: 68, vatRate: 25, account: '5410', accountLabel: 'Förbrukningsinventarier', iconKey: 'supplies', hasReceipt: true, date: '2 dagar sedan', aiText: 'Kontorsmaterial — 25% moms, direkt avdragsgill.' },
];

function SwipeCard({ tx, onApprove, onReject, isTop }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-150, 150], [-18, 18]);
  const approveOpacity = useTransform(x, [20, 80], [0, 1]);
  const rejectOpacity = useTransform(x, [-80, -20], [1, 0]);
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [changingAccount, setChangingAccount] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(tx.account);
  const fileInputRef = useRef(null);

  const handleDragEnd = (_, info) => {
    if (info.offset.x > 100) onApprove(tx.id, selectedAccount, receiptUrl);
    else if (info.offset.x < -100) onReject(tx.id);
  };

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    // AI-driven OCR — extract amount, vendor, VAT from receipt image
    const ocrResult = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
      prompt: `Analysera detta kvitto och extrahera: leverantör, totalt belopp inkl moms, momssats (6/12/25%), momsbelopp. Returnera på svenska.`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          vendor: { type: 'string' },
          total: { type: 'number' },
          vatRate: { type: 'number' },
          vatAmount: { type: 'number' },
          confidence: { type: 'number' },
        },
      },
    });
    setReceiptUrl(file_url);
    if (ocrResult?.vendor) {
      setOcrData(ocrResult);
    }
    setUploading(false);
  };

  const needsReceipt = !tx.hasReceipt && !receiptUrl;

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      style={{ x, rotate, zIndex: isTop ? 10 : 5 }}
      onDragEnd={handleDragEnd}
      className="absolute inset-x-0 rounded-2xl p-4 cursor-grab active:cursor-grabbing select-none"
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 12, opacity: isTop ? 1 : 0.7 }}
      transition={{ duration: 0.2 }}
      style={{
        x, rotate,
        background: needsReceipt ? 'rgba(212,175,55,0.08)' : 'var(--color-card)',
        border: needsReceipt ? '1.5px solid rgba(212,175,55,0.4)' : '1px solid rgba(255,255,255,0.08)',
        zIndex: isTop ? 10 : 5,
      }}
    >
      {/* Swipe indicators */}
      {isTop && (
        <>
          <motion.div style={{ opacity: approveOpacity }}
            className="absolute top-4 right-4 px-3 py-1.5 rounded-full border-2 font-black text-sm rotate-12"
            style={{ borderColor: '#3DAA7A', color: '#3DAA7A', opacity: approveOpacity }}>
            BOKFÖRT <Check className="w-3.5 h-3.5 inline" aria-hidden />
          </motion.div>
          <motion.div style={{ opacity: rejectOpacity }}
            className="absolute top-4 left-4 px-3 py-1.5 rounded-full border-2 font-black text-sm -rotate-12"
            style={{ borderColor: '#D95F5F', color: '#D95F5F', opacity: rejectOpacity }}>
            ÄNDRA <X className="w-3.5 h-3.5 inline" aria-hidden />
          </motion.div>
        </>
      )}

      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          {(() => { const Icon = TX_ICON_MAP[tx.iconKey] || Package; return <Icon className="w-5 h-5" style={{ color: 'rgba(155,173,184,0.8)' }} aria-hidden />; })()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm" style={{ color: '#F0EAD6' }}>{tx.vendor}</p>
            <p className="font-black text-sm" style={{ color: '#F0EAD6' }}>-{tx.amount.toLocaleString('sv-SE')} kr</p>
          </div>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(155,173,184,0.5)' }}>{tx.date}</p>
        </div>
      </div>

      {/* AI categorization */}
      <div className="mt-3 p-3 rounded-xl"
        style={{ background: needsReceipt ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.04)' }}>
        <p className="text-xs leading-relaxed mb-2" style={{ color: needsReceipt ? '#D4AF37' : 'rgba(155,173,184,0.8)' }}>
          {needsReceipt && <AlertTriangle className="w-3 h-3 inline mr-1 mb-0.5" />}
          {tx.aiText}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(75,124,243,0.15)', color: '#4B7CF3' }}>
            Konto {selectedAccount}
          </span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(61,170,122,0.15)', color: '#3DAA7A' }}>
            Moms {tx.vatRate}% · {tx.vat.toFixed(2)} kr
          </span>
        </div>
      </div>

      {/* Change account */}
      {!changingAccount ? (
        <button onClick={() => setChangingAccount(true)} className="mt-2 text-xs flex items-center gap-1"
          style={{ color: 'rgba(155,173,184,0.5)' }}>
          <ChevronRight className="w-3 h-3" /> Ändra konto
        </button>
      ) : (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
          <div className="grid grid-cols-2 gap-1.5">
            {ACCOUNTS.map(a => (
              <button key={a.code} onClick={() => { setSelectedAccount(a.code); setChangingAccount(false); }}
                className="text-[11px] px-2 py-1.5 rounded-lg text-left font-medium transition-all"
                style={{
                  background: selectedAccount === a.code ? 'rgba(75,124,243,0.2)' : 'rgba(255,255,255,0.04)',
                  color: selectedAccount === a.code ? '#4B7CF3' : 'rgba(155,173,184,0.7)',
                  border: selectedAccount === a.code ? '1px solid rgba(75,124,243,0.4)' : '1px solid transparent',
                }}>
                {a.code} {a.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Receipt upload */}
      {needsReceipt && (
        <button onClick={() => fileInputRef.current?.click()}
          className="mt-3 w-full h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', boxShadow: 'var(--anchor-shadow-1)' }}>
          {uploading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Laddar upp...</> : <><Camera className="w-3.5 h-3.5" /> Fota kvitto nu</>}
        </button>
      )}
      {receiptUrl && !ocrData && (
        <p className="text-xs mt-2 text-center inline-flex items-center justify-center gap-1 w-full" style={{ color: '#3DAA7A' }}><Check className="w-3 h-3" aria-hidden /> Kvitto bifogat — redo att bokföras</p>
      )}
      {ocrData && (
        <div className="mt-2 p-3 rounded-xl" style={{ background: 'rgba(61,170,122,0.08)', boxShadow: 'var(--anchor-shadow-1)' }}>
          <p className="text-xs font-bold mb-1" style={{ color: '#3DAA7A' }}>Kvittot tolkades automatiskt</p>
          <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.7)' }}>
            {ocrData.vendor} · {ocrData.total?.toFixed(2)} kr · Moms {ocrData.vatRate}% ({ocrData.vatAmount?.toFixed(2)} kr)
          </p>
        </div>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleReceiptUpload} />

      {/* Action buttons */}
      {(!needsReceipt || receiptUrl) && isTop && (
        <div className="flex gap-2 mt-3">
          <button onClick={() => onReject(tx.id)}
            className="flex-1 h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
            style={{ background: 'rgba(217,95,95,0.1)', color: '#D95F5F', boxShadow: 'var(--anchor-shadow-1)' }}>
            <X className="w-3.5 h-3.5" /> Ändra
          </button>
          <button onClick={() => onApprove(tx.id, selectedAccount, receiptUrl)}
            className="flex-1 h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
            style={{ background: 'rgba(61,170,122,0.2)', color: '#3DAA7A', boxShadow: 'var(--anchor-shadow-1)' }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Godkänn
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default function LedgerSwipeFeed() {
  const [queue, setQueue] = useState(MOCK_TRANSACTIONS);
  const [lastApproved, setLastApproved] = useState(null);

  const handleApprove = (id) => {
    const tx = queue.find(t => t.id === id);
    setLastApproved(tx);
    setQueue(prev => prev.filter(t => t.id !== id));
    setTimeout(() => setLastApproved(null), 2500);
  };
  const handleReject = (id) => setQueue(prev => prev.filter(t => t.id !== id));

  if (queue.length === 0) {
    return (
      <div className="py-10 text-center">
        <Rocket className="w-8 h-8 mx-auto mb-2" style={{ color: '#3DAA7A' }} aria-hidden />
        <p className="font-bold" style={{ color: '#3DAA7A' }}>Allt bokfört!</p>
        <p className="text-xs mt-1" style={{ color: 'rgba(155,173,184,0.5)' }}>Anchor håller löpande koll. Nästa transaktion hanteras automatiskt.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: 'rgba(155,173,184,0.6)' }}>
          <span className="font-bold" style={{ color: '#F0EAD6' }}>{queue.length}</span> transaktioner väntar — swajpa eller tryck för att bekräfta
        </p>
      </div>

      {/* Stack */}
      <div className="relative" style={{ height: '320px' }}>
        <AnimatePresence>
          {queue.slice(0, 2).map((tx, i) => (
            <SwipeCard key={tx.id} tx={tx} onApprove={handleApprove} onReject={handleReject} isTop={i === 0} />
          ))}
        </AnimatePresence>
      </div>

      {/* Approval toast */}
      <AnimatePresence>
        {lastApproved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: 'rgba(61,170,122,0.15)', boxShadow: 'var(--anchor-shadow-1)' }}>
            <Rocket className="w-4 h-4" style={{ color: '#3DAA7A' }} />
            <p className="text-xs font-bold" style={{ color: '#3DAA7A' }}>
              Bokfört & Klart! {lastApproved.vendor} → Konto {lastApproved.account}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}