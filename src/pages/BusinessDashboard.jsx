import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Briefcase, Building2, FlaskConical, BookOpen, Sparkles, Plus } from 'lucide-react';
import MagicImport from '@/components/business/MagicImport';
import ReceiptScanner from '@/components/business/ReceiptScanner';
import NetSalaryCalculator from '@/components/business/NetSalaryCalculator';
import { useModeContext } from '@/components/modes/ModeContext';
import { SIMULATED_BUSINESS, calcMonthlyBurn } from '@/components/business/BusinessData';
import VATShield from '@/components/business/VATShield';
import RunwayEngine from '@/components/business/RunwayEngine';
import InvoiceList from '@/components/business/InvoiceList';
import DeductibleTransactions from '@/components/business/DeductibleTransactions';
import AutonomousBookkeeping from '@/components/business/AutonomousBookkeeping';
import TaxOptimizer from '@/components/business/TaxOptimizer';
import TaxWidget from '@/components/business/TaxWidget';
import ManualTransactionModal from '@/components/business/ManualTransactionModal';
import DailyDigest from '@/components/business/DailyDigest';
import ActivityStream from '@/components/business/ActivityStream';
import ReviewMode from '@/components/business/ReviewMode';
import UITranslate from '@/components/business/UITranslate';
import LiquidityGauge from '@/components/business/LiquidityGauge';
import SafeToSpendCard from '@/components/business/SafeToSpendCard';
import ReceiptVault from '@/components/business/ReceiptVault';
import SwipeApprove from '@/components/business/SwipeApprove';
import AuditorAccess from '@/components/business/AuditorAccess';
import CrisisMode from '@/components/business/CrisisMode';

const biz = SIMULATED_BUSINESS;
const monthlyBurn = calcMonthlyBurn(biz);

export default function BusinessDashboard() {
  const { toggleMode } = useModeContext();
  const [simulated] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [manualTransactions, setManualTransactions] = useState([]);
  const legalEntity = localStorage.getItem('anchor_biz_legal_entity') || 'enskild';
  const legalLabel = legalEntity === 'ab' ? 'Aktiebolag (AB)' : 'Enskild firma';
  const imported = localStorage.getItem('anchor_imported') === 'true';

  return (
    <div className="min-h-screen pb-28" style={{ background: 'var(--color-background-primary)' }}>
      {/* Simulated data banner */}
      <AnimatePresence>
        {showScanner && (
          <ReceiptScanner
            onClose={() => setShowScanner(false)}
            onSave={tx => { setManualTransactions(prev => [tx, ...prev]); setShowScanner(false); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showManual && (
          <ManualTransactionModal
            onClose={() => setShowManual(false)}
            onAdd={tx => { setManualTransactions(prev => [tx, ...prev]); setShowManual(false); }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showImport && <MagicImport onClose={() => setShowImport(false)} onComplete={() => setShowImport(false)} />}
      </AnimatePresence>

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
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-0.5"
              style={{ background: legalEntity === 'ab' ? 'rgba(212,175,55,0.15)' : 'rgba(75,124,243,0.15)', color: legalEntity === 'ab' ? '#D4AF37' : '#4B7CF3', border: `1px solid ${legalEntity === 'ab' ? 'rgba(212,175,55,0.3)' : 'rgba(75,124,243,0.3)'}` }}>
              {legalLabel}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowScanner(true)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold"
            style={{ background: 'rgba(212,175,55,0.12)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.3)' }}>
            📷 Kvitto
          </button>
          <button onClick={() => setShowManual(true)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold"
            style={{ background: 'rgba(61,170,122,0.12)', color: '#3DAA7A', border: '1px solid rgba(61,170,122,0.3)' }}>
            <Plus className="w-3.5 h-3.5" />
            Ny
          </button>
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1.5 px-3 h-9 rounded-full text-xs font-bold"
            style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.35)' }}>
            <Sparkles className="w-3.5 h-3.5" />
            Importera
          </button>
          <Link to={createPageUrl('Settings')}>
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-surface)' }}>
              <Settings className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
            </button>
          </Link>
        </div>
      </div>

      {/* Contextual import greeting */}
      {imported && (
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="px-5 mb-4"
        >
          <div className="p-4 rounded-2xl flex items-start gap-3"
            style={{ background: 'rgba(75,124,243,0.08)', border: '1px solid rgba(75,124,243,0.2)' }}>
            <span className="text-xl">👋</span>
            <div>
              <p className="text-sm font-bold" style={{ color: '#F0EAD6' }}>Baserat på ditt kontoutdrag ser jag att din Runway är 5 månader.</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(155,173,184,0.6)' }}>Vill du se hur vi kan förlänga den? Scrolla ner till Runway Engine →</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Safe-to-Spend hero (Netto-dashboard) */}
      <div className="px-5 mb-4">
        <SafeToSpendCard
          grossBalance={biz.bankBalance}
          vatReserved={biz.vatReserved}
          entityType={legalEntity}
        />
      </div>

      <div className="px-5 space-y-4">
        {/* Liquidity Gauge — juridiska skikten */}
        <LiquidityGauge
          totalBalance={biz.bankBalance}
          vatReserved={biz.vatReserved}
          grossIncome={biz.bankBalance}
          entityType={legalEntity}
        />

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

        {/* UI Translate — Fortnox-översättaren */}
        <UITranslate />

        {/* Daily Digest */}
        <DailyDigest />

        {/* Net Salary Calculator */}
        <NetSalaryCalculator entityType={legalEntity} />

        {/* Manual transactions */}
        {manualTransactions.length > 0 && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--color-card)', border: '1px solid rgba(61,170,122,0.2)' }}>
            <div className="px-4 pt-4 pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-bold" style={{ color: '#3DAA7A' }}>MANUELLT INMATADE ({manualTransactions.length})</p>
            </div>
            <div className="px-4 pb-3 pt-2 space-y-2">
              {manualTransactions.map((tx, i) => (
                <div key={i} className="flex items-center justify-between py-1.5"
                  style={{ borderBottom: i < manualTransactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <div>
                    <p className="text-xs font-bold" style={{ color: '#F0EAD6' }}>{tx.vendor}</p>
                    <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>Konto {tx.account} · {tx.date}</p>
                  </div>
                  <p className="text-xs font-black" style={{ color: tx.amount < 0 ? '#D95F5F' : '#3DAA7A' }}>
                    {tx.amount < 0 ? '−' : '+'}{Math.abs(tx.amount).toLocaleString('sv-SE')} kr
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tax Optimizer AI */}
        <TaxOptimizer />

        {/* Autonomous Bookkeeping */}
        <AutonomousBookkeeping />

        {/* Activity Stream */}
        <ActivityStream />

        {/* Review Mode */}
        <ReviewMode />

        {/* Receipt Vault */}
        <ReceiptVault transactions={manualTransactions} />

        {/* Swipe to approve */}
        <SwipeApprove />

        {/* Crisis Mode */}
        <CrisisMode monthlyBurn={monthlyBurn} />

        {/* Auditor Access */}
        <AuditorAccess />

        {/* Deductible transactions */}
        <DeductibleTransactions transactions={biz.recentTransactions} />

        {/* Ledger Vault link */}
        <Link to="/LedgerVault">
          <motion.div
            whileTap={{ scale: 0.97 }}
            className="w-full rounded-2xl p-4 flex items-center justify-between"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)' }}>
                <BookOpen className="w-4 h-4" style={{ color: '#D4AF37' }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: '#F0EAD6' }}>Bokföring & Arkiv</p>
                <p className="text-xs" style={{ color: 'rgba(155,173,184,0.55)' }}>The Ledger Vault — alla verifikat</p>
              </div>
            </div>
            <span className="text-xs font-bold" style={{ color: '#D4AF37' }}>→</span>
          </motion.div>
        </Link>

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