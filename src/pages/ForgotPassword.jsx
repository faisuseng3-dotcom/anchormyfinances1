import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Loader2, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { pageSeoFor } from '@/lib/pageSeo';
import { mapAuthError } from '@/lib/authErrors';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { copilotInputClass } from '@/lib/copilotTheme';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Ange din e-postadress.');
      return;
    }

    setLoading(true);
    try {
      await base44.auth.resetPasswordRequest(email.trim());
      setSent(true);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      icon={sent ? CheckCircle2 : KeyRound}
      title={sent ? 'Kolla din inkorg' : 'Glömt lösenord?'}
      subtitle={
        sent
          ? 'Om det finns ett konto med den adressen har vi skickat en länk för att återställa lösenordet.'
          : 'Ange din e-post så skickar vi en återställningslänk.'
      }
      footer={(
        <div className="mt-10 pt-8 border-t border-[var(--color-border)] space-y-4 text-center">
          <Link
            to={createPageUrl('Login')}
            className="block text-[15px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline"
          >
            ← Tillbaka till inloggning
          </Link>
        </div>
      )}
    >
      {sent ? (
        <p className="text-sm text-[var(--color-text-secondary)] text-center leading-relaxed">
          Länken går till sidan för nytt lösenord. Den kan ta någon minut att komma fram — kolla skräppost också.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[var(--color-text-secondary)] text-sm">E-post</Label>
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={copilotInputClass}
              placeholder="du@exempel.se"
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
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Skicka återställningslänk'}
          </button>
        </form>
      )}
    </AuthPageShell>
  );
}

export const pageSeo = pageSeoFor('ForgotPassword');
