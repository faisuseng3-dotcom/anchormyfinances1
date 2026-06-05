import LegacyRedirect from '@/components/nav/LegacyRedirect';
import { pageSeoFor } from '@/lib/pageSeo';

/** Legacy — sparmål styrs i Inställningar och visas på Hem. */
export default function SavingsGoals() {
  return <LegacyRedirect page="SavingsGoals" />;
}

export const pageSeo = pageSeoFor('Dashboard');
