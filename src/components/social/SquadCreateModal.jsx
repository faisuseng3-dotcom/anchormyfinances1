import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Calendar } from 'lucide-react';
import { SQUAD_ICON_OPTIONS, SquadIcon } from '@/lib/anchorIcons';
import { Input } from '@/components/ui/input';
import ProfileAvatar from './ProfileAvatar';

export default function SquadCreateModal({ isOpen, onClose, onSubmit, friendProfiles = [] }) {
  const [form, setForm] = useState({
    name: '',
    icon: 'rocket',
    description: '',
    goal_name: '',
    goal_amount: '',
    deadline: '',
    member_ids: [],
  });

  const toggleMember = (uid) => {
    setForm(f => ({
      ...f,
      member_ids: f.member_ids.includes(uid)
        ? f.member_ids.filter(id => id !== uid)
        : [...f.member_ids, uid],
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.goal_amount) return;
    onSubmit({
      ...form,
      goal_amount: parseInt(form.goal_amount.replace(/\s/g, '')) || 0,
    });
    setForm({ name: '', icon: 'rocket', description: '', goal_name: '', goal_amount: '', deadline: '', member_ids: [] });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-t-3xl p-6 pb-10 space-y-5"
            style={{ background: 'var(--color-card)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black" style={{ color: 'var(--color-text-primary)' }}>Skapa Squad</h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--color-surface)' }}>
                <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              </button>
            </div>

            {/* Ikonväljare */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Ikon</p>
              <div className="flex flex-wrap gap-2">
                {SQUAD_ICON_OPTIONS.map(({ id }) => (
                  <button key={id} type="button" onClick={() => setForm(f => ({ ...f, icon: id }))}
                    className="w-10 h-10 rounded-2xl flex items-center justify-center transition-all"
                    style={{ background: form.icon === id ? 'var(--color-accent)' : 'var(--color-surface)' }}>
                    <SquadIcon name={id} size={18} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Squad-namn</p>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="ex. Resa till Tokyo" className="h-11 rounded-xl text-sm" />
            </div>

            <div>
              <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Beskrivning (valfritt)</p>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Vi sparar ihop till..." className="h-11 rounded-xl text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Målbelopp (kr)</p>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <Input value={form.goal_amount} onChange={e => setForm(f => ({ ...f, goal_amount: e.target.value }))}
                    placeholder="50 000" className="pl-9 h-11 rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-text-muted)' }}>Deadline</p>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                  <Input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="pl-9 h-11 rounded-xl text-sm" />
                </div>
              </div>
            </div>

            {/* Invite friends */}
            {friendProfiles.length > 0 && (
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--color-text-muted)' }}>Bjud in vänner</p>
                <div className="space-y-2">
                  {friendProfiles.map(fp => {
                    const selected = form.member_ids.includes(fp.user_id);
                    return (
                      <button key={fp.id} onClick={() => toggleMember(fp.user_id)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                        style={{ background: selected ? 'rgba(13,115,119,0.12)' : 'var(--color-surface)', border: selected ? '1.5px solid rgba(13,115,119,0.4)' : '1px solid rgba(255,255,255,0.07)' }}>
                        <ProfileAvatar profile={fp} size={32} />
                        <p className="text-sm font-semibold flex-1" style={{ color: 'var(--color-text-primary)' }}>@{fp.username}</p>
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: selected ? '#0D7377' : 'rgba(255,255,255,0.2)', background: selected ? '#0D7377' : 'transparent' }}>
                          {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <button onClick={handleSubmit}
              disabled={!form.name || !form.goal_amount}
              className="w-full h-13 rounded-2xl text-sm font-black text-white disabled:opacity-40"
              style={{ background: 'var(--color-accent)', height: 52 }}>
              <span className="inline-flex items-center justify-center gap-2"><SquadIcon name="rocket" size={16} /> Skapa Squad</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}