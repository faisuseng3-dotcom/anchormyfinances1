import React, { useState, useCallback } from 'react';
import { needsMoodCheckIn } from '@/lib/anchorBrain';
import EconomicMoodCheckIn from './EconomicMoodCheckIn';
import PengometerCard from './PengometerCard';

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

  const toneMode = profile?.toneMode || 'normal';

  if (!profile?.onboardingCompleted) return null;

  if (!moodReady && needsMoodCheckIn(profile)) {
    return <EconomicMoodCheckIn onComplete={handleMood} />;
  }

  return (
    <PengometerCard profile={profile} transactions={transactions} toneMode={toneMode} />
  );
}
