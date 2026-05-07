import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import GalaxyExplorer from '@/components/social/GalaxyExplorer';
import { useDemoMode } from '@/components/demo/DemoMode';
import AlexGalaxyBadge from '@/components/demo/AlexGalaxyBadge';

export default function Galaxy() {
  const { isAlexMode } = useDemoMode();
  const { data: financialProfile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    },
    enabled: !isAlexMode,
  });

  return (
    <div className="min-h-screen pb-28"
      style={{ background: 'linear-gradient(180deg, #050a15 0%, #080d1c 100%)' }}>

      {/* Stars background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {[...Array(32)].map((_, i) => (
          <motion.div key={i}
            className="absolute rounded-full"
            style={{
              width: i % 5 === 0 ? 2 : 1,
              height: i % 5 === 0 ? 2 : 1,
              top: `${(i * 43 + 7) % 100}%`,
              left: `${(i * 67 + 13) % 100}%`,
              background: '#fff',
              opacity: 0.15,
            }}
            animate={{ opacity: [0.06, 0.25, 0.06] }}
            transition={{ duration: 2 + (i % 4), repeat: Infinity, delay: (i * 0.25) % 5 }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="relative z-10 px-5 pt-10 pb-6">
        <p className="text-[9px] font-black tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
          🌌  ANCHOR GALAXY
        </p>
        <h1 className="text-2xl font-black text-white leading-tight">Hitta ekonomiska<br />tvillingar</h1>
        <p className="text-xs mt-1 font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Utforska hur andra med liknande livssituation hanterar sin ekonomi
        </p>
      </div>

      {/* Alex Galaxy Badge */}
      {isAlexMode && (
        <div className="relative z-10">
          <AlexGalaxyBadge />
        </div>
      )}

      {/* Explorer */}
      <div className="relative z-10 px-4">
        <GalaxyExplorer userFinancialProfile={financialProfile} />
      </div>
    </div>
  );
}