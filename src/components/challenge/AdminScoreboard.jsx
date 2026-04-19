import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Download, Trophy, RefreshCw, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const COMPETITION_START = new Date('2026-03-24T00:00:00+01:00');
const COMPETITION_END   = new Date('2026-03-31T23:59:59+02:00');

const MEDAL = ['#1', '#2', '#3'];
const MEDAL_COLORS = ['#eab308', '#94a3b8', '#b45309'];

const EVENT_LABELS = {
  onboarding_complete: 'Onboarding',
  pulse_open: 'Pulse besökt',
  expense_register: 'Köp registrerat',
  expense_categorize: 'Kategori vald',
  hero_card_click: 'Hero Card',
  ai_coach_question: 'AI Coach',
  resell_scanner: 'ResellScanner',
  whatif_simulation: 'What-If simulering',
  savings_goal_setup: 'Sparmål',
};

function getCompetitionStatus() {
  const now = new Date();
  if (now < COMPETITION_START) return 'upcoming';
  if (now > COMPETITION_END) return 'ended';
  return 'active';
}

function getCountdown() {
  const now = new Date();
  const target = now < COMPETITION_START ? COMPETITION_START : COMPETITION_END;
  const diff = target - now;
  if (diff <= 0) return null;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return { d, h, m };
}

export default function AdminScoreboard() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [countdown, setCountdown] = useState(getCountdown());
  const status = getCompetitionStatus();

  // Ctrl + type "scoreboard" trigger
  useEffect(() => {
    let typed = '';
    const handleKeyDown = (e) => {
      if (!e.ctrlKey) { typed = ''; return; }
      if (e.key === 'Control') return;
      typed += e.key.toLowerCase();
      if (!'scoreboard'.startsWith(typed)) typed = e.key.toLowerCase();
      if (typed === 'scoreboard') {
        e.preventDefault();
        setOpen(true);
        typed = '';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live countdown ticker
  useEffect(() => {
    if (!open) return;
    const timer = setInterval(() => setCountdown(getCountdown()), 60000);
    return () => clearInterval(timer);
  }, [open]);

  useEffect(() => {
    if (open) fetchLeaderboard();
  }, [open]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getLeaderboard', {});
      setData(res.data);
    } catch {
      setData(null);
    }
    setLoading(false);
  };

  const handleReset = async () => {
    if (!confirm('Nollställ veckans poäng för ALLA deltagare? Detta kan inte ångras.')) return;
    setResetting(true);
    await base44.functions.invoke('resetWeeklyPoints', {});
    await fetchLeaderboard();
    setResetting(false);
  };

  const exportCSV = () => {
    if (!data) return;
    const headers = ['Rank', 'Namn', 'E-post', 'Tävlingspoäng', 'Totalpoäng'];
    const rows = data.all_users.map((u, i) => [
      i + 1,
      `"${u.user_name || 'Okänd'}"`,
      u.user_email || '',
      u.weekly_points || 0,
      u.total_points || 0,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anchor-challenge-24-31-mars-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const statusConfig = {
    upcoming: { label: 'Startar 24 mars', color: 'text-yellow-400', bg: 'rgba(234,179,8,0.12)', border: 'rgba(234,179,8,0.3)' },
    active:   { label: 'LIVE – 24/3 → 31/3', color: 'text-emerald-400', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.3)' },
    ended:    { label: 'Avslutad 31/3', color: 'text-slate-400', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' },
  }[status];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.88, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.88, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
            style={{ background: '#0b0f1c', border: '1px solid rgba(99,102,241,0.5)', boxShadow: '0 0 60px rgba(99,102,241,0.2)' }}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      Secret Scoreboard
                      <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">ADMIN</span>
                    </h2>
                    <p className="text-xs text-slate-400">{data?.total_participants || 0} deltagare</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={handleReset} disabled={resetting} className="text-slate-400 hover:text-white text-xs">
                    <RefreshCw className={`w-3.5 h-3.5 mr-1 ${resetting ? 'animate-spin' : ''}`} />
                    Nollställ
                  </Button>
                  <Button size="sm" variant="ghost" onClick={exportCSV} disabled={!data} className="text-slate-400 hover:text-white text-xs">
                    <Download className="w-3.5 h-3.5 mr-1" />
                    CSV
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setOpen(false)} className="w-8 h-8 text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Competition status banner */}
              <div
                className="flex items-center justify-between rounded-xl px-4 py-2.5"
                style={{ background: statusConfig.bg, border: `1px solid ${statusConfig.border}` }}
              >
                <div className="flex items-center gap-2">
                  <Trophy className={`w-4 h-4 ${statusConfig.color}`} />
                  <span className={`text-sm font-semibold ${statusConfig.color}`}>
                    Anchor Challenge · {statusConfig.label}
                  </span>
                </div>
                {countdown && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>
                      {status === 'upcoming' ? 'Startar om ' : 'Slutar om '}
                      {countdown.d > 0 ? `${countdown.d}d ` : ''}{countdown.h}h {countdown.m}m
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Leaderboard list */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-slate-400 text-sm">Hämtar rankning...</p>
                </div>
              ) : !data || data.leaderboard.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  {status === 'upcoming' ? 'Tävlingen startar 24 mars – inga poäng än.' : 'Inga deltagare ännu'}
                </div>
              ) : (
                data.leaderboard.map((entry, i) => (
                  <div
                    key={entry.id}
                    className="p-4 rounded-xl transition-colors"
                    style={{
                      background: i === 0 ? 'rgba(234,179,8,0.07)' : i === 1 ? 'rgba(148,163,184,0.06)' : i === 2 ? 'rgba(180,83,9,0.07)' : 'rgba(255,255,255,0.025)',
                      border: `1px solid ${i < 3 ? `${MEDAL_COLORS[i]}30` : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center flex-shrink-0">
                        <span className="text-slate-400 text-sm font-bold">{i < 3 ? MEDAL[i] : `#${i + 1}`}</span>
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{entry.user_name || 'Okänd'}</p>
                        <p className="text-xs text-slate-400 truncate">{entry.user_email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-indigo-300 text-lg">{(entry.weekly_points || 0).toLocaleString('sv-SE')} p</p>
                        <p className="text-xs text-slate-500">tot: {(entry.total_points || 0).toLocaleString('sv-SE')} p</p>
                      </div>
                    </div>

                    {entry.recent_events?.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/5 grid grid-cols-1 gap-0.5">
                        {entry.recent_events.map((ev, j) => (
                          <div key={j} className="flex justify-between text-xs text-slate-500 py-0.5">
                            <span>{EVENT_LABELS[ev.event_type] || ev.event_type} · {ev.date}</span>
                            <span className="text-emerald-400 font-medium">+{ev.points}p</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}

              {data && data.all_users.length > 10 && (
                <div className="mt-2 pt-2 border-t border-white/5">
                  <p className="text-xs text-slate-500 mb-2 px-1">Övriga deltagare</p>
                  {data.all_users.slice(10).map((entry, i) => (
                    <div key={entry.id} className="flex items-center gap-3 px-3 py-2 rounded-lg">
                      <span className="text-sm text-slate-500 w-8">#{i + 11}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300 truncate">{entry.user_name || 'Okänd'}</p>
                        <p className="text-xs text-slate-500 truncate">{entry.user_email}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-400">{(entry.weekly_points || 0).toLocaleString('sv-SE')} p</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}