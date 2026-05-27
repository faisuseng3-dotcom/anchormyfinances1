import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Copy, Check, ChevronRight, Eye, Download } from 'lucide-react';
import { BusinessDivider } from '@/components/business/BusinessChrome';

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

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 py-3.5 text-left active:opacity-60"
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#0D7377]/10">
          <ShieldCheck className="w-4 h-4 text-[#0D7377]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-medium text-[#1A2332]">Revisorsportal</p>
          <p className="text-[13px] text-[#9AA5B4]">Ge din revisor read-only-access</p>
        </div>
        <ChevronRight
          className="w-4 h-4 text-[#9AA5B4] transition-transform"
          style={{ transform: open ? 'rotate(90deg)' : 'none' }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <BusinessDivider />
            <div className="pt-3 pb-1 space-y-3">
              <p className="text-[13px] font-medium text-[#1A2332]">Revisorn kan se:</p>
              {[
                { icon: Eye, label: 'Alla transaktioner' },
                { icon: Download, label: 'Ladda ner kvitton & underlag' },
                { icon: Download, label: 'Exportera SIE/CSV' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-[14px] text-[#4A5568]">
                  <item.icon className="w-3.5 h-3.5 text-[#0D7377]" />
                  {item.label}
                </div>
              ))}
              <p className="text-[13px] text-[#9AA5B4] pt-2 border-t border-[#E8ECF0]">
                Revisorn kan inte ändra eller radera
              </p>

              {!generated ? (
                <button
                  type="button"
                  onClick={() => setGenerated(true)}
                  className="w-full h-11 rounded-xl font-semibold text-[15px] text-white bg-[#0D7377]"
                >
                  Generera säker revisorslänk
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-[13px] font-medium text-[#0D7377]">Länk genererad — giltig 30 dagar</p>
                  <div className="flex gap-2">
                    <div className="flex-1 px-3 h-10 rounded-xl flex items-center bg-[#F0F2F5] overflow-hidden">
                      <span className="text-[12px] truncate font-mono text-[#9AA5B4]">{link}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F0F2F5]"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-[#0D7377]" />
                      ) : (
                        <Copy className="w-4 h-4 text-[#9AA5B4]" />
                      )}
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
