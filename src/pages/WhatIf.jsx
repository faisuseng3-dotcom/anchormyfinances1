import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import WhatIfEngine from '@/components/whatif/WhatIfEngine';
import PrecisionWizard from '@/components/whatif/PrecisionWizard';
import PrecisionTaxResult from '@/components/whatif/PrecisionTaxResult';
import ModeGate from '@/components/ModeGate';
import AnchorOracle from '@/components/whatif/AnchorOracle';

export default function WhatIf() {
  const [incomeChange, setIncomeChange] = useState(0);
  const [sickDays, setSickDays] = useState(0);
  const [wizardData, setWizardData] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const currentMode = profile?.mode || 'basic';

  const handleWhatIfChange = ({ incomeChange: ic, sickDays: sd }) => {
    if (ic !== undefined) setIncomeChange(ic);
    if (sd !== undefined) setSickDays(sd);
  };

  return (
    <div className="min-h-screen pb-24">
      <ModeGate feature="what_if" mode={currentMode}>
        <div className="px-5 pt-8 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <Link to={createPageUrl('Dashboard')}>
              <Button variant="ghost" size="icon" className="rounded-xl bg-white/5 hover:bg-white/10">
                <ArrowLeft className="w-5 h-5 text-slate-400" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">What-If & Skatte-Siaren</h1>
              <p className="text-sm text-slate-400">Simulera din ekonomiska framtid</p>
            </div>
          </div>

          <div className="space-y-4">
            <WhatIfEngine
              profile={profile}
              incomeChange={incomeChange}
              sickDays={sickDays}
              onChange={handleWhatIfChange}
            />
            {wizardData ? (
              <PrecisionTaxResult wizardData={wizardData} onReset={() => setWizardData(null)} />
            ) : (
              <PrecisionWizard onComplete={setWizardData} />
            )}
          </div>
        </div>
      </ModeGate>
    </div>
  );
}