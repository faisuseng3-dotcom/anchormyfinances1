// @ts-nocheck
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { UserPlus, Send, CheckCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    <div className="dark-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus className="w-5 h-5 text-indigo-400" />
        <h3 className="font-semibold text-white">Bjud in användare</h3>
      </div>

      <p className="text-slate-400 text-sm mb-4">
        Skicka en inbjudan till någon så att de kan logga in och använda appen.
      </p>

      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="email@exempel.se"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          className="h-12 rounded-xl flex-1"
          onKeyDown={(e) => e.key === 'Enter' && handleInvite()}
        />
        <Button
          onClick={handleInvite}
          disabled={loading || success}
          className="h-12 px-5 rounded-xl bg-indigo-500 hover:bg-indigo-600"
        >
          {success ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>

      {error && <p className="text-rose-400 text-xs mt-2">{error}</p>}
      {success && <p className="text-emerald-400 text-xs mt-2">✓ Inbjudan skickad!</p>}
    </div>
  );
}