import React from 'react';
import { COPILOT_VIEWS } from '@/lib/copilotViews';
import SavingsGoalsHub from './SavingsGoalsHub';
import SubscriptionsHub from './SubscriptionsHub';
import SquadsHub from './SquadsHub';
import AcademyHub from './AcademyHub';

export default function CopilotToolView({ view, profile, transactions, updateProfile }) {
  switch (view) {
    case COPILOT_VIEWS.goals:
      return <SavingsGoalsHub profile={profile} updateProfile={updateProfile} />;
    case COPILOT_VIEWS.subscriptions:
      return (
        <SubscriptionsHub
          profile={profile}
          transactions={transactions}
          updateProfile={updateProfile}
        />
      );
    case COPILOT_VIEWS.squads:
      return <SquadsHub />;
    case COPILOT_VIEWS.academy:
      return (
        <AcademyHub
          profile={profile}
          transactions={transactions}
          updateProfile={updateProfile}
        />
      );
    default:
      return null;
  }
}
