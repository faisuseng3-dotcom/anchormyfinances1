import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

export default function VATShield({ vatReserved, vatDeadlines }) {
  const nearest = vatDeadlines?.[0];
  const daysUntil = nearest
    ? Math.round((new Date(nearest.date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(26,43,60,0.9) 100%)',
        border: '1px solid rgba(212,175,55,0.3)',
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)' }}>
          <Shield className="w-5 h-5" style={{ color: '#D4AF37' }} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4AF37' }}>VAT Shield</p>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Momsreservat – rörss ej</p>
        </div>
      </div>

      <p className="text-3xl font-black mb-1" style={{ color: '#F0EAD6' }}>
        {vatReserved.toLocaleString('sv-SE')} <span className="text-lg font-normal" style={{ color: '#D4AF37' }}>kr</span>
      </p>

      {nearest && (
        <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(0,0,0,0.25)' }}>
          <div className="flex items-center justify-between">
            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{nearest.label}</p>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                background: daysUntil <= 7 ? 'rgba(201,64,64,0.3)' : 'rgba(52,168,106,0.2)',
                color: daysUntil <= 7 ? '#C94040' : '#34A86A',
              }}
            >
              {daysUntil <= 0 ? 'FÖRFALLEN' : `${daysUntil} dagar kvar`}
            </span>
          </div>
          <p className="text-sm font-bold mt-1" style={{ color: '#F0EAD6' }}>
            {nearest.amount.toLocaleString('sv-SE')} kr
          </p>
        </div>
      )}
    </motion.div>
  );
}