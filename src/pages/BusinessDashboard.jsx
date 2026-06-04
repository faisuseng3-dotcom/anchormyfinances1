import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus } from 'lucide-react';

import { SIMULATED_BUSINESS, calcMonthlyBurn } from '@/components/business/BusinessData';
import BusinessTabBar from '@/components/business/BusinessTabBar';
import ReceiptScanner from '@/components/business/ReceiptScanner';
import ManualTransactionModal from '@/components/business/ManualTransactionModal';

import HomeTab from '@/components/business/tabs/HomeTab';
import SkattMomsTab from '@/components/business/tabs/SkattMomsTab';
import RapporterTab from '@/components/business/tabs/RapporterTab';
import ArkivTab from '@/components/business/tabs/ArkivTab';
import ProfilTab from '@/components/business/tabs/ProfilTab';
import { SkeletonCard, SkeletonHero } from '@/components/business/SkeletonCard';

const TAB_TITLES = {
  home: null, // uses company name
  skatt: 'Skatt & Moms',
  rapporter: 'Rapporter',
  arkiv: 'Arkiv',
  profil: 'Profil',
};

// Tax calc delegated to businessTaxEngine
const biz = SIMULATED_BUSINESS;
const monthlyBurn = calcMonthlyBurn(biz);

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [showScanner, setShowScanner] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [manualTransactions, setManualTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isReset, setIsReset] = useState(() => localStorage.getItem('anchor_biz_reset') === 'true');
  const [unprocessedCount, setUnprocessedCount] = useState(0);

  // Persist business mode on refresh
  useEffect(() => {
    localStorage.setItem('anchor_mode', 'business');
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Listen for reset events (both same-tab custom event and cross-tab storage event)
  useEffect(() => {
    const checkReset = () => {
      const flag = localStorage.getItem('anchor_biz_reset') === 'true';
      setIsReset(flag);
      if (flag) { setManualTransactions([]); setUnprocessedCount(0); }
    };
    window.addEventListener('storage', checkReset);
    window.addEventListener('anchor:biz_reset', checkReset);
    return () => {
      window.removeEventListener('storage', checkReset);
      window.removeEventListener('anchor:biz_reset', checkReset);
    };
  }, []);

  const legalEntity = localStorage.getItem('anchor_biz_legal_entity') || 'enskild';
  const legalLabel = legalEntity === 'ab' ? 'Aktiebolag (AB)' : 'Enskild firma';

  // After reset: show empty data instead of simulated demo data
  const activeBiz = isReset ? { ...biz, bankBalance: 0, vatReserved: 0, recentTransactions: [], unpaidInvoices: [], runwayMonths: 0, runwayData: [] } : biz;
  const allTransactions = isReset ? manualTransactions : [...manualTransactions, ...biz.recentTransactions];

  return (
    <div className="min-h-screen min-h-[100dvh] overflow-x-hidden w-full max-w-lg mx-auto" style={{ background: '#F4F6F8' }}>
      {/* Modals */}
      <AnimatePresence>
        {showScanner && (
          <ReceiptScanner
            onClose={() => setShowScanner(false)}
            onSave={tx => { setManualTransactions(p => [tx, ...p]); setShowScanner(false); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showManual && (
          <ManualTransactionModal
            onClose={() => setShowManual(false)}
            onAdd={tx => { setManualTransactions(p => [tx, ...p]); setShowManual(false); }}
          />
        )}
      </AnimatePresence>
      {/* Top header — consistent across all tabs */}
      <div
        className="px-4 sm:px-5 pt-[max(1.25rem,env(safe-area-inset-top,0px))] pb-5 flex items-center justify-between"
        style={{
          background: 'linear-gradient(160deg, #0D7377 0%, #074f52 100%)',
          borderRadius: '0 0 28px 28px',
        }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>Anchor Business</p>
            <h1 className="text-base font-black text-white tracking-tight">
              {TAB_TITLES[activeTab] || biz.companyName}
            </h1>
          </div>
        </div>
        <button onClick={() => setShowManual(true)}
          className="w-9 h-9 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.2)' }}>
          <Plus className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Tab content */}
      <div className="pt-5 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px)+1rem)]">
        {loading && (
          <div className="px-5 space-y-4">
            <SkeletonHero />
            <SkeletonCard rows={2} />
            <SkeletonCard rows={3} />
          </div>
        )}
        <AnimatePresence mode="wait">
          {!loading && activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <HomeTab
                grossBalance={activeBiz.bankBalance}
                vatReserved={activeBiz.vatReserved}
                entityType={legalEntity}
                isReset={isReset}
                onScannerOpen={() => setShowScanner(true)}
                onViewAll={() => setActiveTab('arkiv')}
                recentTransactions={allTransactions}
              />
            </motion.div>
          )}
          {!loading && activeTab === 'skatt' && (
            <motion.div key="skatt" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <SkattMomsTab
                vatReserved={activeBiz.vatReserved}
                vatDeadlines={activeBiz.vatDeadlines}
                entityType={legalEntity}
                totalBalance={activeBiz.bankBalance}
                isReset={isReset}
                transactions={allTransactions}
              />
            </motion.div>
          )}
          {!loading && activeTab === 'rapporter' && (
            <motion.div key="rapporter" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <RapporterTab
                runwayMonths={activeBiz.runwayMonths}
                runwayData={activeBiz.runwayData}
                monthlyBurn={monthlyBurn}
                invoices={activeBiz.unpaidInvoices}
                transactions={allTransactions}
                isReset={isReset}
                unprocessedCount={unprocessedCount}
                onReviewUnprocessed={() => setActiveTab('arkiv')}
              />
            </motion.div>
          )}
          {!loading && activeTab === 'arkiv' && (
            <motion.div key="arkiv" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <ArkivTab
                transactions={allTransactions}
                onBooked={txs => {
                  // Count needs_review transactions from this batch
                  const reviewCount = txs.filter(t => t.needs_review).length;
                  setUnprocessedCount(prev => prev + reviewCount);
                  setManualTransactions(p => [
                    ...txs.map(t => ({
                      vendor: t.vendor || t.description,
                      amount: t.amount,
                      date: t.date || 'Nyligen',
                      category: t.category || 'other',
                      label: t.description,
                      needs_review: t.needs_review,
                    })),
                    ...p,
                  ]);
                }}
              />
            </motion.div>
          )}
          {!loading && activeTab === 'profil' && (
            <motion.div key="profil" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <ProfilTab companyName={biz.companyName} orgNr={biz.orgNr} legalLabel={legalLabel} monthlyBurn={monthlyBurn} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom tab bar */}
      <BusinessTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}