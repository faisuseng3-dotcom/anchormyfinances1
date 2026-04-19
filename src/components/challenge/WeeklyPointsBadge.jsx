import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const COMPETITION_START = new Date('2026-03-24T00:00:00+01:00');
const COMPETITION_END   = new Date('2026-03-31T23:59:59+02:00');

function getCompetitionStatus() {
  const now = new Date();
  if (now < COMPETITION_START) return 'upcoming';
  if (now > COMPETITION_END) return 'ended';
  return 'active';
}

function getDaysLeft() {
  const now = new Date();
  const diff = COMPETITION_END - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function WeeklyPointsBadge() {
  const [points, setPoints] = useState(null);
  const status = getCompetitionStatus();

  const load = async () => {
    try {
      const user = await base44.auth.me();
      const records = await base44.entities.UserPoints.filter({ user_id: user.id });
      setPoints(records[0]?.weekly_points || 0);
    } catch {
      setPoints(0);
    }
  };

  useEffect(() => {
    load();
    const unsub = base44.entities.UserPoints.subscribe(() => load());
    return unsub;
  }, []);

  if (points === null) return null;

  if (status === 'upcoming') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-default"
        style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)' }}
        title="Anchor Challenge startar 24 mars!"
      >
        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
        <span className="text-xs font-bold text-yellow-300">Startar 24/3</span>
      </motion.div>
    );
  }

  if (status === 'ended') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-default"
        style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)' }}
        title="Tävlingen är avslutad"
      >
        <Trophy className="w-3.5 h-3.5 text-indigo-400" />
        <span className="text-xs font-bold text-indigo-300">{points.toLocaleString('sv-SE')} p</span>
      </motion.div>
    );
  }

  // Active
  const daysLeft = getDaysLeft();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-default"
      style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.4)' }}
      title={`Anchor Challenge – ${daysLeft} dagar kvar`}
    >
      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
      <span className="text-xs font-bold text-indigo-200">{points.toLocaleString('sv-SE')} p</span>
      {daysLeft <= 2 && (
        <span className="text-xs text-amber-400 font-semibold">{daysLeft}d kvar!</span>
      )}
    </motion.div>
  );
}