import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Zap, Clock, Shield, Download, Mail } from 'lucide-react';
import LedgerSwipeFeed from './LedgerSwipeFeed';
import VATMeter from './VATMeter';

const LIVE_BALANCE = {
  balance: 412000,
  vatReserved: 85000,
  lastBooked: 'Just nu',
  monthExpenses: 38400,
  pendingVat: 21200,
};

function LiveBalance() {
  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(212,175,55,0.04) 100%)', border: '1px solid rgba(212,175,55,0.25)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#D4AF37' }}>Live-balansräkning</p>
        <p className="text-3xl font-black" style={{ color: '#F0EAD6' }}>
          {(LIVE_BALANCE.balance - LIVE_BALANCE.vatReserved).toLocaleString('sv-SE')}
          <span className="text-base font-normal ml-1" style={{ color: 'rgba(155,173,184,0.6)' }}>kr</span>
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#3DAA7A' }} />
          <p className="text-xs" style={{ color: '#3DAA7A' }}>Uppdaterades {LIVE_BALANCE.lastBooked}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Bokfört denna månad', value: `${LIVE_BALANCE.monthExpenses.toLocaleString('sv-SE')} kr`, color: '#D95F5F' },
          { label: 'Prel. momsskuld', value: `${LIVE_BALANCE.pendingVat.toLocaleString('sv-SE')} kr`, color: '#D4AF37' },
        ].map(item => (
          <div key={item.label} className="p-3 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.6)' }}>{item.label}</p>
            <p className="text-base font-black mt-0.5" style={{ color: item.color }}>{item.value}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-center" style={{ color: 'rgba(155,173,184,0.45)' }}>
        Inga fem veckor gamla siffror — du ser verkligheten just nu.
      </p>
    </div>
  );
}

function SIEExport() {
  const [sent, setSent] = useState(false);

  const handleExport = () => {
    // Simulate SIE file generation
    const sie = `#FLAGGA 0\n#PROGRAM "Anchor Business" 1.0\n#GEN ${new Date().toISOString().slice(0,10).replace(/-/g,'')}\n#FNAMN "Ditt Företag AB"\n#KONTO 5420 "Programvaror"\n#KONTO 5800 "Resekostnader"\n#KONTO 5900 "Representation"\n#VER "" 1 ${new Date().toISOString().slice(0,10).replace(/-/g,'')} "Adobe Inc"\n{#TRANS 5420 {} -699.00\n#TRANS 2641 {} 139.80\n#TRANS 1930 {} 559.20}\n`;
    const blob = new Blob([sie], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anchor_export.se';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="p-4 rounded-2xl"
        style={{ background: 'rgba(75,124,243,0.08)', border: '1px solid rgba(75,124,243,0.2)' }}>
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#4B7CF3' }}>SIE-export</p>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(155,173,184,0.8)' }}>
          Exportera periodens bokföring som en standardiserad SIE-fil — redo att importera i Fortnox, Visma eller skickas till din revisor.
        </p>
        <div className="flex gap-2">
          <button onClick={handleExport}
            className="flex-1 h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            style={{ background: 'rgba(75,124,243,0.2)', color: '#4B7CF3', border: '1px solid rgba(75,124,243,0.4)' }}>
            <Download className="w-3.5 h-3.5" /> Ladda ner SIE-fil
          </button>
          <button onClick={() => setSent(true)}
            className="flex-1 h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-2"
            style={{
              background: sent ? 'rgba(61,170,122,0.15)' : 'rgba(255,255,255,0.05)',
              color: sent ? '#3DAA7A' : 'rgba(155,173,184,0.6)',
              border: sent ? '1px solid rgba(61,170,122,0.3)' : '1px solid rgba(255,255,255,0.08)',
            }}>
            <Mail className="w-3.5 h-3.5" />
            {sent ? '✓ Skickat!' : 'Dela med revisor'}
          </button>
        </div>
      </div>
      <VATMeter />
    </div>
  );
}

const TABS = [
  { id: 'feed', label: 'Signal-feed', icon: Zap },
  { id: 'live', label: 'Live-balans', icon: Clock },
  { id: 'export', label: 'Export & Moms', icon: Shield },
];

export default function AutonomousBookkeeping() {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Header */}
      <div className="px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.35)' }}>
            <Receipt className="w-3.5 h-3.5" style={{ color: '#D4AF37' }} />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: '#D4AF37' }}>THE AUTONOMOUS LEDGER</p>
            <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.6)' }}>Automatisk löpande bokföring i realtid</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-3 gap-2">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
              style={{
                background: active ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                color: active ? '#D4AF37' : 'rgba(155,173,184,0.6)',
                border: active ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
              }}>
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="px-4 pb-4 pt-3">
        <AnimatePresence mode="wait">
          {activeTab === 'feed' && (
            <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LedgerSwipeFeed />
            </motion.div>
          )}
          {activeTab === 'live' && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LiveBalance />
            </motion.div>
          )}
          {activeTab === 'export' && (
            <motion.div key="export" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SIEExport />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}