// @ts-nocheck
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UserPlus, Send, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { surface } from '@/lib/designTokens';
import { anchorInputClass } from '@/lib/anchorTheme';
import AnchorPressable from '@/components/ui-premium/AnchorPressable';

export default function InviteUserSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInvite = async () => {
    if (!email || !email.includes('@')) {
      setError('Ange en giltig e-postadress');
      return;
    }
    setLoading(true);
    setError('');
    await base44.users.inviteUser(email, 'user');
    setLoading(false);
    setSuccess(true);
    setEmail('');
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className={`${surface.card} p-5`}>
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="w-5 h-5 text-[var(--color-accent)]" />
        <h3 className="anchor-type-headline">Bjud in användare</h3>
      </div>

      <p className="anchor-type-body-sm mb-4">
        Skicka en inbjudan till någon så att de kan logga in och använda appen.
      </p>

      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="email@exempel.se"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          className={`${anchorInputClass} flex-1`}
          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
        />
        <AnchorPressable
          onClick={handleInvite}
          disabled={loading || success}
          className="w-12 h-12 rounded-full bg-[var(--color-text-primary)] text-white anchor-elev-2 shrink-0"
        >
          {success ? (
            <CheckCircle className="w-5 h-5" />
          ) : loading ? (
            <div className="w-5 h-5 rounded-full skeleton" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </AnchorPressable>
      </div>

      {error && <p className="text-rose-300 text-xs mt-2">{error}</p>}
      {success && <p className="text-emerald-300 text-xs mt-2">Inbjudan skickad</p>}
    </div>
  );
}
