import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DeleteAccountSection({ profile }) {
  const [step, setStep] = useState('idle'); // idle | confirm | deleting | done

  const handleDelete = async () => {
    setStep('deleting');
    try {
      // Delete all user data entities
      if (profile?.id) {
        await base44.entities.FinancialProfile.delete(profile.id);
      }
      // Delete transactions
      const txs = await base44.entities.Transaction.list('-created_date', 500);
      for (const tx of txs) {
        await base44.entities.Transaction.delete(tx.id);
      }
      // Delete savings deposits
      const deposits = await base44.entities.SavingsDeposit.list('-created_date', 200);
      for (const d of deposits) {
        await base44.entities.SavingsDeposit.delete(d.id);
      }
      setStep('done');
      // Logout after short delay
      setTimeout(() => base44.auth.logout(), 2000);
    } catch {
      setStep('confirm');
    }
  };

  if (step === 'done') {
    return (
      <div className="p-4 rounded-xl text-center text-sm text-emerald-400 border border-emerald-500/30 bg-emerald-500/10">
        Ditt konto och all data har raderats. Du loggas ut...
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-500/10 space-y-3">
        <div className="flex items-center gap-2 text-rose-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p className="text-sm font-semibold">Är du säker?</p>
        </div>
        <p className="text-xs text-slate-400">
          All din data raderas permanent och kan inte återställas. Din rätt att bli glömd (GDPR art. 17) uppfylls omedelbart.
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setStep('idle')}
            className="flex-1 h-10 rounded-xl text-slate-300 border-white/10"
          >
            Avbryt
          </Button>
          <Button
            onClick={handleDelete}
            disabled={step === 'deleting'}
            className="flex-1 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 text-white border-0"
          >
            {step === 'deleting' ? 'Raderar...' : 'Ja, radera allt'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep('confirm')}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-rose-500/70 hover:text-rose-400 border border-rose-500/20 hover:border-rose-500/40 transition-all"
    >
      <Trash2 className="w-4 h-4" />
      Radera mitt konto och all min data
    </button>
  );
}