import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import { useTransactions } from '@/hooks/useTransactions';
import AcademyHub from '@/components/dashboard/copilot/tools/AcademyHub';

export default function AnchorAcademy() {
  const { profile, updateProfile } = useFinancialProfile();
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 500 });
  return (
    <AcademyHub
      profile={profile}
      transactions={transactions}
      updateProfile={updateProfile}
    />
  );
}

export const pageSeo = pageSeoFor('AnchorAcademy');
