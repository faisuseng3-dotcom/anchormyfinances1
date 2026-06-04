import React, { useState, useCallback } from 'react';
import { needsMoodCheckIn } from '@/lib/anchorBrain';
import EconomicMoodCheckIn from './EconomicMoodCheckIn';
import PengometerCard from './PengometerCard';
import SubscriptionScannerCard from './SubscriptionScannerCard';
import AnchorAcademyCard from './AnchorAcademyCard';

export default function AnchorBrainSection({ profile, transactions, updateProfile }) {
  const [moodReady, setMoodReady] = useState(() => !needsMoodCheckIn(profile));

  React.useEffect(() => {
    setMoodReady(!needsMoodCheckIn(profile));
  }, [profile?.sessionMoodDate, profile?.sessionMood]);

  const handleMood = useCallback(
    async (patch) => {
      await updateProfile?.(patch);
      setMoodReady(true);
    },
    [updateProfile],
  );

  const handleAcademy = useCallback(
    (patch) => updateProfile?.(patch),
    [updateProfile],
  );

  const toneMode = profile?.toneMode || 'normal';

  if (!profile?.onboardingCompleted) return null;

  return (
    <div className="space-y-4">
      {!moodReady && needsMoodCheckIn(profile) ? (
        <EconomicMoodCheckIn onComplete={handleMood} />
      ) : (
        <>
          <PengometerCard
            profile={profile}
            transactions={transactions}
            toneMode={toneMode}
          />
          <SubscriptionScannerCard profile={profile} transactions={transactions} />
          <AnchorAcademyCard
            profile={profile}
            transactions={transactions}
            onLessonComplete={handleAcademy}
          />
        </>
      )}
    </div>
  );
}
