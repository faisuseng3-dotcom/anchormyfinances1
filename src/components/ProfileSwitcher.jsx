import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const profiles = {
  1: {
    name: 'Student',
    buffer: 2100,
    income: 13000,
    housingCost: 6500,
    subscriptions: [],
    loans: []
  },
  2: {
    name: 'Mamma',
    buffer: 8500,
    income: 29000,
    housingCost: 13500,
    subscriptions: [],
    loans: []
  },
  3: {
    name: 'Knegare',
    buffer: 45000,
    income: 39000,
    housingCost: 11000,
    subscriptions: [],
    loans: []
  }
};

export default function ProfileSwitcher() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleKeyPress = async (e) => {
      // Check for Ctrl+1, Ctrl+2, or Ctrl+3
      if (e.ctrlKey && ['1', '2', '3'].includes(e.key)) {
        e.preventDefault();
        
        const profileKey = parseInt(e.key);
        const profileData = profiles[profileKey];

        try {
          // Get current profile
          const existingProfiles = await base44.entities.FinancialProfile.list();
          
          if (existingProfiles.length > 0) {
            const currentProfile = existingProfiles[0];
            
            // Update profile
            await base44.entities.FinancialProfile.update(currentProfile.id, {
              buffer: profileData.buffer,
              income: profileData.income,
              housingCost: profileData.housingCost,
              subscriptions: profileData.subscriptions,
              loans: profileData.loans,
              monthlyExpenses: [] // Reset expenses
            });

            // Invalidate queries to refresh UI
            queryClient.invalidateQueries({ queryKey: ['financialProfile'] });

            toast.success(`Profil bytt till: ${profileData.name}`, {
              description: `Saldo: ${profileData.buffer.toLocaleString()} kr | Inkomst: ${profileData.income.toLocaleString()} kr`,
              duration: 3000
            });
          }
        } catch (error) {
          console.error('Failed to switch profile:', error);
          toast.error('Kunde inte byta profil');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [queryClient]);

  return null;
}