import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Copy, Check, ChevronRight, Eye, Download } from 'lucide-react';

export default function AuditorAccess() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  const token = 'anchor-audit-' + Math.random().toString(36).slice(2, 10).toUpperCase();
  const [link] = useState(`https://anchor.app/audit/${token}`);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = () => setGenerated(true);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid rgba(212,175,55,0.2)' }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full px-4 py-3.5 flex items-center justify-between"
        style={{ borderBottom: open ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
            <ShieldCheck className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold" style={{ color: '#D4AF37' }}>REVISORS-PORTAL</p>
            <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>Ge din revisor read-only-access</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.4)', transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-4 py-4 space-y-3">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#F0EAD6' }}>Vad revisorn kan se:</p>
                <div className="space-y-1.5">
                  {[
                    { icon: Eye, label: 'Alla transaktioner (läsbart)' },
                    { icon: Download, label: 'Ladda ner kvitton & underlag' },
                    { icon: Download, label: 'Exportera SIE/CSV-fil' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <item.icon className="w-3 h-3" style={{ color: '#3DAA7A' }} />
                      <span className="text-[11px]" style={{ color: 'rgba(155,173,184,0.7)' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px]" style={{ color: 'rgba(155,173,184,0.4)' }}>
                    🔒 Revisorn kan INTE ändra, lägga till eller radera något
                  </p>
                </div>
              </div>

              {!generated ? (
                <button onClick={handleGenerate}
                  className="w-full h-10 rounded-xl font-bold text-xs"
                  style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
                  Generera säker revisorslänk
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold" style={{ color: '#3DAA7A' }}>✓ Länk genererad — giltig 30 dagar</p>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 h-9 rounded-xl flex items-center overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <span className="text-[10px] truncate font-mono" style={{ color: 'rgba(155,173,184,0.6)' }}>{link}</span>
                    </div>
                    <button onClick={handleCopy}
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: copied ? 'rgba(61,170,122,0.2)' : 'rgba(75,124,243,0.2)', border: `1px solid ${copied ? 'rgba(61,170,122,0.4)' : 'rgba(75,124,243,0.4)'}` }}>
                      {copied ? <Check className="w-3.5 h-3.5" style={{ color: '#3DAA7A' }} /> : <Copy className="w-3.5 h-3.5" style={{ color: '#4B7CF3' }} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}