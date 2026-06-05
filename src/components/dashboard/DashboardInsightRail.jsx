import React from 'react';
import SubscriptionScannerCard from '@/components/anchorBrain/SubscriptionScannerCard';
import ContextualLessonLink from '@/components/anchorBrain/ContextualLessonLink';
import { dashRail } from '@/lib/dashboardTheme';

export default function DashboardInsightRail({ profile, transactions, onLessonComplete }) {
  return (
    <div className="space-y-3">
      <div className={dashRail}>
        <SubscriptionScannerCard variant="rail" profile={profile} transactions={transactions} />
      </div>
      <ContextualLessonLink
        profile={profile}
        transactions={transactions}
        onLessonComplete={onLessonComplete}
        className="px-1"
      />
    </div>
  );
}
