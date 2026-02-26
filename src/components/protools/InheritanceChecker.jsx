import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const checklist = [
  { id: 'testament', label: 'Testament upprättat', critical: true },
  { id: 'insurance', label: 'Livförsäkring på plats', critical: true },
  { id: 'guardian', label: 'Vårdnadshavare utsedd (om barn)', critical: true },
  { id: 'assets', label: 'Lista över tillgångar & skulder', critical: false },
  { id: 'passwords', label: 'Digitala lösenord dokumenterade', critical: false },
  { id: 'funeral', label: 'Begravningsönskemål nedtecknade', critical: false }
];

export default function InheritanceChecker({ profile }) {
  const [checked, setChecked] = useState({});

  const toggle = (id) => {
    setChecked(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const criticalItems = checklist.filter(item => item.critical);
  const completedCritical = criticalItems.filter(item => checked[item.id]).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="dark-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-amber-400" />
          <h3 className="font-semibold text-white">Inheritance & Future Proofing</h3>
        </div>

        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 mb-6">
          <p className="text-sm font-semibold text-amber-400 mb-1">
            Kritiska punkter: {completedCritical}/{criticalItems.length}
          </p>
          <p className="text-xs text-slate-400">
            Säkerställ din familjs framtid
          </p>
        </div>

        <div className="space-y-3">
          {checklist.map((item) => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                checked[item.id]
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-start gap-3">
                {checked[item.id] ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    checked[item.id] ? 'text-emerald-400' : 'text-white'
                  }`}>
                    {item.label}
                  </p>
                  {item.critical && !checked[item.id] && (
                    <p className="text-xs text-rose-400 mt-1">⚠️ Kritiskt</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {completedCritical === criticalItems.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30"
          >
            <p className="text-sm text-emerald-400 font-medium">
              ✓ Alla kritiska punkter är klara! Din familj är tryggad.
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}