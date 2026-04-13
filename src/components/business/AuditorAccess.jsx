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
    <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
      <button onClick={() => setOpen(v => !v)}
        className="w-full px-5 py-4 flex items-center justify-between"
        style={{ borderBottom: open ? '1px solid #F0F2F5' : 'none' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,115,119,0.1)' }}>
            <ShieldCheck className="w-4 h-4" style={{ color: '#0D7377' }} />
          </div>
          <div className="text-left">
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Revisorsportal</p>
            <p className="text-xs" style={{ color: '#9AA5B4' }}>Ge din revisor read-only-access</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4" style={{ color: '#9AA5B4', transform: open ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-5 py-4 space-y-3">
              <div className="p-4 rounded-2xl" style={{ background: '#F4F6F8' }}>
                <p className="text-xs font-bold mb-2" style={{ color: '#1A2332' }}>Revisorn kan se:</p>
                <div className="space-y-2">
                  {[
                    { icon: Eye, label: 'Alla transaktioner' },
                    { icon: Download, label: 'Ladda ner kvitton & underlag' },
                    { icon: Download, label: 'Exportera SIE/CSV' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <item.icon className="w-3.5 h-3.5" style={{ color: '#0D7377' }} />
                      <span className="text-xs" style={{ color: '#4A5568' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs mt-3 pt-2" style={{ color: '#9AA5B4', borderTop: '1px solid #E8ECF0' }}>
                  🔒 Revisorn kan inte ändra eller radera
                </p>
              </div>

              {!generated ? (
                <button onClick={handleGenerate}
                  className="w-full h-11 rounded-2xl font-bold text-sm"
                  style={{ background: '#0D7377', color: '#fff' }}>
                  Generera säker revisorslänk
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold" style={{ color: '#0D7377' }}>✓ Länk genererad — giltig 30 dagar</p>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 h-10 rounded-2xl flex items-center overflow-hidden"
                      style={{ background: '#F4F6F8', border: '1.5px solid #E8ECF0' }}>
                      <span className="text-xs truncate font-mono" style={{ color: '#9AA5B4' }}>{link}</span>
                    </div>
                    <button onClick={handleCopy}
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: copied ? 'rgba(13,115,119,0.1)' : '#F4F6F8' }}>
                      {copied ? <Check className="w-4 h-4" style={{ color: '#0D7377' }} /> : <Copy className="w-4 h-4" style={{ color: '#9AA5B4' }} />}
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