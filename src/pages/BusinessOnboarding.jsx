import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, ChevronRight, Briefcase, FlaskConical } from 'lucide-react';

const STEPS = ['welcome', 'orgNr', 'accounts', 'done'];

const SIMULATED_ACCOUNTS = [
  { id: 'biz1', name: 'Företagskonto SE45 1234 5678', bank: 'SEB', balance: 412000, type: 'business' },
  { id: 'biz2', name: 'Skattekonto Skatteverket', bank: 'Skatteverket', balance: 85000, type: 'tax' },
  { id: 'biz3', name: 'Sparkonto AB', bank: 'Handelsbanken', balance: 200000, type: 'savings' },
];

export default function BusinessOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [orgNr, setOrgNr] = useState('');
  const [orgNrError, setOrgNrError] = useState('');
  const [selectedAccounts, setSelectedAccounts] = useState(['biz1']);

  const current = STEPS[step];

  const handleOrgNrNext = () => {
    const clean = orgNr.replace(/\D/g, '');
    if (clean.length !== 10) {
      setOrgNrError('Ange ett giltigt 10-siffrigt organisationsnummer');
      return;
    }
    setOrgNrError('');
    setStep(2);
  };

  const toggleAccount = (id) => {
    setSelectedAccounts(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleComplete = () => {
    localStorage.setItem('anchor_biz_onboarded', 'true');
    localStorage.setItem('anchor_biz_orgNr', orgNr);
    localStorage.setItem('anchor_biz_accounts', JSON.stringify(selectedAccounts));
    navigate('/BusinessDashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(135deg, #0D1B2A 0%, #0a1520 100%)' }}>
      
      {/* Demo banner */}
      <div className="w-full max-w-sm mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.25)' }}>
          <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
          <p className="text-xs font-medium" style={{ color: '#D4AF37' }}>Demo-läge — konton simulerade för presentation</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)' }}>
          <Building2 className="w-6 h-6" style={{ color: '#D4AF37' }} />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Anchor Business</p>
          <p className="text-sm font-semibold" style={{ color: '#F0EAD6' }}>Företagskonfiguration</p>
        </div>
      </div>

      {/* Steps */}
      <div className="w-full max-w-sm">
        <AnimatePresence mode="wait">
          {current === 'welcome' && (
            <motion.div key="welcome" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-black mb-3" style={{ color: '#F0EAD6' }}>Välkommen till Business</h1>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(155,173,184,0.8)' }}>
                  Business-instansen ger dig full koll på likviditet, momsskuld, utestående fakturor och kassaflödesprognoser — separerat från din privata ekonomi.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { emoji: '🛡️', title: 'VAT Shield', desc: 'Automatisk momsreservering' },
                  { emoji: '⚡', title: 'Runway Engine', desc: 'Se hur länge kassan räcker' },
                  { emoji: '📑', title: 'Fakturaöversikt', desc: 'Utestående fordringar i realtid' },
                ].map(item => (
                  <div key={item.title} className="flex items-center gap-4 p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
                    <span className="text-xl">{item.emoji}</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: '#F0EAD6' }}>{item.title}</p>
                      <p className="text-xs" style={{ color: 'rgba(155,173,184,0.7)' }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setStep(1)}
                className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)', color: '#0D1B2A' }}>
                Kom igång <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {current === 'orgNr' && (
            <motion.div key="orgNr" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-black mb-2" style={{ color: '#F0EAD6' }}>Organisationsnummer</h2>
                <p className="text-sm" style={{ color: 'rgba(155,173,184,0.8)' }}>Ange ditt företags organisationsnummer för att hämta bokföringsdata.</p>
              </div>
              <div>
                <input
                  type="text"
                  value={orgNr}
                  onChange={e => { setOrgNr(e.target.value); setOrgNrError(''); }}
                  placeholder="556000-0000"
                  className="w-full h-14 rounded-xl px-4 text-base font-mono text-center"
                  style={{ background: 'rgba(255,255,255,0.06)', border: orgNrError ? '1.5px solid #D95F5F' : '1.5px solid rgba(212,175,55,0.4)', color: '#F0EAD6' }}
                  maxLength={11}
                />
                {orgNrError && <p className="text-xs mt-2 text-center" style={{ color: '#D95F5F' }}>{orgNrError}</p>}
              </div>
              <button onClick={handleOrgNrNext}
                className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)', color: '#0D1B2A' }}>
                Hämta konton <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {current === 'accounts' && (
            <motion.div key="accounts" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-black mb-2" style={{ color: '#F0EAD6' }}>Koppla företagskonton</h2>
                <p className="text-sm" style={{ color: 'rgba(155,173,184,0.8)' }}>Välj vilka konton som ska ingå i Business-instansen.</p>
              </div>
              <div className="space-y-3">
                {SIMULATED_ACCOUNTS.map(acc => {
                  const selected = selectedAccounts.includes(acc.id);
                  return (
                    <button key={acc.id} onClick={() => toggleAccount(acc.id)}
                      className="w-full p-4 rounded-xl flex items-center justify-between text-left transition-all"
                      style={{
                        background: selected ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.04)',
                        border: selected ? '1.5px solid rgba(212,175,55,0.6)' : '1.5px solid rgba(255,255,255,0.08)',
                      }}>
                      <div>
                        <p className="text-sm font-bold" style={{ color: '#F0EAD6' }}>{acc.name}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(155,173,184,0.7)' }}>
                          {acc.bank} · {acc.balance.toLocaleString('sv-SE')} kr
                        </p>
                      </div>
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-3"
                        style={{ background: selected ? '#D4AF37' : 'rgba(255,255,255,0.1)' }}>
                        {selected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="#0D1B2A" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button onClick={handleComplete} disabled={selectedAccounts.length === 0}
                className="w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{
                  background: selectedAccounts.length > 0 ? 'linear-gradient(135deg, #b8942a 0%, #D4AF37 100%)' : 'rgba(212,175,55,0.2)',
                  color: '#0D1B2A',
                  opacity: selectedAccounts.length > 0 ? 1 : 0.5,
                }}>
                Starta Business <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}