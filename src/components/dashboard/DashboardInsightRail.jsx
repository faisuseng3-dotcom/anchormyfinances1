import React from 'react';
import SubscriptionScannerCard from '@/components/anchorBrain/SubscriptionScannerCard';
import AnchorAcademyCard from '@/components/anchorBrain/AnchorAcademyCard';
import { dashRail } from '@/lib/dashboardTheme';

export default function DashboardInsightRail({ profile, transactions, onLessonComplete }) {
  return (
    <div className={dashRail}>
      <SubscriptionScannerCard variant="rail" profile={profile} transactions={transactions} />
      <AnchorAcademyCard
        variant="rail"
        profile={profile}
        transactions={transactions}
        onLessonComplete={onLessonComplete}
      />
    </div>
  );
}
