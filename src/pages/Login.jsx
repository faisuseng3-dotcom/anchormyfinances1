import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { pageSeoFor } from '@/lib/pageSeo';

function resolveReturnUrl(raw) {
  if (!raw) return createPageUrl('Dashboard');
  if (raw.startsWith('http')) return raw;
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const returnPath = resolveReturnUrl(
    searchParams.get('return') || searchParams.get('redirect'),
  );

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate(returnPath, { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate, returnPath]);

  const handleLogin = () => {
    const absoluteReturn = returnPath.startsWith('http')
      ? returnPath
      : `${window.location.origin}${returnPath}`;
    base44.auth.redirectToLogin(absoluteReturn);
  };

  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-6 py-12 anchor-page"
      style={{ background: 'var(--color-background-primary)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm text-center"
      >
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'var(--color-surface)' }}
        >
          <LogIn className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
        </div>

        <h1 className="text-[28px] font-semibold text-white tracking-tight">Logga in</h1>
        <p className="text-[15px] text-white/50 mt-3 leading-relaxed">
          Välkommen tillbaka. Logga in för att öppna din översikt, budget och sparverktyg.
        </p>

        <button
          type="button"
          onClick={handleLogin}
          disabled={isLoadingAuth}
          className="mt-8 w-full h-14 rounded-2xl font-semibold text-white text-[15px] flex items-center justify-center gap-2 disabled:opacity-50"
          style={{ background: 'var(--color-accent)' }}
        >
          Fortsätt till säker inloggning
          <ArrowRight className="w-4 h-4" />
        </button>

        <p className="text-[13px] text-white/40 mt-4 leading-relaxed">
          Du skickas till Anchors inloggning (e-post eller Google) och kommer tillbaka hit efteråt.
        </p>

        <div className="mt-10 pt-8 border-t border-white/[0.08] space-y-4">
          <Link
            to={createPageUrl('CreateAccount')}
            className="flex items-center justify-center gap-2 text-[15px] font-medium text-white/80 hover:text-white no-underline"
          >
            <UserPlus className="w-4 h-4" />
            Skapa nytt konto
          </Link>
          <Link
            to={createPageUrl('Landing')}
            className="block text-[13px] text-white/45 hover:text-white/70 no-underline"
          >
            Till startsidan
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export const pageSeo = pageSeoFor('Login');
