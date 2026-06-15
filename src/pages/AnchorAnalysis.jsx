import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import AIGuru from '@/components/protools/mastery/AIGuru';
import VoiceAssistant from '@/components/layout/VoiceAssistant';

export default function AnchorAnalysis() {
  const { profile, isLoading } = useFinancialProfile();
  const [voiceOpen, setVoiceOpen] = React.useState(false);

  React.useEffect(() => {
    const open = () => setVoiceOpen(true);
    window.addEventListener('anchor:open-voice', open);
    return () => window.removeEventListener('anchor:open-voice', open);
  }, []);

  if (isLoading) return null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-white">AI-Coach</h1>
        <p className="text-[14px] text-[var(--copilot-text-secondary)] mt-1">
          Personliga råd utifrån din marginal, mål och humör — på svenska.
        </p>
      </div>
      <div className="app-shell-card p-5">
        <AIGuru profile={profile} />
      </div>
      <button
        type="button"
        className="app-shell-btn w-full"
        onClick={() => setVoiceOpen(true)}
      >
        Prata med coachen
      </button>
      <VoiceAssistant isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
    </div>
  );
}

export const pageSeo = pageSeoFor('AnchorAnalysis');
