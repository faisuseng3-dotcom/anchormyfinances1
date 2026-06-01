import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Copy, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function SquadJoinCard({ squads = [] }) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState('');

  const joinSquad = useMutation({
    mutationFn: async (inviteCode) => {
      const user = await base44.auth.me();
      const normalized = inviteCode.trim().toUpperCase();
      const match = squads.find((s) => s.invite_code === normalized);
      if (!match) throw new Error('Ingen squad med den koden hittades.');
      const memberIds = [...new Set([...(match.member_ids || []), user.id])];
      await base44.entities.Squad.update(match.id, { member_ids: memberIds });
      return match;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['squads'] });
      setCode('');
      toast.success('Du gick med i squaden!');
    },
    onError: (err) => {
      toast.error(err.message || 'Kunde inte gå med.');
    },
  });

  const copyCode = (inviteCode) => {
    if (!inviteCode) return;
    navigator.clipboard?.writeText(inviteCode);
    toast.success('Inbjudningskod kopierad');
  };

  return (
    <div
      className="rounded-2xl p-4 mb-4"
      style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4" style={{ color: 'var(--color-accent)' }} />
        <p className="text-sm font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Bjud in partner eller vän
        </p>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Dela din squad-kod eller gå med i någon annans med deras kod.
      </p>
      <div className="flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="KOD"
          maxLength={8}
          className="flex-1 h-11 px-3 rounded-xl text-sm font-mono tracking-widest uppercase"
          style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <button
          type="button"
          onClick={() => joinSquad.mutate(code)}
          disabled={!code.trim() || joinSquad.isPending}
          className="px-4 h-11 rounded-xl text-sm font-bold text-white"
          style={{ background: 'var(--color-accent)' }}
        >
          Gå med
        </button>
      </div>
      {squads[0]?.invite_code && (
        <button
          type="button"
          onClick={() => copyCode(squads[0].invite_code)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium"
          style={{ color: 'var(--color-accent)' }}
        >
          <Copy className="w-3.5 h-3.5" />
          Kopiera din kod: {squads[0].invite_code}
        </button>
      )}
    </div>
  );
}
