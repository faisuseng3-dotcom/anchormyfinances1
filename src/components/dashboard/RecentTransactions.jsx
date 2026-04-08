import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronRight } from 'lucide-react';

const CATEGORY_COLORS = {
  food: '#4B7CF3', transport: '#3DAA7A', entertainment: '#C8923A',
  travel: '#7C6CF3', health: '#3DAABB', home: '#5C7CF3',
  shopping: '#B06CF3', income: '#3DAA7A', savings: '#3DAA7A', other: '#8B97A8'
};

function formatRelativeDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const diff = Math.floor((today - d) / 86400000);
  if (diff === 0) return 'Idag';
  if (diff === 1) return 'Igår';
  return d.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

export default function RecentTransactions() {
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 3),
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl skeleton" />)}
      </div>
    );
  }

  if (transactions.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-muted)' }}>
          Senaste
        </p>
        <Link to={createPageUrl('TransactionHistory')}>
          <span className="text-xs flex items-center gap-0.5" style={{ color: 'var(--color-accent)' }}>
            Visa alla <ChevronRight className="w-3 h-3" />
          </span>
        </Link>
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid rgba(255,255,255,0.07)' }}>
        {transactions.map((tx, i) => {
          const isPositive = tx.amount > 0 || ['income', 'savings_withdrawal', 'transfer_to_spending'].includes(tx.type);
          const color = CATEGORY_COLORS[tx.category] || '#8B97A8';
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-4 px-5 py-4"
              style={{ borderBottom: i < transactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text-primary)' }}>
                  {tx.vendor || tx.label}
                </p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {formatRelativeDate(tx.created_date)}
                </p>
              </div>
              <p className="text-sm font-bold flex-shrink-0" style={{ color: isPositive ? 'var(--color-success)' : 'var(--color-text-primary)' }}>
                {isPositive ? '+' : '-'}{Math.abs(tx.amount).toLocaleString('sv-SE')} kr
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}