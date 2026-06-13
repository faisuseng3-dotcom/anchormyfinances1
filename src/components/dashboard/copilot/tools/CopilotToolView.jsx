import React from 'react';
import { COPILOT_VIEWS, isCopilotToolView } from '@/lib/copilotViews';
import SavingsGoalsHub from './SavingsGoalsHub';
import SubscriptionListView from './SubscriptionListView';
import SquadsHub from './SquadsHub';
import AcademyHub from './AcademyHub';

/**
 * Renderar EN verktygsvy i copilot-main.
 * subscriptions → SubscriptionListView (abonnemangslista), ALDRIG ProTools.
 */
export default function CopilotToolView({ view, profile, transactions, updateProfile }) {
  if (import.meta.env.DEV) {
    console.log('[CopilotToolView] render', { view });
  }

  if (!isCopilotToolView(view)) return null;

  if (view === COPILOT_VIEWS.subscriptions) {
    return (
      <SubscriptionListView
        profile={profile}
        updateProfile={updateProfile}
      />
    );
  }

  if (view === COPILOT_VIEWS.goals) {
    return <SavingsGoalsHub profile={profile} updateProfile={updateProfile} />;
  }

  if (view === COPILOT_VIEWS.squads) {
    return <SquadsHub />;
  }

  if (view === COPILOT_VIEWS.academy) {
    return (
      <AcademyHub
        profile={profile}
        transactions={transactions}
        updateProfile={updateProfile}
      />
    );
  }

  return null;
}
