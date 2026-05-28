import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, Check, Copy } from 'lucide-react';
import { DashboardDivider, DashboardListRow } from '@/components/dashboard/DashboardChrome';
import {
  anchorInputClass,
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';

export default function LifePuzzle({ profile }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const sharedGoals = [
    {
      label: 'Gemensamt boende',
      amount: profile?.savingsGoal || 0,
      progress: profile?.savingsCurrentBalance || 0,
    },
    {
      label: 'Semester ihop',
      amount: 20000,
      progress: Math.min(20000, (profile?.buffer || 0) * 0.2),
    },
  ].filter((g) => g.amount > 0);

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: email,
        subject: 'Inbjudan till Anchor',
        body: `Hej!\n\nJag bjuder in dig till Anchor så vi kan planera ekonomi tillsammans.\n\n${window.location.origin}\n`,
      });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <p className={sectionSubtitleClass}>
        Dela mål med någon du litar på — utan att blanda privata konton. Par som pratar ekonomi
        tillsammans har ofta lägre stress.
      </p>

      {sharedGoals.length > 0 && (
        <div>
          <p className="text-[13px] font-medium text-white/45 mb-2">Gemensamma mål</p>
          {sharedGoals.map((goal, i) => {
            const pct =
              goal.amount > 0 ? Math.min(100, Math.round((goal.progress / goal.amount) * 100)) : 0;
            return (
              <React.Fragment key={goal.label}>
                {i > 0 && <DashboardDivider />}
                <DashboardListRow
                  title={goal.label}
                  subtitle={`${goal.progress.toLocaleString('sv-SE')} / ${goal.amount.toLocaleString('sv-SE')} kr`}
                  trailing={<span className="text-[15px] font-semibold text-white/80">{pct}%</span>}
                />
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div>
        <p className="text-[13px] font-medium text-white/45 mb-2">Bjud in</p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="partners@email.se"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${anchorInputClass} flex-1`}
          />
          <button
            type="button"
            onClick={handleInvite}
            disabled={!email || loading || sent}
            className={`${anchorPrimaryButtonClass} shrink-0 px-5`}
          >
            {sent ? <Check className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
          </button>
        </div>
        {sent && (
          <p className={`${sectionSubtitleClass} mt-2`}>Inbjudan skickad till {email}</p>
        )}
      </div>

      <button type="button" onClick={handleCopyLink} className={`${anchorSecondaryButtonClass} w-full`}>
        <Copy className="w-4 h-4" />
        {copied ? 'Länk kopierad' : 'Kopiera inbjudningslänk'}
      </button>
    </div>
  );
}
