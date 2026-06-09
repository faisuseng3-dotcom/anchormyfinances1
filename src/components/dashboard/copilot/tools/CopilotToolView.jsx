import React from 'react';
import { COPILOT_VIEWS, isCopilotToolView } from '@/lib/copilotViews';
import SavingsGoalsHub from './SavingsGoalsHub';
import SubscriptionsHub from './SubscriptionsHub';
import SquadsHub from './SquadsHub';
import AcademyHub from './AcademyHub';

/**
 * Renderar exakt en verktygsvy i copilot-main.
 * Prenumerationer → SubscriptionsHub (inte ProTools / mastery).
 */
export default function CopilotToolView({ view, profile, transactions, updateProfile }) {
  if (!isCopilotToolView(view)) return null;

  if (view === COPILOT_VIEWS.subscriptions) {
    return (
      <SubscriptionsHub
        profile={profile}
        transactions={transactions}
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
