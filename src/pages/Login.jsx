import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { LogIn, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { pageSeoFor } from '@/lib/pageSeo';
import { mapAuthError } from '@/lib/authErrors';
import { resolvePostAuthPath } from '@/lib/authFlow';
import AuthPageShell from '@/components/auth/AuthPageShell';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { copilotInputClass } from '@/lib/copilotTheme';

function resolveReturnUrl(raw) {
  if (!raw) return null;
  if (raw.startsWith('http')) {
    try {
      const url = new URL(raw);
      return `${url.pathname}${url.search}`;
    } catch {
      return createPageUrl('Dashboard');
    }
  }
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoadingAuth, checkAppState } = useAuth();
  const returnPath = resolveReturnUrl(
    searchParams.get('return') || searchParams.get('redirect'),
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(location.state?.message || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      resolvePostAuthPath().then((path) => {
        navigate(returnPath || path, { replace: true });
      });
    }
  }, [isAuthenticated, isLoadingAuth, navigate, returnPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Fyll i e-post och lösenord.');
      return;
    }

    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email.trim(), password);
      await checkAppState();
      const path = returnPath || await resolvePostAuthPath();
      navigate(path, { replace: true });
    } catch (err) {
      setError(mapAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      icon={LogIn}
      title="Logga in"
      subtitle="Välkommen tillbaka. Logga in för att öppna din översikt, budget och sparverktyg."
      footer={(
        <div className="mt-10 pt-8 border-t border-[var(--color-border)] space-y-4 text-center">
          <Link
            to={createPageUrl('CreateAccount')}
            className="block text-[15px] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] no-underline"
          >
            Skapa nytt konto
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

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-[var(--color-text-secondary)] text-sm">Lösenord</Label>
            <Link
              to={createPageUrl('ForgotPassword')}
              className="text-[13px] text-[var(--color-accent)] no-underline hover:underline"
            >
              Glömt lösenord?
            </Link>
          </div>
          <Input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={copilotInputClass}
            placeholder="••••••••"
          />
        </div>

        {success && (
          <p className="text-sm text-emerald-400/90 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
            {success}
          </p>
        )}

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || isLoadingAuth}
          className="w-full h-14 rounded-2xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          style={{ background: 'var(--color-accent)' }}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Logga in'}
        </button>
      </form>
    </AuthPageShell>
  );
}

export const pageSeo = pageSeoFor('Login');
