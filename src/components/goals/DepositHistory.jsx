import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

export default function DepositHistory({ goalName, type = 'savings', compact = false }) {
  const queryClient = useQueryClient();

  const { data: deposits = [] } = useQuery({
    queryKey: ['deposits', type, goalName],
    queryFn: async () => {
      const filter = type === 'buffer' ? { type: 'buffer' } : { type: 'savings', goalName };
      const all = await base44.entities.SavingsDeposit.filter(filter, '-created_date', 20);
      return all;
    }
  });

  const verifyMutation = useMutation({
    mutationFn: (id) => base44.entities.SavingsDeposit.update(id, { verified: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['deposits'] })
  });

  if (deposits.length === 0) return null;

  const total = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="space-y-2">
      {!compact && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest">Historik</p>
          <p className="text-xs text-emerald-400 font-bold">+{total.toLocaleString('sv-SE')} kr totalt</p>
        </div>
      )}
      <div className="space-y-1.5 max-h-48 overflow-y-auto">
        {deposits.map((dep, i) => (
          <motion.div
            key={dep.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-2.5 rounded-xl"
            style={{
              background: dep.verified ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${dep.verified ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`
            }}
          >
            {/* Verify button */}
            <button
              onClick={() => !dep.verified && verifyMutation.mutate(dep.id)}
              className="flex-shrink-0"
            >
              {dep.verified
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                : <Circle className="w-4 h-4 text-slate-500 hover:text-slate-300" />
              }
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-semibold ${dep.verified ? 'text-emerald-300' : 'text-white'}`}>
                  +{(dep.amount || 0).toLocaleString('sv-SE')} kr
                </span>
                <span className="text-xs text-slate-500">
                  {dep.created_date
                    ? format(new Date(dep.created_date), 'd MMM', { locale: sv })
                    : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {dep.source || 'Manuell insättning'}
                {dep.note ? ` · ${dep.note}` : ''}
                {dep.verified && <span className="ml-1 text-emerald-500 inline-flex items-center gap-0.5">· Verifierad <CheckCircle2 className="w-3 h-3 inline" aria-hidden /></span>}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}