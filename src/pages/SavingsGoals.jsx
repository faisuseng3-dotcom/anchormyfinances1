import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import SavingsGoalsHub from '@/components/dashboard/copilot/tools/SavingsGoalsHub';

export default function SavingsGoals() {
  const { profile, updateProfile } = useFinancialProfile();
  return <SavingsGoalsHub profile={profile} updateProfile={updateProfile} />;
}

export const pageSeo = pageSeoFor('SavingsGoals');
