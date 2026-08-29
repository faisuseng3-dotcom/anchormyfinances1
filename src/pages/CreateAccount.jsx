import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Loader2, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { pageSeoFor } from '@/lib/pageSeo';
import { mapAuthError } from '@/lib/authErrors';
import { bootstrapUserProfile } from '@/lib/authFlow';
import { useAuth } from '@/lib/AuthContext';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { copilotInputClass } from '@/lib/copilotTheme';

export const pageSeo = pageSeoFor('CreateAccount');

export default function CreateAccount() {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();
  const [phase, setPhase] = useState('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');

  const finishSignup = async (userEmail, userPassword) => {
    await base44.auth.loginViaEmailPassword(userEmail, userPassword);
    await checkAppState();
    if (name.trim()) {
      await base44.auth.updateMe({ full_name: name.trim() });
    }
    await bootstrapUserProfile();
    base44.analytics.track({ eventName: 'account_created' });
    navigate(createPageUrl('Onboarding'), { replace: true });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!name.trim()) {
      setError('Ange ditt namn.');
      return;
    }
    if (!email.trim()) {
      setError('Ange din e-postadress.');
      return;
    }
    if (password.length < 8) {
      setError('Lösenordet måste vara minst 8 tecken.');
      return;
    }

    setLoading(true);
    try {
      await base44.auth.register({ email: email.trim(), password });
      setInfo('Vi skickade en verifieringskod till din e-post.');
      setPhase('otp');
    } catch (err) {
      const message = mapAuthError(err);
      if (message.includes('redan ett konto')) {
        setError(message);
      } else {
        try {
          await finishSignup(email.trim(), password);
          return;
        } catch (loginErr) {
          if (loginErr?.status === 403) {
            setInfo('Kontot finns men behöver verifieras. Ange koden från e-post.');
            setPhase('otp');
          } else {
            setError(mapAuthError(loginErr));
          }
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('Ange koden från e-post.');
      return;
    }

    setLoading(true);
    try {
      await base44.auth.verifyOtp({ email: email.trim(), otpCode: otp.trim() });
      await finishSignup(email.trim(), password);
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await base44.auth.resendOtp(email.trim());
      setInfo('Ny kod skickad till din e-post.');
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  if (phase === 'otp') {
    return (
      <AuthPageShell
        icon={Mail}
        title="Verifiera e-post"
        subtitle={`Ange den 6-siffriga koden vi skickade till ${email}`}
        footer={(
          <button
            type="button"
            onClick={() => { setPhase('form'); setOtp(''); setError(''); }}
            className="text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] bg-transparent border-0 cursor-pointer"
          >
            ← Tillbaka till registrering
          </button>
        )}
      >
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[var(--color-text-secondary)] text-sm">Verifieringskod</Label>
            <Input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={`${copilotInputClass} text-center tracking-[0.3em] text-lg`}
              placeholder="123456"
            />
          </div>

          {info && (
            <p className="text-sm text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
              {info}
            </p>
          )}
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
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verifiera och fortsätt'}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading}
            className="w-full text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] bg-transparent border-0 cursor-pointer"
          >
            Skicka ny kod
          </button>
        </form>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell
      icon={UserPlus}
      title="Skapa konto"
      subtitle="Kom igång gratis. Efter registrering guidar vi dig genom några snabba steg."
      footer={(
        <div className="mt-10 pt-8 border-t border-[var(--color-border)] space-y-4 text-center">
          <Link
            to={createPageUrl('Login')}
            className="block text-[15px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline"
          >
            Har du redan konto? Logga in
          </Link>
          <Link
            to={createPageUrl('Landing')}
            className="block text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] no-underline"
          >
            Till startsidan
          </Link>
        </div>
      )}
    >
      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[var(--color-text-secondary)] text-sm">Namn</Label>
          <Input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={copilotInputClass}
            placeholder="Förnamn Efternamn"
          />
        </div>

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

        <div className="space-y-1.5">
          <Label className="text-[var(--color-text-secondary)] text-sm">Lösenord</Label>
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={copilotInputClass}
            placeholder="Minst 8 tecken"
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
          className="w-full h-14 rounded-2xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          style={{ background: 'var(--color-accent)' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Skapa konto'}
        </button>
      </form>
    </AuthPageShell>
  );
}
