import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WeeklyPointsBadge() {
  const [points, setPoints] = useState(null);

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full cursor-default"
      style={{
        background: 'rgba(99,102,241,0.12)',
        border: '1px solid rgba(99,102,241,0.3)',
      }}
      title="Dina veckopoäng i Anchor Challenge"
    >
      <Trophy className="w-3.5 h-3.5 text-indigo-400" />
      <span className="text-xs font-bold text-indigo-300">{points.toLocaleString('sv-SE')} p</span>
    </motion.div>
  );
}