import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Briefcase, Building2, FlaskConical } from 'lucide-react';
import { useModeContext } from '@/components/modes/ModeContext';
import { SIMULATED_BUSINESS, calcMonthlyBurn } from '@/components/business/BusinessData';
import VATShield from '@/components/business/VATShield';
import RunwayEngine from '@/components/business/RunwayEngine';
import InvoiceList from '@/components/business/InvoiceList';
import DeductibleTransactions from '@/components/business/DeductibleTransactions';
import AutonomousBookkeeping from '@/components/business/AutonomousBookkeeping';
import TaxOptimizer from '@/components/business/TaxOptimizer';

const biz = SIMULATED_BUSINESS;
const monthlyBurn = calcMonthlyBurn(biz);

export default function BusinessDashboard() {
  const { toggleMode } = useModeContext();
  const [simulated] = useState(true); // Always simulated for now

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-background-primary)' }}>
      {/* Simulated data banner */}
      {simulated && (
        <motion.div
          initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 px-4 py-2"
          style={{ background: 'rgba(212,175,55,0.15)', borderBottom: '1px solid rgba(212,175,55,0.25)' }}
        >
          <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#D4AF37' }} />
          <p className="text-xs font-medium" style={{ color: '#D4AF37' }}>
            Demo-läge — Simulerad företagsdata (Fortnox-koppling ej aktiv)
          </p>
        </motion.div>
      )}

      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)' }}>
            <Building2 className="w-5 h-5" style={{ color: '#D4AF37' }} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#D4AF37' }}>Anchor Business</p>
            <h1 className="text-xl font-black tracking-tight" style={{ color: '#F0EAD6' }}>{biz.companyName}</h1>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Org.nr {biz.orgNr}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={createPageUrl('Settings')}>
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-surface)' }}>
              <Settings className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </Link>
        </div>
      </div>

      {/* Bank balance hero */}
      <div className="px-5 mb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, #1A2B3C 0%, #0D1B2A 100%)',
            border: '1.5px solid rgba(212,175,55,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>
            Tillgänglig kassabalans
          </p>
          <p className="text-4xl font-black mb-0.5" style={{ color: '#F0EAD6' }}>
            {(biz.bankBalance - biz.vatReserved).toLocaleString('sv-SE')}
            <span className="text-xl font-normal ml-2" style={{ color: '#9BADB8' }}>kr</span>
          </p>
          <p className="text-xs" style={{ color: 'rgba(155,173,184,0.7)' }}>
            Totalt: {biz.bankBalance.toLocaleString('sv-SE')} kr · Momsreservat exkluderat
          </p>
        </motion.div>
      </div>

      <div className="px-5 space-y-4">
        {/* VAT Shield */}
        <VATShield vatReserved={biz.vatReserved} vatDeadlines={biz.vatDeadlines} />

        {/* Runway Engine */}
        <RunwayEngine
          runwayMonths={biz.runwayMonths}
          runwayData={biz.runwayData}
          monthlyBurn={monthlyBurn}
        />

        {/* Unpaid invoices */}
        <InvoiceList invoices={biz.unpaidInvoices} />

        {/* Tax Optimizer AI */}
        <TaxOptimizer />

        {/* Autonomous Bookkeeping */}
        <AutonomousBookkeeping />

        {/* Deductible transactions */}
        <DeductibleTransactions transactions={biz.recentTransactions} />

        {/* Switch to Personal */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={toggleMode}
          className="w-full rounded-2xl p-4 flex items-center justify-center gap-3"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Briefcase className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            Byt till Anchor Personal
          </span>
        </motion.button>
      </div>
    </div>
  );
}