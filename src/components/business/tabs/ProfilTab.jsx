// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useModeContext } from '@/components/modes/ModeContext';
import SwipeApprove from '@/components/business/SwipeApprove';
import AuditorAccess from '@/components/business/AuditorAccess';
import CrisisMode from '@/components/business/CrisisMode';
import DataResetSection from '@/components/business/DataResetSection';
import { BusinessSection } from '@/components/business/BusinessChrome';

export default function ProfilTab({ companyName, orgNr, legalLabel, monthlyBurn }) {
  const { toggleMode } = useModeContext();

  return (
    <div className="space-y-8 pb-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-5 pt-2">
        <h1 className="text-[22px] font-semibold text-[#1A2332] tracking-tight">Profil</h1>
      </motion.div>

      <BusinessSection title="Företag">
        <p className="text-[20px] font-semibold text-[#1A2332]">{companyName}</p>
        <p className="text-[14px] text-[#9AA5B4] mt-1">
          Org.nr {orgNr} · {legalLabel}
        </p>
      </BusinessSection>

      <BusinessSection>
        <Link to="/YearEndClosing" className="block no-underline">
          <div
            className="rounded-xl px-4 py-4 flex items-center gap-3 active:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1A2332, #0D7377)' }}
          >
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-white">Compliance Pilot</p>
              <p className="text-[13px] text-white/65">Årsavslut & skattedeklaration</p>
            </div>
          </div>
        </Link>
      </BusinessSection>

      <BusinessSection>
        <SwipeApprove />
      </BusinessSection>

      <BusinessSection>
        <AuditorAccess />
      </BusinessSection>

      <BusinessSection>
        <CrisisMode monthlyBurn={monthlyBurn} />
      </BusinessSection>

      <BusinessSection title="Datahantering">
        <DataResetSection />
      </BusinessSection>

      <div className="px-5">
        <motion.button
          type="button"
          whileTap={{ scale: 0.98 }}
          onClick={toggleMode}
          className="w-full h-[52px] rounded-xl flex items-center justify-center gap-2 font-semibold text-[15px] text-white bg-[#0D7377] shadow-[0_8px_24px_rgba(13,115,119,0.25)]"
        >
          <Briefcase className="w-4 h-4" />
          Byt till Anchor Personal
        </motion.button>
      </div>
    </div>
  );
}
