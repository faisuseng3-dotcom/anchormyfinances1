import { User, Briefcase, Building2, PiggyBank, Target, Landmark, CalendarDays, Smile, Frown, Zap } from 'lucide-react';

export const USER_TYPES = [
  {
    id: 'privatperson',
    label: 'Privatperson',
    description: 'Vardagsekonomi, budget och sparande',
    Icon: User,
  },
  {
    id: 'frilansare',
    label: 'Frilansare',
    description: 'Oregelbundna inkomster och egen firma',
    Icon: Briefcase,
  },
  {
    id: 'foretagare',
    label: 'Företagare',
    description: 'Enskild firma eller AB med bokföring',
    Icon: Building2,
  },
];

export const ECONOMIC_GOALS = [
  { id: 'save', label: 'Spara mer', description: 'Bygga buffert och nå sparmål', Icon: PiggyBank, mapsToGoal: 'save' },
  { id: 'control', label: 'Få kontroll', description: 'Veta vart pengarna tar vägen', Icon: Target, mapsToGoal: 'control' },
  { id: 'reduce_debt', label: 'Minska skulder', description: 'Minska lån och räntestress', Icon: Landmark, mapsToGoal: 'improve' },
  { id: 'plan_future', label: 'Planera framtiden', description: 'Förutse utgifter och månader framåt', Icon: CalendarDays, mapsToGoal: 'plan' },
];

export const ECONOMY_MOODS = [
  { id: 'calm', label: 'Lugnt', description: 'Jag har mest koll', Icon: Smile },
  { id: 'stressed', label: 'Stressad', description: 'Ekonomin känns tung just nu', Icon: Frown },
  { id: 'motivated', label: 'Motiverad', description: 'Redo att ta tag i det', Icon: Zap },
];

const GOAL_TO_CONCERN = {
  save: 'save',
  control: 'spending',
  reduce_debt: 'debt',
  plan_future: 'plan',
};

const MOOD_TO_STYLE = {
  calm: 'balanced',
  stressed: 'reassuring',
  motivated: 'energetic',
};

export function isBusinessUserType(userType) {
  return userType === 'frilansare' || userType === 'foretagare';
}

export function buildProfileFromWizard(answers) {
  const goal = ECONOMIC_GOALS.find((g) => g.id === answers.economicGoal);
  const concernId = GOAL_TO_CONCERN[answers.economicGoal] || 'spending';

  return {
    userType: answers.userType,
    economicGoal: answers.economicGoal,
    economyMood: answers.economyMood,
    persona: answers.userType,
    sessionMood: answers.economyMood,
    primaryGoal: goal?.mapsToGoal || 'control',
    userGoal: goal?.mapsToGoal || 'control',
    userGoals: goal ? [goal.mapsToGoal] : [],
    topConcern: concernId,
    communicationStyle: MOOD_TO_STYLE[answers.economyMood] || 'balanced',
  };
}
