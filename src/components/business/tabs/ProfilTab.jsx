import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, ChevronRight } from 'lucide-react';
import { useModeContext } from '@/components/modes/ModeContext';
import SwipeApprove from '@/components/business/SwipeApprove';
import AuditorAccess from '@/components/business/AuditorAccess';
import CrisisMode from '@/components/business/CrisisMode';
import DataResetSection from '@/components/business/DataResetSection';

export default function ProfilTab({ companyName, orgNr, legalLabel, monthlyBurn }) {
  const { toggleMode } = useModeContext();

  return (
    <div className="px-5 space-y-4">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-2xl font-black pt-2" style={{ color: '#1A2332' }}>
        Profil
      </motion.p>

      {/* Company card */}
      <div className="rounded-3xl p-5" style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <p className="text-xs font-semibold mb-1" style={{ color: '#9AA5B4' }}>Företag</p>
        <p className="text-lg font-black" style={{ color: '#1A2332' }}>{companyName}</p>
        <p className="text-sm" style={{ color: '#9AA5B4' }}>Org.nr {orgNr} · {legalLabel}</p>
      </div>

      <SwipeApprove />
      <AuditorAccess />
      <CrisisMode monthlyBurn={monthlyBurn} />

      <DataResetSection />

      <motion.button whileTap={{ scale: 0.97 }} onClick={toggleMode}
        className="w-full rounded-3xl p-4 flex items-center justify-center gap-3 font-bold text-sm"
        style={{ background: '#0D7377', color: '#fff', boxShadow: '0 4px 16px rgba(13,115,119,0.3)' }}>
        <Briefcase className="w-4 h-4" />
        Byt till Anchor Personal
      </motion.button>
    </div>
  );
}