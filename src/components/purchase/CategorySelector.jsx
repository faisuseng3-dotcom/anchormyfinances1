import React from 'react';
import { motion } from 'framer-motion';
import { Car, Home, Laptop, PartyPopper } from 'lucide-react';

const categories = [
  {
    id: 'vehicle',
    name: 'Fordon',
    icon: Car,
    color: 'from-blue-500 to-cyan-600',
    description: 'Bil, MC eller annat fordon'
  },
  {
    id: 'housing',
    name: 'Boende',
    icon: Home,
    color: 'from-emerald-500 to-green-600',
    description: 'Lägenhet, villa eller hyresrätt'
  },
  {
    id: 'electronics',
    name: 'Elektronik',
    icon: Laptop,
    color: 'from-purple-500 to-pink-600',
    description: 'Dator, telefon eller gadgets'
  },
  {
    id: 'event',
    name: 'Event',
    icon: PartyPopper,
    color: 'from-amber-500 to-orange-600',
    description: 'Bröllop, fest eller stor händelse'
  }
];

export default function CategorySelector({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((cat, i) => {
        const Icon = cat.icon;
        const isSelected = selected === cat.id;
        
        return (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat.id)}
            className={`p-4 rounded-2xl border-2 transition-all ${
              isSelected
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-white/10 dark-card hover:border-white/20'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 mx-auto`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-white text-sm mb-1">{cat.name}</h3>
            <p className="text-xs text-slate-400">{cat.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
}