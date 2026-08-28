import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeftRight, ShoppingBag, Upload } from 'lucide-react';
import { createPageUrl } from '@/utils';

/**
 * Snabbåtgärder direkt under saldot — det som saknades mest jämfört med
 * en riktig bankapp: inget att göra förrän man scrollar. Ersätter den
 * odefinierade flytande "+"-knappen med tydligt etiketterade genvägar.
 */
export default function DashboardQuickActions({ onAddTransaction, onTransfer }) {
  const navigate = useNavigate();

  const actions = [
    { id: 'add', label: 'Registrera', icon: Plus, onClick: onAddTransaction },
    { id: 'transfer', label: 'Flytta', icon: ArrowLeftRight, onClick: onTransfer },
    { id: 'purchase', label: 'Köpcheck', icon: ShoppingBag, onClick: () => navigate(createPageUrl('PurchaseSimulator')) },
    { id: 'import', label: 'Importera', icon: Upload, onClick: () => navigate(createPageUrl('Import')) },
  ];

  return (
    <section className="grid grid-cols-4 gap-1">
      {actions.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={a.onClick}
          className="flex flex-col items-center gap-1.5 py-1 anchor-pressable"
        >
          <span
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'var(--color-accent-soft)' }}
          >
            <a.icon size={16} style={{ color: 'var(--color-accent)' }} />
          </span>
          <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">{a.label}</span>
        </button>
      ))}
    </section>
  );
}
