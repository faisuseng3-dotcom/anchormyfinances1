import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import MoveExpensesModal from '@/components/business/tax/MoveExpensesModal';
import PensionSliderModal from '@/components/business/tax/PensionSliderModal';
import HomeOfficeModal from '@/components/business/tax/HomeOfficeModal';

const INITIAL_SUGGESTIONS = [
  {
    id: 1,
    title: 'Privata inköp → Företaget',
    description: 'Du har gjort inköp av kontorsmaterial privat den senaste månaden. Om du bokför dem på företaget istället sparar du 2 450 kr i skatt.',
    saving: 2450,
    action: 'Flytta över inköpen',
    modal: 'move',
  },
  {
    id: 2,
    title: 'Tjänstepension-fönster öppet',
    description: 'Du är nära brytpunkten för statlig skatt. Genom att sätta in 3 000 kr/mån i tjänstepension sänker du din skattskyldighet med upp till 1 080 kr/mån.',
    saving: 1080,
    action: 'Beräkna optimal insättning',
    modal: 'pension',
  },
  {
    id: 3,
    title: 'Hemmakontor-avdrag missat',
    description: 'Baserat på din profil arbetar du troligen hemma. Du kan dra av en del av boendekostnaden — estimerat 4 800 kr/år.',
    saving: 4800,
    action: 'Aktivera hemmakontor-avdrag',
    modal: 'homeoffice',
  },
];

export default function TaxOptimizer() {
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [dismissed, setDismissed] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'move' | 'pension' | 'homeoffice'
  const [secured, setSecured] = useState({}); // { id: actualSaving }

  const handleConfirm = (id, actualSaving) => {
    setSecured(prev => ({ ...prev, [id]: actualSaving }));
    setActiveModal(null);
    // remove from list after short delay to show the "secured" feedback
    setTimeout(() => setSuggestions(prev => prev.filter(s => s.id !== id)), 1400);
  };

  const handleDismiss = (id) => setSuggestions(prev => prev.filter(s => s.id !== id));

  if (suggestions.length === 0 || dismissed) return null;

  const totalSaving = suggestions.reduce((sum, s) => sum + s.saving, 0);
  const modalSuggestion = suggestions.find(s => s.modal === activeModal);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
      >
        <div className="px-5 pt-4 pb-3 flex items-center gap-3"
          style={{ borderBottom: '1px solid #F0F2F5' }}>
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,115,119,0.1)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#0D7377' }} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Skatteoptimering</p>
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

        <div className="px-5 py-4 space-y-3">
          <AnimatePresence>
            {suggestions.map(s => (
              <motion.div
                key={s.id}
                layout
                exit={{ opacity: 0, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                transition={{ duration: 0.25 }}
                className="p-4 rounded-2xl overflow-hidden"
                style={{ background: '#F4F6F8' }}
              >
                {secured[s.id] ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-center gap-2 py-1">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: '#0D7377' }} />
                    <p className="text-xs font-bold" style={{ color: '#0D7377' }}>
                      Klart! Sparar {secured[s.id].toLocaleString('sv-SE')} kr — säkrat
                    </p>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <p className="text-sm font-bold" style={{ color: '#1A2332' }}>{s.title}</p>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'rgba(13,115,119,0.1)', color: '#0D7377' }}>
                        +{s.saving.toLocaleString('sv-SE')} kr
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed mb-3" style={{ color: '#9AA5B4' }}>
                      {s.description}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => handleDismiss(s.id)}
                        className="px-3 py-2 rounded-xl text-xs font-medium"
                        style={{ background: '#ECEEF1', color: '#9AA5B4' }}>
                        Ignorera
                      </button>
                      <button onClick={() => setActiveModal(s.modal)}
                        className="flex-1 h-9 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        style={{ background: '#0D7377', color: '#fff' }}>
                        {s.action} <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'move' && (
          <MoveExpensesModal
            onClose={() => setActiveModal(null)}
            onConfirm={(saving) => handleConfirm(1, saving)}
          />
        )}
        {activeModal === 'pension' && (
          <PensionSliderModal
            onClose={() => setActiveModal(null)}
            onConfirm={(saving) => handleConfirm(2, saving)}
          />
        )}
        {activeModal === 'homeoffice' && (
          <HomeOfficeModal
            onClose={() => setActiveModal(null)}
            onConfirm={(saving) => handleConfirm(3, saving)}
          />
        )}
      </AnimatePresence>
    </>
  );
}