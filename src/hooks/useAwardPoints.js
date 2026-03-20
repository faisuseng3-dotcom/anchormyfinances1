import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const EVENT_LABELS = {
  onboarding_complete: 'Profil skapad',
  pulse_open: 'The Pulse besökt',
  expense_register: 'Köp registrerat',
  expense_categorize: 'Utgift kategoriserad',
  hero_card_click: 'Detaljvy öppnad',
  ai_coach_question: 'AI Coach använd',
  resell_scanner: 'ResellScanner använd',
  whatif_simulation: 'What-If simulering körd',
  savings_goal_setup: 'Sparmål satt upp',
};

export function useAwardPoints() {
  const awardPoints = async (eventType) => {
    try {
      const response = await base44.functions.invoke('awardPoints', { event_type: eventType });
      const { points } = response.data;
      if (points > 0) {
        toast.success(`+${points} poäng till tävlingen! 🏆`, {
          description: EVENT_LABELS[eventType] || eventType,
          duration: 3000,
          style: {
            background: 'linear-gradient(135deg, #1e1b4b, #1a2233)',
            color: '#a5b4fc',
            border: '1px solid rgba(99,102,241,0.4)',
          },
        });
      }
      return points;
    } catch {
      return 0;
    }
  };

  return { awardPoints };
}