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
      className="rounded-3xl overflow-hidden"
      style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="px-5 pt-4 pb-3 flex items-center gap-3"
        style={{ borderBottom: '1px solid #F0F2F5' }}>
        <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
          style={{ background: 'rgba(13,115,119,0.1)' }}>
          <Shield className="w-4 h-4" style={{ color: '#0D7377' }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Momsreservat</p>
          <p className="text-xs" style={{ color: '#9AA5B4' }}>Rör ej — betalas till Skatteverket</p>
        </div>
      </div>

      <div className="px-5 py-4">
        <p className="text-3xl font-black" style={{ color: '#1A2332', letterSpacing: '-1px' }}>
          {vatReserved.toLocaleString('sv-SE')} <span className="text-base font-medium" style={{ color: '#9AA5B4' }}>kr</span>
        </p>

        {nearest && (
          <div className="mt-3 rounded-2xl p-3 flex items-center justify-between"
            style={{ background: '#F4F6F8' }}>
            <p className="text-xs font-semibold" style={{ color: '#4A5568' }}>{nearest.label}</p>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black" style={{ color: '#1A2332' }}>{nearest.amount.toLocaleString('sv-SE')} kr</p>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  background: daysUntil <= 7 ? 'rgba(229,62,62,0.1)' : 'rgba(13,115,119,0.1)',
                  color: daysUntil <= 7 ? '#E53E3E' : '#0D7377',
                }}>
                {daysUntil <= 0 ? 'Förfallen' : `${daysUntil}d`}
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}