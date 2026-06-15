import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { useBilling } from '@/hooks/useBilling';
import { cn } from '@/lib/utils';

export default function UpgradeButton({
  targetPlan = 'pro',
  label,
  className,
  variant = 'primary',
  onBeforeCheckout,
}) {
  const { startCheckout, isAuthenticated } = useBilling();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleClick = async (e) => {
    e.preventDefault();
    if (onBeforeCheckout?.() === false) return;
    if (!isAuthenticated) {
      navigate(createPageUrl('Login'));
      return;
    }
    setLoading(true);
    try {
      await startCheckout(targetPlan);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const text = label || 'Uppgradera';

  if (variant === 'link') {
    return (
      <Link
        to={createPageUrl('Pricing')}
        className={cn('inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)] no-underline', className)}
      >
        <Sparkles className="w-4 h-4" />
        {text}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 min-h-11 px-5 rounded-xl text-sm font-bold touch-manipulation disabled:opacity-60',
        variant === 'primary'
          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white'
          : 'bg-white/10 text-white ring-1 ring-white/15',
        className,
      )}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
      {text}
    </button>
  );
}
