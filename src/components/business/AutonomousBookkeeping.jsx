import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, AlertTriangle, Zap, Shield, Clock, ChevronRight, Receipt } from 'lucide-react';

// Simulated pending transactions for AI categorization
const PENDING_TXS = [
  {
    id: 1,
    vendor: 'SJ AB',
    amount: 320,
    date: 'Idag 08:42',
    aiCategory: 'Resekostnad',
    aiNote: 'Tågresa — moms 10% automatiskt dragen.',
    icon: '🚆',
    safe: true,
  },
  {
    id: 2,
    vendor: 'Adobe Inc',
    amount: 699,
    date: 'Igår 14:15',
    aiCategory: 'Programvaruabonnemang',
    aiNote: 'Adobe Creative Cloud — 25% moms & fullt avdragsgill.',
    icon: '🎨',
    safe: true,
  },
  {
    id: 3,
    vendor: 'Restaurang Operakällaren',
    amount: 2400,
    date: 'Igår 19:30',
    aiCategory: 'Representation',
    aiNote: 'OBS: Skriv in kundens namn för att säkra avdraget vid en kontroll.',
    icon: '🍽️',
    safe: false,
    auditFlag: true,
  },
  {
    id: 4,
    vendor: 'Webhallen',
    amount: 4990,
    date: '2 dagar sedan',
    aiCategory: 'IT-utrustning',
    aiNote: 'Elektronik granskas ofta av Skatteverket — spara kvitto och ange affärssyfte.',
    icon: '💻',
    safe: false,
    auditFlag: true,
  },
];

const LIVE_BALANCE = {
  balance: 412000,
  vatReserved: 85000,
  lastBooked: 'Just nu',
  monthExpenses: 38400,
  pendingVat: 21200,
};

function SwipeCard({ tx, onApprove, onReject }) {
  const [clientNote, setClientNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -60, opacity: 0 }}
      className="p-4 rounded-2xl"
      style={{
        background: tx.auditFlag ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.04)',
        border: tx.auditFlag ? '1.5px solid rgba(212,175,55,0.35)' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: 'rgba(255,255,255,0.06)' }}>
          {tx.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold text-sm truncate" style={{ color: '#F0EAD6' }}>{tx.vendor}</p>
            <p className="font-bold text-sm flex-shrink-0" style={{ color: '#F0EAD6' }}>
              -{tx.amount.toLocaleString('sv-SE')} kr
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(61,170,122,0.15)', color: '#3DAA7A' }}>
              {tx.aiCategory}
            </span>
            <span className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>{tx.date}</span>
          </div>
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: tx.auditFlag ? '#D4AF37' : 'rgba(155,173,184,0.7)' }}>
            {tx.auditFlag && <AlertTriangle className="w-3 h-3 inline mr-1 mb-0.5" />}
            {tx.aiNote}
          </p>

          {tx.auditFlag && !showNoteInput && (
            <button onClick={() => setShowNoteInput(true)}
              className="mt-2 text-xs font-bold flex items-center gap-1"
              style={{ color: '#D4AF37' }}>
              <ChevronRight className="w-3 h-3" /> Lägg till kundnamn
            </button>
          )}

          {showNoteInput && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
              <input
                value={clientNote}
                onChange={e => setClientNote(e.target.value)}
                placeholder="Kundnamn / syfte..."
                className="w-full h-8 rounded-lg px-3 text-xs"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(212,175,55,0.4)', color: '#F0EAD6' }}
              />
            </motion.div>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button onClick={() => onApprove(tx.id, clientNote)}
          className="flex-1 h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(61,170,122,0.2)', color: '#3DAA7A', border: '1px solid rgba(61,170,122,0.35)' }}>
          <CheckCircle2 className="w-3.5 h-3.5" /> Godkänn
        </button>
        <button onClick={() => onReject(tx.id)}
          className="flex-1 h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(217,95,95,0.1)', color: '#D95F5F', border: '1px solid rgba(217,95,95,0.25)' }}>
          <X className="w-3.5 h-3.5" /> Korrigera
        </button>
      </div>
    </motion.div>
  );
}

export default function AutonomousBookkeeping() {
  const [pending, setPending] = useState(PENDING_TXS);
  const [approved, setApproved] = useState(0);
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'live' | 'audit'

  const handleApprove = (id) => {
    setPending(prev => prev.filter(t => t.id !== id));
    setApproved(n => n + 1);
  };

  const handleReject = (id) => {
    setPending(prev => prev.filter(t => t.id !== id));
  };

  const tabs = [
    { id: 'queue', label: 'AI-kö', icon: Zap, badge: pending.length },
    { id: 'live', label: 'Live-balans', icon: Clock },
    { id: 'audit', label: 'Audit Shield', icon: Shield, alert: pending.filter(t => t.auditFlag).length },
  ];

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
            <p className="text-xs font-bold" style={{ color: '#D4AF37' }}>AUTONOMOUS BOOKKEEPING</p>
            <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.6)' }}>AI sköter löpande bokföring i realtid</p>
          </div>
          {approved > 0 && (
            <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(61,170,122,0.15)', color: '#3DAA7A' }}>
              ✓ {approved} bokförda
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-4 pt-3 gap-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all relative"
              style={{
                background: active ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                color: active ? '#D4AF37' : 'rgba(155,173,184,0.6)',
                border: active ? '1px solid rgba(212,175,55,0.4)' : '1px solid transparent',
              }}>
              <Icon className="w-3 h-3" />
              {tab.label}
              {tab.badge > 0 && (
                <span className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center"
                  style={{ background: '#D4AF37', color: '#0D1B2A' }}>{tab.badge}</span>
              )}
              {tab.alert > 0 && (
                <span className="w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center"
                  style={{ background: '#D95F5F', color: 'white' }}>{tab.alert}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="px-4 pb-4 pt-3 space-y-3">
        <AnimatePresence mode="wait">
          {activeTab === 'queue' && (
            <motion.div key="queue" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {pending.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-2xl mb-2">✅</p>
                  <p className="text-sm font-bold" style={{ color: '#3DAA7A' }}>Allt är bokfört!</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(155,173,184,0.6)' }}>Anchor håller dig löpande. Nästa transaktion hanteras automatiskt.</p>
                </div>
              ) : (
                <>
                  <p className="text-xs" style={{ color: 'rgba(155,173,184,0.6)' }}>
                    AI har kategoriserat {pending.length} transaktioner. Godkänn eller korrigera:
                  </p>
                  <AnimatePresence>
                    {pending.map(tx => (
                      <SwipeCard key={tx.id} tx={tx} onApprove={handleApprove} onReject={handleReject} />
                    ))}
                  </AnimatePresence>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div key="live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
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
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              <div className="p-3 rounded-xl flex items-start gap-3"
                style={{ background: 'rgba(61,170,122,0.08)', border: '1px solid rgba(61,170,122,0.2)' }}>
                <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#3DAA7A' }} />
                <p className="text-xs leading-relaxed" style={{ color: '#F0EAD6' }}>
                  Anchor flaggar risker <strong>innan</strong> de blir problem. Transaktioner som Skatteverket granskar markeras automatiskt.
                </p>
              </div>
              {PENDING_TXS.filter(t => t.auditFlag).map(tx => (
                <div key={tx.id} className="p-4 rounded-2xl"
                  style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{tx.icon}</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#F0EAD6' }}>{tx.vendor}</p>
                      <p className="text-xs" style={{ color: 'rgba(155,173,184,0.6)' }}>{tx.amount.toLocaleString('sv-SE')} kr · {tx.aiCategory}</p>
                    </div>
                    <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37' }}>GRANSKA</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#D4AF37' }}>
                    <AlertTriangle className="w-3 h-3 inline mr-1 mb-0.5" />
                    {tx.aiNote}
                  </p>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}