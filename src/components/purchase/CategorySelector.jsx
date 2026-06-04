import React from 'react';
import { Car, Home, Laptop, PartyPopper } from 'lucide-react';
import { DashboardDivider, DashboardListRow } from '@/components/dashboard/DashboardChrome';

const categories = [
  { id: 'vehicle', name: 'Fordon', icon: Car, description: 'Bil, MC eller annat fordon' },
  { id: 'housing', name: 'Boende', icon: Home, description: 'Lägenhet, villa eller hyresrätt' },
  { id: 'electronics', name: 'Elektronik', icon: Laptop, description: 'Dator, telefon eller liknande' },
  { id: 'event', name: 'Event', icon: PartyPopper, description: 'Bröllop, fest eller större tillställning' },
];

export default function CategorySelector({ selected, onSelect }) {
  return (
    <div>
      {categories.map((cat, i) => {
        const Icon = cat.icon;
        const isSelected = selected === cat.id;
        return (
          <React.Fragment key={cat.id}>
            {i > 0 && <DashboardDivider />}
            <DashboardListRow
              onClick={() => onSelect(cat.id)}
              leading={
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                    isSelected
                      ? 'bg-[#6B9FFF]/20 border-[#6B9FFF]/40'
                      : 'bg-[#6B9FFF]/10 border-white/[0.08]'
                  }`}
                >
                  <Icon className="w-5 h-5 text-[#9FB5FF]" />
                </div>
              }
              title={cat.name}
              subtitle={cat.description}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}
