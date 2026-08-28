// @ts-nocheck
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import CopilotEnvelopeGoal from '@/components/ui-premium/copilot/CopilotEnvelopeGoal';
import GoalProjectionRow from '@/components/goals/GoalProjectionRow';
import DreamBuilder from '@/components/goals/DreamBuilder';
import { buildSavingsGoals } from '../copilotDashboardUtils';
import { copilotPrimaryBtnClass } from '@/lib/copilotTheme';
import { triggerHaptic } from '@/lib/haptics';
import CopilotToolShell from './CopilotToolShell';

export default function SavingsGoalsHub({ profile, updateProfile }) {
  const [createOpen, setCreateOpen] = useState(false);
  const goals = buildSavingsGoals(profile);

  if (profile?.secondaryGoalName && profile?.secondaryGoalAmount > 0) {
    goals.push({
      goalType: 'default',
      name: profile.secondaryGoalName,
      current: profile.secondaryGoalCurrent || 0,
      target: profile.secondaryGoalAmount,
      imageUrl: null,
      visualType: 'icon',
      isPrimary: false,
    });
  }

  const handleSaveGoal = async (payload) => {
    await updateProfile?.(payload);
    setCreateOpen(false);
  };

  return (
    <CopilotToolShell
      title="Sparmål"
      subtitle="Samla alla dina mål på ett ställe — framåtblick med tydlig progress."
      action={(
        <button
          type="button"
          onClick={() => { triggerHaptic('light'); setCreateOpen(true); }}
          className={`${copilotPrimaryBtnClass} !w-auto !px-5 !h-11 !text-[13px] shrink-0 flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" />
          Skapa nytt sparmål
        </button>
      )}
    >
      {goals.length === 0 ? (
        <div className="rounded-3xl border-dashed border border-[var(--color-border)] p-12 text-center">
          <p className="text-[16px] font-semibold text-[var(--color-text-primary)] mb-2">Inga sparmål ännu</p>
          <p className="text-[14px] text-[var(--copilot-text-secondary)] mb-6">
            Sätt ditt första mål — varje krona tar dig närmare det du drömmer om.
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className={`${copilotPrimaryBtnClass} !w-auto !px-6 inline-flex items-center gap-2`}
          >
            <Plus className="w-4 h-4" />
            Skapa nytt sparmål
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div key={goal.name}>
              <CopilotEnvelopeGoal
                name={goal.name}
                current={goal.current}
                target={goal.target}
                imageUrl={goal.imageUrl}
                iconId={goal.goalType || 'default'}
                visualType={goal.visualType || 'icon'}
              />
              {goal.isPrimary && <GoalProjectionRow profile={profile} />}
            </div>
          ))}
        </div>
      )}

      <DreamBuilder
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        profile={profile}
        onSave={handleSaveGoal}
      />
    </CopilotToolShell>
  );
}
