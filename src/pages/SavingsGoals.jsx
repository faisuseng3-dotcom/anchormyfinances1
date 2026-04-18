import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowLeft, PiggyBank, Pencil } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import GoalCard from '@/components/savings/GoalCard';

const EMOJIS = ['🎯','✈️','🏠','🚗','💻','🎓','🌍','🎵','💍','🏖️','📱','🎮'];

function EditGoalModal({ profile, onSave, onClose }) {
  const [name, setName] = useState(profile?.savingsGoalName || '');
  const [target, setTarget] = useState(profile?.savingsGoal ? String(profile.savingsGoal) : '');
  const [emoji, setEmoji] = useState(profile?.savingsGoalEmoji || '🎯');

  const handleSave = () => {
    const t = parseFloat(target.replace(',', '.'));
    if (!name || isNaN(t)) return;
    onSave({ savingsGoalName: name, savingsGoal: t, savingsGoalEmoji: emoji });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md rounded-t-3xl p-6 pb-10"
          style={{ background: 'var(--color-card)' }}
          onClick={e => e.stopPropagation()}
        >
          <h2 className="text-xl font-black mb-5" style={{ color: 'var(--color-text-primary)' }}>Redigera sparmål</h2>

          {/* Emoji picker */}
          <p className="text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Välj ikon</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)}
                className="text-2xl w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: emoji === e ? 'rgba(13,115,119,0.15)' : 'var(--color-surface)', border: emoji === e ? '2px solid var(--color-accent)' : '2px solid transparent' }}>
                {e}
              </button>
            ))}
          </div>

          <p className="text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Namn på målet</p>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="t.ex. Resa till Japan"
            className="w-full px-4 py-3 rounded-2xl mb-4 text-sm font-semibold outline-none"
            style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1.5px solid var(--color-accent)' }} />

          <p className="text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>Målbelopp (kr)</p>
          <input value={target} onChange={e => setTarget(e.target.value)} type="number" placeholder="0"
            className="w-full px-4 py-3 rounded-2xl mb-6 text-sm font-semibold outline-none"
            style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1.5px solid var(--color-accent)' }} />

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-2xl font-semibold text-sm" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)' }}>Avbryt</button>
            <button onClick={handleSave} className="flex-1 py-3 rounded-2xl font-bold text-sm text-white" style={{ background: 'var(--color-accent)' }}>Spara</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function SavingsGoals() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const handleSaveGoal = async (data) => {
    if (!profile) return;
    await base44.entities.FinancialProfile.update(profile.id, data);
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    setShowEdit(false);
  };

  const handleUpdated = () => {
    queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
  };

  return (
    <div className="min-h-screen pb-32" style={{ background: 'var(--color-background-primary)' }}>
      <div className="px-5 pt-8 pb-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-muted)' }}>
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Tillbaka</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest mb-1" style={{ color: 'var(--color-text-muted)' }}>Sparande</p>
            <h1 className="text-3xl font-black" style={{ color: 'var(--color-text-primary)' }}>Mina mål</h1>
          </div>
          {profile?.savingsGoal && (
            <button onClick={() => setShowEdit(true)} className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
              <Pencil className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          )}
        </div>
      </div>

      {profile?.savingsGoal ? (
        <GoalCard profile={profile} onUpdated={handleUpdated} />
      ) : (
        <div className="mx-5 rounded-2xl p-8 flex flex-col items-center text-center"
          style={{ background: 'var(--color-card)', border: '1px solid rgba(0,0,0,0.06)' }}>
          <PiggyBank className="w-12 h-12 mb-4" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-bold text-lg mb-1" style={{ color: 'var(--color-text-primary)' }}>Inget sparmål ännu</p>
          <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>Sätt upp ditt första mål för att börja följa dina framsteg.</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setShowEdit(true)}
            className="px-6 py-3 rounded-2xl font-bold text-sm text-white" style={{ background: 'var(--color-accent)' }}>
            Skapa sparmål
          </motion.button>
        </div>
      )}

      {showEdit && profile && (
        <EditGoalModal profile={profile} onSave={handleSaveGoal} onClose={() => setShowEdit(false)} />
      )}
    </div>
  );
}