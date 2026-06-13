import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { pageSeoFor } from '@/lib/pageSeo';
import { mapAuthError } from '@/lib/authErrors';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { copilotInputClass } from '@/lib/copilotTheme';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get('token') || searchParams.get('reset_token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetToken) {
      setError('Återställningslänken saknar token. Begär en ny länk.');
      return;
    }
    if (password.length < 8) {
      setError('Lösenordet måste vara minst 8 tecken.');
      return;
    }
    if (password !== confirm) {
      setError('Lösenorden matchar inte.');
      return;
    }

    setLoading(true);
    try {
      await base44.auth.resetPassword({ resetToken, newPassword: password });
      navigate(createPageUrl('Login'), {
        replace: true,
        state: { message: 'Lösenordet är uppdaterat. Logga in med ditt nya lösenord.' },
      });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      icon={Lock}
      title="Nytt lösenord"
      subtitle="Välj ett nytt lösenord för ditt konto."
      footer={(
        <div className="mt-10 pt-8 border-t border-white/[0.08] text-center">
          <Link
            to={createPageUrl('ForgotPassword')}
            className="text-[13px] text-white/45 hover:text-white/70 no-underline"
          >
            Begär ny återställningslänk
          </Link>
        </div>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-white/50 text-sm">Nytt lösenord</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={copilotInputClass}
            placeholder="Minst 8 tecken"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/50 text-sm">Bekräfta lösenord</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={copilotInputClass}
            placeholder="Samma lösenord igen"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-14 rounded-2xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: 'var(--color-accent)' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Spara nytt lösenord'}
        </button>
      </form>
    </AuthPageShell>
  );
}

export const pageSeo = pageSeoFor('ResetPassword');
