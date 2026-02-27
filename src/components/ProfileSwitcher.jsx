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
    subscriptions: [
      { name: 'Spotify', amount: 119, category: 'streaming' },
      { name: 'Netflix', amount: 149, category: 'streaming' },
      { name: 'Mobilabonnemang', amount: 299, category: 'other' },
      { name: 'Gymmedlemskap', amount: 399, category: 'health' },
    ],
    loans: [],
    monthlyExpenses: [
      { name: 'ICA Supermarket', amount: 210, date: new Date().toISOString().split('T')[0], category: 'food' },
      { name: 'Pressbyrån', amount: 45, date: new Date().toISOString().split('T')[0], category: 'food' },
    ]
  },
  2: {
    name: 'Mamma',
    buffer: 8500,
    income: 29000,
    housingCost: 11500,
    subscriptions: [
      { name: 'Elavtal', amount: 1200, category: 'utilities' },
      { name: 'Hemförsäkring', amount: 250, category: 'other' },
      { name: 'Barnförsäkring', amount: 350, category: 'health' },
      { name: 'Bredband', amount: 499, category: 'other' },
      { name: 'Mobilabonnemang', amount: 399, category: 'other' },
      { name: 'Disney+', amount: 89, category: 'entertainment' },
    ],
    loans: [],
    monthlyExpenses: [
      { name: 'Willys', amount: 1450, date: new Date().toISOString().split('T')[0], category: 'food' },
      { name: 'Apoteket', amount: 320, date: new Date().toISOString().split('T')[0], category: 'health' },
    ]
  },
  3: {
    name: 'Knegare',
    buffer: 45000,
    income: 39000,
    housingCost: 12000,
    subscriptions: [
      { name: 'Bilförsäkring', amount: 450, category: 'transport' },
      { name: 'Padel-medlemskap', amount: 500, category: 'health' },
      { name: 'Storytel', amount: 179, category: 'entertainment' },
    ],
    loans: [],
    monthlyExpenses: [
      { name: 'Circle K Drivmedel', amount: 950, date: new Date().toISOString().split('T')[0], category: 'transport' },
      { name: 'Matkasse', amount: 800, date: new Date().toISOString().split('T')[0], category: 'food' },
      { name: 'Lunchrestaurang', amount: 145, date: new Date().toISOString().split('T')[0], category: 'food' },
    ]
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
              monthlyExpenses: profileData.monthlyExpenses || []
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