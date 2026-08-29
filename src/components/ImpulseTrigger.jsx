import React, { useEffect, useState } from 'react';
import { AlertTriangle, Lightbulb, Wallet, TrendingUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import AINotificationOverlay from './anchorBrain/AINotificationOverlay';
import ImpactAnalysisModal from './anchorBrain/ImpactAnalysisModal';
import NegotiationHubModal from './anchorBrain/NegotiationHubModal';
import WealthOptimizerModal from './anchorBrain/WealthOptimizerModal';

// Notification configs per trigger
function getImpulseNotif(personaName) {
  const configs = {
    Student: {
      icon: AlertTriangle,
      badge: 'VÄKTAREN',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      accentColor: '#EF4444',
      headline: 'Stopp! Budget i riskzonen',
      message: 'Det här köpet på 800 kr innebär att du har 0 kr kvar den 20:e. Vill du verkligen prioritera detta över mat?',
      actionLabel: 'Analysera mer',
      type: 'impulse'
    },
    Mamma: {
      icon: AlertTriangle,
      badge: 'VÄKTAREN',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      accentColor: '#F59E0B',
      headline: 'Tänk efter!',
      message: '800 kr är 15% av din kvarvarande buffert denna månad. Din Resilience Score sjönk från 40 till 37.',
      actionLabel: 'Analysera mer',
      type: 'impulse'
    },
    Knegare: {
      icon: Lightbulb,
      badge: 'PRO INSIKT',
      badgeColor: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30',
      accentColor: '#6366F1',
      headline: 'Investeringstips: Alternativkostnad',
      message: '800 kr idag är 1 570 kr om 10 år. Din bil-fond backar 2 dagar.',
      actionLabel: 'Analysera mer',
      type: 'impulse'
    }
  };
  return configs[personaName] || configs.Knegare;
}

const NEGOTIATOR_NOTIF = {
  icon: Wallet,
  badge: 'FÖRHANDLAREN',
  badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  accentColor: '#10B981',
  headline: 'Pengar hittade!',
  message: 'Ditt mobilabonnemang har höjts med 49 kr/mån. Jag hittade en konkurrent som sparar dig 1 200 kr/år. Ska jag generera ett uppsägningsmejl?',
  actionLabel: 'Gör det!',
  type: 'negotiator'
};

const OPPORTUNITY_NOTIF = {
  icon: TrendingUp,
  badge: 'STRATEGEN',
  badgeColor: 'bg-[var(--color-accent)]/15 text-[var(--color-accent)] border-[var(--color-accent)]/30',
  accentColor: '#A855F7',
  headline: 'Ränte-check: 0% ränta identifierat',
  message: 'Du har 30 000 kr på ett konto med 0% ränta. Flytta till fasträntekonto: +110 kr/mån helt riskfritt. Ska jag initiera flytten?',
  actionLabel: 'Gör det!',
  type: 'opportunity'
};

function detectPersona(income) {
  if (income <= 14000) return 'Student';
  if (income <= 30000) return 'Mamma';
  return 'Knegare';
}

export default function ImpulseTrigger() {
  const queryClient = useQueryClient();
  const [notification, setNotification] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null);

  useEffect(() => {
    const handleKeyPress = async (e) => {
      if (!e.ctrlKey) return;

      const key = e.key.toLowerCase();
      if (!['k', 'n', 'j'].includes(key)) return;
      e.preventDefault();

      const profiles = await base44.entities.FinancialProfile.list();
      if (!profiles.length) return;
      const profile = profiles[0];
      setCurrentProfile(profile);

      if (key === 'k') {
        // Add impulse purchase
        const expenses = profile.monthlyExpenses || [];
        const newExpense = { name: 'Impulsköp', amount: 800, date: new Date().toISOString().split('T')[0], category: 'entertainment' };
        await base44.entities.FinancialProfile.update(profile.id, { monthlyExpenses: [...expenses, newExpense] });
        queryClient.invalidateQueries({ queryKey: ['financialProfile'] });

        const persona = detectPersona(profile.income);
        setNotification(getImpulseNotif(persona));

      } else if (key === 'n') {
        setNotification(NEGOTIATOR_NOTIF);

      } else if (key === 'j') {
        setNotification(OPPORTUNITY_NOTIF);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [queryClient]);

  const handleNotifAction = () => {
    if (!notification) return;
    setActiveModal(notification.type);
    setNotification(null);
  };

  const handleUndoImpulse = async () => {
    if (!currentProfile) return;
    const expenses = (currentProfile.monthlyExpenses || []);
    const idx = [...expenses].reverse().findIndex(e => e.name === 'Impulsköp' && e.amount === 800);
    if (idx !== -1) {
      const realIdx = expenses.length - 1 - idx;
      const updated = expenses.filter((_, i) => i !== realIdx);
      await base44.entities.FinancialProfile.update(currentProfile.id, { monthlyExpenses: updated });
      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    }
    setActiveModal(null);
  };

  const handleConfirmWealth = async () => {
    // Simulate +110 kr to buffer as symbolic action
    if (currentProfile) {
      await base44.entities.FinancialProfile.update(currentProfile.id, {
        buffer: (currentProfile.buffer || 0) + 110
      });
      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    }
    setActiveModal(null);
  };

  return (
    <>
      <AINotificationOverlay
        notification={notification}
        onAction={handleNotifAction}
        onDismiss={() => setNotification(null)}
      />

      <ImpactAnalysisModal
        isOpen={activeModal === 'impulse'}
        profile={currentProfile}
        onUndo={handleUndoImpulse}
        onAccept={() => setActiveModal(null)}
      />

      <NegotiationHubModal
        isOpen={activeModal === 'negotiator'}
        onClose={() => setActiveModal(null)}
      />

      <WealthOptimizerModal
        isOpen={activeModal === 'opportunity'}
        onConfirm={handleConfirmWealth}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}