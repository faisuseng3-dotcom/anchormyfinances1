// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, X, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import MoveExpensesModal from '@/components/business/tax/MoveExpensesModal';
import PensionSliderModal from '@/components/business/tax/PensionSliderModal';
import HomeOfficeModal from '@/components/business/tax/HomeOfficeModal';

export default function TaxOptimizer({ entityType, annualRevenue, annualExpenses, transactions, isReset }) {
  const [aiData, setAiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [dismissed_ids, setDismissedIds] = useState(new Set());
  const [secured, setSecured] = useState({});
  const [activeModal, setActiveModal] = useState(null);

  useEffect(() => {
    if (isReset) { setAiData(null); return; }
    if (!annualRevenue) return;
    setLoading(true);
    base44.functions.invoke('taxOptimizer', {
      entityType: entityType || 'enskild',
      annualRevenue: annualRevenue || 0,
      annualExpenses: annualExpenses || 0,
      transactions: (transactions || []).slice(0, 10),
      isReset: false,
    }).then(res => {
      setAiData(res.data);
    }).catch(err => {
      console.error('taxOptimizer error:', err);
    }).finally(() => setLoading(false));
  }, [entityType, annualRevenue, annualExpenses, isReset]);

  const handleDismiss = (idx) => setDismissedIds(prev => new Set([...prev, idx]));

  const handleConfirm = (idx) => {
    setSecured(prev => ({ ...prev, [idx]: true }));
    setActiveModal(null);
    setTimeout(() => setDismissedIds(prev => new Set([...prev, idx])), 1400);
  };

  if (dismissed) return null;

  // Loading state
  if (loading) {
    return (
      <div className="py-4 flex items-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" style={{ color: '#0D7377' }} />
        <p className="text-sm font-semibold" style={{ color: '#4A5568' }}>Analyserar skatteoptimering...</p>
      </div>
    );
  }

  // No data yet (no revenue entered or reset)
  const recs = (aiData?.recommendations || []).filter((_, i) => !dismissed_ids.has(i));
  if (!aiData && !loading) return null;
  if (recs.length === 0) return null;

  const totalSaving = recs.reduce((s, r) => s + (r.savingAmount || 0), 0);
  const priorityColor = (p) => p === 'high' ? '#E53E3E' : p === 'medium' ? '#D69E2E' : '#9AA5B4';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="py-1"
      >
        <div className="px-5 pt-4 pb-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid #F0F2F5' }}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,115,119,0.1)' }}>
            <Scale className="w-4 h-4" style={{ color: '#0D7377' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Skatteförslag</p>
            <p className="text-xs" style={{ color: '#9AA5B4' }}>
              Potentiell besparing:{' '}
              <span className="font-bold" style={{ color: '#0D7377' }}>
                {totalSaving.toLocaleString('sv-SE')} kr
              </span>
            </p>
          </div>
          <button onClick={() => setDismissed(true)} style={{ color: '#9AA5B4' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Breakpoint analysis */}
        {aiData.breakpointAnalysis && (
          <div className="mx-5 mt-4 mb-1 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(13,115,119,0.06)', boxShadow: 'var(--anchor-shadow-1)' }}>
            <p className="text-xs font-bold" style={{ color: '#0D7377' }}>Avstånd till statlig skatt</p>
            <p className="text-2xl font-black mt-0.5" style={{ color: '#1A2332' }}>
              {(aiData.breakpointAnalysis.distanceKr || 0).toLocaleString('sv-SE')} kr
            </p>
            <p className="text-xs mt-1" style={{ color: '#4A5568' }}>{aiData.breakpointAnalysis.recommendation}</p>
          </div>
        )}

        <div className="px-5 py-4 space-y-3">
          <AnimatePresence>
            {recs.map((rec, i) => {
              const origIdx = (aiData?.recommendations || []).indexOf(rec);
              return (
                <motion.div
                  key={origIdx}
                  layout
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="p-4 rounded-2xl overflow-hidden"
                  style={{ background: '#F4F6F8' }}
                >
                  {secured[origIdx] ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="flex items-center gap-2 py-1">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#0D7377' }} />
                      <p className="text-xs font-bold" style={{ color: '#0D7377' }}>
                        Klart! Sparar {(rec.savingAmount || 0).toLocaleString('sv-SE')} kr — säkrat
                      </p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <p className="text-sm font-bold" style={{ color: '#1A2332' }}>{rec.title}</p>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {rec.priority && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                              style={{ background: `${priorityColor(rec.priority)}18`, color: priorityColor(rec.priority) }}>
                              {rec.priority === 'high' ? 'Hög' : rec.priority === 'medium' ? 'Medium' : 'Låg'}
                            </span>
                          )}
                          <span className="text-xs font-black px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(13,115,119,0.1)', color: '#0D7377' }}>
                            +{(rec.savingAmount || 0).toLocaleString('sv-SE')} kr
                          </span>
                        </div>
                      </div>
                      <p className="text-xs leading-relaxed mb-1" style={{ color: '#9AA5B4' }}>
                        {rec.description}
                      </p>
                      {rec.action && (
                        <p className="text-xs font-semibold mb-3" style={{ color: '#4A5568' }}>→ {rec.action}</p>
                      )}
                      <div className="flex gap-2">
                        <button onClick={() => handleDismiss(origIdx)}
                          className="px-3 py-2 rounded-xl text-xs font-medium"
                          style={{ background: '#ECEEF1', color: '#9AA5B4' }}>
                          Ignorera
                        </button>
                        <button onClick={() => setActiveModal(origIdx)}
                          className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                          style={{ background: '#0D7377', color: '#fff' }}>
                          {rec.action?.split(' ').slice(0, 3).join(' ') || 'Aktivera'} <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {aiData.summary && (
            <p className="text-xs px-1" style={{ color: '#9AA5B4' }}>{aiData.summary}</p>
          )}
        </div>
      </motion.div>

      {/* Generic confirmation modal for AI recommendations */}
      <AnimatePresence>
        {activeModal === 'move' && (
          <MoveExpensesModal onClose={() => setActiveModal(null)} onConfirm={(s) => handleConfirm('move', s)} />
        )}
        {activeModal === 'pension' && (
          <PensionSliderModal onClose={() => setActiveModal(null)} onConfirm={(s) => handleConfirm('pension', s)} />
        )}
        {activeModal === 'homeoffice' && (
          <HomeOfficeModal onClose={() => setActiveModal(null)} onConfirm={(s) => handleConfirm('homeoffice', s)} />
        )}
        {typeof activeModal === 'number' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.4)' }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
              className="w-full max-w-md rounded-t-3xl p-6"
              style={{ background: '#fff' }}
              onClick={e => e.stopPropagation()}
            >
              <p className="text-base font-black mb-1" style={{ color: '#1A2332' }}>
                {recs.find((_, i) => (aiData?.recommendations || []).indexOf(recs[i]) === activeModal)?.title || 'Åtgärd'}
              </p>
              <p className="text-sm mb-6" style={{ color: '#4A5568' }}>
                {recs.find((_, i) => (aiData?.recommendations || []).indexOf(recs[i]) === activeModal)?.action}
              </p>
              <button onClick={() => handleConfirm(activeModal)}
                className="w-full py-3.5 rounded-2xl font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #0D7377, #0a5f63)', color: '#fff' }}>
                Bekräfta åtgärd
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}