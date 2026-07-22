import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { Loader2, Landmark, Zap, Turtle, Lock } from 'lucide-react';

const ACCOUNT_TYPES = {
  fast: {
    Icon: Zap,
    label: 'Snabbt konto',
    color: 'from-amber-500/20 to-yellow-500/10',
    border: 'rgba(245,158,11,0.3)',
    textColor: 'text-amber-300',
    tagline: 'Sparkonto med fria uttag',
    when: 'Mål inom 0–3 månader eller buffert',
  },
  trog: {
    Icon: Turtle,
    label: 'Trögt konto',
    color: 'from-blue-500/20 to-cyan-500/10',
    border: 'rgba(59,130,246,0.3)',
    textColor: 'text-blue-300',
    tagline: 'Nischbank – 1–3 dagars uttagstid',
    when: 'Mål om 3–12 månader',
  },
  last: {
    Icon: Lock,
    label: 'Låst konto / ISK',
    color: 'from-purple-500/20 to-indigo-500/10',
    border: 'rgba(139,92,246,0.3)',
    textColor: 'text-purple-300',
    tagline: 'Fasträntekonto eller ISK/aktier',
    when: 'Mål om 12+ månader',
  },
};

function getAccountType(months, isBuffer) {
  if (isBuffer || months <= 3) return 'fast';
  if (months <= 12) return 'trog';
  return 'last';
}

export function AccountTypeBadge({ months, isBuffer }) {
  const key = getAccountType(months, isBuffer);
  const t = ACCOUNT_TYPES[key];
  const Icon = t.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${t.textColor}`}
      style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'var(--anchor-shadow-1)' }}>
      <Icon className="w-3 h-3" aria-hidden /> {t.label}
    </span>
  );
}

export default function AccountTypeAdvisor({ months, isBuffer = false, goalName, goalAmount }) {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const key = getAccountType(months, isBuffer);
  const type = ACCOUNT_TYPES[key];
  const TypeIcon = type.Icon;

  useEffect(() => {
    setAdvice(null);
    setFetched(false);
  }, [months, isBuffer]);

  const fetchAdvice = async () => {
    setLoading(true);
    const horizonLabel = isBuffer ? 'buffert (trygghetskonto)' : months <= 3 ? 'kortsiktigt mål (0–3 mån)' : months <= 12 ? 'medellångt mål (3–12 mån)' : 'långsiktigt mål (12+ mån)';
    const res = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
      prompt: `Du är CFO-Analytikern i appen LAGO. Användaren har ett ${horizonLabel}: "${goalName || 'Sparmål'}" på ${goalAmount ? goalAmount.toLocaleString('sv-SE') + ' kr' : 'okänt belopp'}.

Rekommenderad kontotyp: ${type.label} (${type.tagline}).

Skriv ett kort, personligt råd på svenska (2–3 meningar) om VARFÖR just denna kontotyp passar detta mål. Fokusera på psykologi och praktik. Nämn kontotypens namn. Var varm och konkret.`,
      response_json_schema: {
        type: 'object',
        properties: { message: { type: 'string' } }
      }
    });
    setAdvice(res.message);
    setFetched(true);
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${type.color.replace('from-', '').replace(' to-', ', ')})`, boxShadow: 'var(--anchor-shadow-1)' }}
    >
      {/* Header row */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type.textColor}`}
            style={{ background: 'rgba(255,255,255,0.08)' }}>
            <TypeIcon className="w-5 h-5" aria-hidden />
          </div>
          <div>
            <p className={`text-sm font-bold ${type.textColor}`}>{type.label}</p>
            <p className="text-xs text-slate-400">{type.tagline}</p>
          </div>
        </div>
        <p className="text-xs text-slate-500">{type.when}</p>
      </div>

      {/* AI advice */}
      <div className="px-4 pb-4">
        {!fetched && !loading && (
          <button onClick={fetchAdvice}
            className={`w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${type.textColor}`}
            style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'var(--anchor-shadow-1)' }}>
            <Landmark className="w-3.5 h-3.5" />
            Få råd om kontotyp
          </button>
        )}

        {loading && (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            <span className="text-xs text-slate-400">Analyserar…</span>
          </div>
        )}

        <AnimatePresence>
          {advice && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-2 mt-1">
              <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Landmark className="w-3.5 h-3.5 text-white/70" />
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">{advice}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
