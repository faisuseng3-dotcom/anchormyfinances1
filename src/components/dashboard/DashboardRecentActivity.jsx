// @ts-nocheck
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import TintIconCard from '@/components/ui-premium/copilot/TintIconCard';
import { createPageUrl } from '@/utils';

const CATEGORY_LABELS = {
  food: 'Mat', transport: 'Transport', entertainment: 'Nöje', travel: 'Resa',
  health: 'Hälsa', home: 'Bostad', shopping: 'Shopping', income: 'Inkomst',
  savings: 'Sparande', subscription: 'Abonnemang', other: 'Övrigt',
};

function relativeDay(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const diffDays = Math.round((today.setHours(0, 0, 0, 0) - new Date(date).setHours(0, 0, 0, 0)) / 86400000);
  if (diffDays === 0) return 'Idag';
  if (diffDays === 1) return 'Igår';
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short' });
}

/** Senaste aktivitet — kort lista i huvudflödet, länk till full historik. */
export default function DashboardRecentActivity({ transactions = [] }) {
  const navigate = useNavigate();

  const recent = useMemo(
    () => [...transactions]
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
      .slice(0, 4),
    [transactions],
  );

  if (!recent.length) return null;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="anchor-dash-heading anchor-dash-heading--section">Senaste aktivitet</h2>
        <button
          type="button"
          onClick={() => navigate(createPageUrl('TransactionHistory'))}
          className="flex items-center gap-0.5 text-[13px] font-medium text-white/45 hover:text-white/70 transition-colors"
        >
          Visa alla
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="space-y-2">
        {recent.map((tx) => {
          const isPositive = tx.amount > 0 || ['income', 'savings_withdrawal', 'transfer_to_spending'].includes(tx.type);
          return (
            <TintIconCard
              key={tx.id}
              category={tx.category || (isPositive ? 'income' : 'other')}
              title={tx.label || tx.vendor}
              subtitle={`${CATEGORY_LABELS[tx.category] || 'Övrigt'} · ${relativeDay(tx.created_date)}`}
              amount={`${isPositive ? '+' : '−'}${Math.abs(tx.amount).toLocaleString('sv-SE')} kr`}
              amountPositive={isPositive}
            />
          );
        })}
      </div>
    </section>
  );
}
