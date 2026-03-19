import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, ArrowLeft, Plus, RefreshCw, Tag, Zap, TrendingUp, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import ScanOverlay from '@/components/resell/ScanOverlay';
import PriceTag from '@/components/resell/PriceTag';

export default function ResellScanner() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [phase, setPhase] = useState('idle'); // idle | scanning | result | error
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [added, setAdded] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      setCapturedImage(e.target.result);
      setPhase('scanning');
      await runScan(file);
    };
    reader.readAsDataURL(file);
  };

  const runScan = async (file) => {
    // Upload file first
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    // Call backend
    const res = await base44.functions.invoke('resellScanner', { imageUrl: file_url });
    if (res.data && res.data.identified) {
      setResult(res.data);
      setPhase('result');
    } else {
      setPhase('error');
    }
  };

  const handleAddToBudget = async () => {
    if (!result) return;
    await base44.entities.Transaction.create({
      type: 'income',
      amount: result.avgPrice,
      label: `Försäljning: ${result.brand} ${result.model}`,
      vendor: result.marketplaces?.[0] || 'Andrahandsmarknad',
      category: 'income',
      note: `Andrahandsvärde estimerat via ResellScanner. Spann: ${result.quickSalePrice}–${result.maxPrice} kr`,
      aiAgent: 'ResellScanner AI',
      aiNote: `Identifierat skick: ${result.condition}. ${result.sellingTips}`,
    });
    setAdded(true);
  };

  const reset = () => {
    setPhase('idle');
    setCapturedImage(null);
    setResult(null);
    setAdded(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-10 pb-4">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/8 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">ResellScanner</h1>
          <p className="text-xs text-slate-500">Fota & få andrahandsvärde direkt</p>
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <AnimatePresence mode="wait">

          {/* IDLE */}
          {phase === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center gap-6 w-full max-w-sm"
            >
              {/* Scanner frame */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-2 border-dashed border-indigo-500/40 bg-indigo-500/5 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-500/15 flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-10 h-10 text-indigo-400" />
                  </div>
                  <p className="text-slate-400 text-sm">Fota eller välj en bild</p>
                  <p className="text-slate-600 text-xs mt-1">Kläder · Elektronik · Skor · Väskor</p>
                </div>
                {/* Corner brackets */}
                {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-6 h-6 border-2 border-indigo-400 ${i < 2 ? 'border-b-0' : 'border-t-0'} ${i % 2 === 0 ? 'border-r-0' : 'border-l-0'} rounded-sm`} />
                ))}
              </div>

              <div className="flex gap-3 w-full">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { fileRef.current.accept = 'image/*;capture=camera'; fileRef.current.click(); }}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30"
                >
                  <Camera className="w-5 h-5" /> Kamera
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { fileRef.current.accept = 'image/*'; fileRef.current.click(); }}
                  className="flex-1 py-4 rounded-2xl bg-white/8 border border-white/10 text-white font-semibold flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" /> Galleri
                </motion.button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
            </motion.div>
          )}

          {/* SCANNING */}
          {phase === 'scanning' && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm"
            >
              <ScanOverlay imageData={capturedImage} />
            </motion.div>
          )}

          {/* RESULT */}
          {phase === 'result' && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm flex flex-col gap-4"
            >
              {/* Image with AR price tag */}
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden">
                <img src={capturedImage} alt="scanned" className="w-full h-full object-cover" />
                <PriceTag result={result} />
              </div>

              {/* Details card */}
              <div className="rounded-3xl bg-white/5 border border-white/10 p-5 space-y-4">
                {/* Identity */}
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Identifierad vara</p>
                  <p className="text-xl font-bold text-white">{result.brand} {result.model}</p>
                  <p className="text-sm text-slate-400">{result.category} · {result.condition}</p>
                  {result.conditionNote && <p className="text-xs text-slate-500 mt-1 italic">"{result.conditionNote}"</p>}
                </div>

                {/* Price spans */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 rounded-2xl bg-amber-500/10 border border-amber-400/20">
                    <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                    <p className="text-[10px] text-amber-400 font-semibold uppercase">Snabbpris</p>
                    <p className="text-sm font-bold text-white">{result.quickSalePrice} kr</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 ring-1 ring-emerald-400/20">
                    <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                    <p className="text-[10px] text-emerald-400 font-semibold uppercase">Snittpris</p>
                    <p className="text-sm font-bold text-white">{result.avgPrice} kr</p>
                  </div>
                  <div className="text-center p-3 rounded-2xl bg-indigo-500/10 border border-indigo-400/20">
                    <Tag className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                    <p className="text-[10px] text-indigo-400 font-semibold uppercase">Maxpris</p>
                    <p className="text-sm font-bold text-white">{result.maxPrice} kr</p>
                  </div>
                </div>

                {/* Marketplaces */}
                <div>
                  <p className="text-xs text-slate-500 mb-2">Rekommenderade plattformar</p>
                  <div className="flex flex-wrap gap-2">
                    {result.marketplaces?.map(m => (
                      <span key={m} className="px-3 py-1 rounded-full bg-white/8 text-xs text-slate-300 border border-white/10">{m}</span>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                {result.sellingTips && (
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-400/20">
                    <p className="text-xs text-purple-300">💡 {result.sellingTips}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                {added ? (
                  <div className="flex-1 py-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center gap-2 text-emerald-300 font-semibold text-sm">
                    <CheckCircle className="w-5 h-5" /> Lagd i budget!
                  </div>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={handleAddToBudget}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                  >
                    <Plus className="w-5 h-5" /> Lägg till i budget
                  </motion.button>
                )}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={reset}
                  className="w-14 h-14 rounded-2xl bg-white/8 border border-white/10 flex items-center justify-center"
                >
                  <RefreshCw className="w-5 h-5 text-slate-400" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ERROR */}
          {phase === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-4 text-center"
            >
              <div className="text-5xl">🔍</div>
              <p className="text-white font-semibold">Kunde inte identifiera varan</p>
              <p className="text-slate-500 text-sm">Försök med en tydligare bild med bättre ljus</p>
              <motion.button whileTap={{ scale: 0.95 }} onClick={reset}
                className="px-6 py-3 rounded-2xl bg-indigo-500 text-white font-semibold">
                Försök igen
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}