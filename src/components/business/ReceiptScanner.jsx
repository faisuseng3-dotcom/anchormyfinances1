// @ts-nocheck
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, Upload, CheckCircle2, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const PROCESSING_STEPS = [
  'Laddar upp bild…',
  'Läser kvittot…',
  'Identifierar leverantör…',
  'Extraherar belopp & moms…',
  'Förbereder bokföringspost…',
];

const ACCOUNTS = [
  { code: '5420', label: 'Programvaror & IT' },
  { code: '5800', label: 'Resekostnader' },
  { code: '5900', label: 'Representation' },
  { code: '5410', label: 'Förbrukningsinventarier' },
  { code: '4000', label: 'Varuinköp' },
  { code: '6212', label: 'Mobiltelefon' },
];

export default function ReceiptScanner({ onClose, onSave }) {
  const [phase, setPhase] = useState('upload'); // upload | processing | review | saved
  const [processingStep, setProcessingStep] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [extracted, setExtracted] = useState(null);
  const [form, setForm] = useState({ vendor: '', amount: '', vatRate: '25', account: '5420', date: new Date().toLocaleDateString('sv-SE'), note: '' });
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    setPhase('processing');
    setProcessingStep(0);

    // Animate through processing steps
    let step = 0;
    const stepTimer = setInterval(() => {
      step++;
      setProcessingStep(step);
      if (step >= PROCESSING_STEPS.length - 1) clearInterval(stepTimer);
    }, 700);

    // Upload file
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);

    // AI OCR
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Du är en OCR-expert på svenska kvitton och fakturor. Analysera bilden och extrahera:
- vendor: Leverantörens/butikens namn
- total: Totalt belopp i SEK (med moms, numeriskt)
- vatRate: Momssats i procent (6, 12, 25 eller 0)
- vatAmount: Momsbelopp i SEK
- date: Datum på kvittot (format YYYY-MM-DD, om okänt använd dagens datum)
- suggestedAccount: Det mest lämpliga bokföringskontot av: 5420 (IT/mjukvara), 5800 (resa), 5900 (representation), 5410 (inventarier), 4000 (varuinköp), 6212 (telefon)
- confidence: Din säkerhet 0-100`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          vendor: { type: 'string' },
          total: { type: 'number' },
          vatRate: { type: 'number' },
          vatAmount: { type: 'number' },
          date: { type: 'string' },
          suggestedAccount: { type: 'string' },
          confidence: { type: 'number' },
        },
      },
    });

    clearInterval(stepTimer);
    setProcessingStep(PROCESSING_STEPS.length);

    if (result) {
      setExtracted(result);
      setForm({
        vendor: result.vendor || '',
        amount: result.total?.toFixed(2) || '',
        vatRate: String(result.vatRate || 25),
        account: result.suggestedAccount || '5420',
        date: result.date || new Date().toLocaleDateString('sv-SE'),
        note: '',
      });
    }

    setTimeout(() => setPhase('review'), 400);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = () => {
    const parsedAmount = parseFloat(form.amount.replace(',', '.')) || 0;
    const vr = parseInt(form.vatRate) / 100;
    const vatAmt = parsedAmount * vr / (1 + vr);
    onSave?.({
      vendor: form.vendor,
      amount: -parsedAmount,
      vatRate: parseInt(form.vatRate),
      vat: vatAmt,
      account: form.account,
      accountLabel: ACCOUNTS.find(a => a.code === form.account)?.label || '',
      note: form.note,
      date: form.date,
      receiptUrl: imageUrl,
      type: 'expense',
      confidence: extracted?.confidence,
    });
    setPhase('saved');
    setTimeout(onClose, 1400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.85)' }}
      onClick={phase === 'upload' ? onClose : undefined}
    >
      <motion.div
        initial={{ y: 80 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-t-2xl overflow-hidden"
        style={{ background: '#1A2B3C', maxHeight: '92vh', overflowY: 'auto' }}
      >
        <div className="px-5 pt-5 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4" style={{ color: '#D4AF37' }} />
            <p className="font-bold text-sm" style={{ color: '#F0EAD6' }}>
              {phase === 'upload' ? 'Fota kvitto / faktura' :
               phase === 'processing' ? 'Tolkar kvitto…' :
               phase === 'review' ? 'Granska & bekräfta' :
               <span className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5" aria-hidden /> Sparad!</span>}
            </p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.07)' }}>
            <X className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.6)' }} />
          </button>
        </div>

        <div className="px-5 py-5">
          <AnimatePresence mode="wait">

            {/* UPLOAD */}
            {phase === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center gap-4 cursor-pointer transition-all"
                  style={{ borderColor: 'rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.04)' }}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                    <Camera className="w-8 h-8" style={{ color: '#D4AF37' }} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: '#F0EAD6' }}>Fota eller ladda upp kvitto</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(155,173,184,0.55)' }}>JPG, PNG, PDF · data läses av automatiskt</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                    <Upload className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
                    <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>Välj fil</span>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*,application/pdf" className="hidden"
                    onChange={e => handleFile(e.target.files[0])} />
                </div>
              </motion.div>
            )}

            {/* PROCESSING */}
            {phase === 'processing' && (
              <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="py-8 flex flex-col items-center gap-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-4"
                  style={{ borderColor: 'rgba(212,175,55,0.2)', borderTopColor: '#D4AF37' }}
                />
                <div className="w-full space-y-2">
                  {PROCESSING_STEPS.map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0.3 }}
                      animate={{ opacity: i <= processingStep ? 1 : 0.3 }}
                      className="flex items-center gap-3 py-1.5"
                    >
                      <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: i < processingStep ? '#3DAA7A' : i === processingStep ? '#D4AF37' : 'rgba(255,255,255,0.1)' }}>
                        {i < processingStep && <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        {i === processingStep && <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <p className="text-sm" style={{ color: i <= processingStep ? '#F0EAD6' : 'rgba(155,173,184,0.4)' }}>{s}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* REVIEW */}
            {phase === 'review' && (
              <motion.div key="review" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="space-y-4">

                {extracted?.confidence && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{ background: 'rgba(61,170,122,0.1)', border: '1px solid rgba(61,170,122,0.25)' }}>
                    <CheckCircle2 className="w-4 h-4" style={{ color: '#3DAA7A' }} />
                    <p className="text-xs font-bold" style={{ color: '#3DAA7A' }}>
                      Kvitto tolkat med {extracted.confidence}% säkerhet — granska och justera vid behov
                    </p>
                  </div>
                )}

                {[
                  { label: 'Leverantör', key: 'vendor', type: 'text', placeholder: 't.ex. Adobe Inc' },
                  { label: 'Datum', key: 'date', type: 'text', placeholder: '2026-04-11' },
                  { label: 'Totalt belopp (inkl moms)', key: 'amount', type: 'text', placeholder: '0.00' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block"
                      style={{ color: 'rgba(155,173,184,0.45)' }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full h-11 px-3 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EAD6' }}
                    />
                  </div>
                ))}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block"
                      style={{ color: 'rgba(155,173,184,0.45)' }}>Momssats</label>
                    <select value={form.vatRate} onChange={e => setForm(prev => ({ ...prev, vatRate: e.target.value }))}
                      className="w-full h-11 px-3 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EAD6' }}>
                      <option value="25">25%</option>
                      <option value="12">12%</option>
                      <option value="6">6%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block"
                      style={{ color: 'rgba(155,173,184,0.45)' }}>Konto (förslag)</label>
                    <select value={form.account} onChange={e => setForm(prev => ({ ...prev, account: e.target.value }))}
                      className="w-full h-11 px-3 rounded-xl text-sm font-bold"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EAD6' }}>
                      {ACCOUNTS.map(a => <option key={a.code} value={a.code}>{a.code} {a.label}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block"
                    style={{ color: 'rgba(155,173,184,0.45)' }}>Anteckning</label>
                  <input value={form.note} onChange={e => setForm(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Valfri kommentar…"
                    className="w-full h-11 px-3 rounded-xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EAD6' }} />
                </div>

                <button onClick={handleConfirm}
                  className="w-full h-12 rounded-xl font-black text-sm flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #D4AF37, #C8923A)', color: '#0F1724' }}>
                  <CheckCircle2 className="w-4 h-4" /> Bokför transaktion
                </button>
              </motion.div>
            )}

            {/* SAVED */}
            {phase === 'saved' && (
              <motion.div key="saved" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(61,170,122,0.2)', border: '2px solid #3DAA7A' }}>
                  <CheckCircle2 className="w-8 h-8" style={{ color: '#3DAA7A' }} />
                </div>
                <p className="font-bold text-lg" style={{ color: '#F0EAD6' }}>Bokförd!</p>
                <p className="text-sm text-center" style={{ color: 'rgba(155,173,184,0.6)' }}>Transaktionen sparades i Ledger Vault</p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}