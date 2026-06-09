import React from 'react';
import { Check } from 'lucide-react';
import { createPageUrl } from '@/utils';
import DebtDashboardCard from './DebtDashboardCard';
import { DashboardListRow, DashboardSection } from './DashboardChrome';

export default function DebtCheck({ profile }) {
  if (!profile) return null;

  const loans = profile.loans || [];

  if (loans.length > 0) {
    return <DebtDashboardCard profile={profile} />;
  }

  return (
    <DashboardSection title="Skuld">
      <DashboardListRow
        href={createPageUrl('Loans')}
        leading={
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold"
            style={{ background: 'rgba(143,212,200,0.15)', color: '#8FD4C8' }}
          >
            <Check className="w-4 h-4" aria-hidden />
          </div>
        }
        title="Inget lån registrerat"
        subtitle="Lägg till under Lån om du vill jämföra räntor"
        trailing="0 kr"
      />
    </DashboardSection>
  );
}
