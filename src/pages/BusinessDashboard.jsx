import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, Building2, Plus, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { SIMULATED_BUSINESS, calcMonthlyBurn } from '@/components/business/BusinessData';
import BusinessTabBar from '@/components/business/BusinessTabBar';
import ReceiptScanner from '@/components/business/ReceiptScanner';
import ManualTransactionModal from '@/components/business/ManualTransactionModal';
import MagicImport from '@/components/business/MagicImport';

import HomeTab from '@/components/business/tabs/HomeTab';
import SkattMomsTab from '@/components/business/tabs/SkattMomsTab';
import RapporterTab from '@/components/business/tabs/RapporterTab';
import ArkivTab from '@/components/business/tabs/ArkivTab';
import ProfilTab from '@/components/business/tabs/ProfilTab';

// Tax calc for safe-to-spend
function calcSafeToSpend(grossBalance, vatReserved, entityType) {
  const net = grossBalance - vatReserved;
  if (entityType === 'ab') {
    const tax = Math.round(net * 0.206) + Math.round(net * 0.12);
    return { safeToSpend: Math.max(0, net - tax), label: 'Utdelning / lön tillgänglig' };
  }
  const egenavgifter = Math.round(net * 0.2897);
  const prelimSkatt = Math.round((net - egenavgifter) * 0.30);
  return { safeToSpend: Math.max(0, net - egenavgifter - prelimSkatt), label: 'Nettolön — säkert att föra över' };
}

const biz = SIMULATED_BUSINESS;
const monthlyBurn = calcMonthlyBurn(biz);

export default function BusinessDashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [showScanner, setShowScanner] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [manualTransactions, setManualTransactions] = useState([]);

  const legalEntity = localStorage.getItem('anchor_biz_legal_entity') || 'enskild';
  const legalLabel = legalEntity === 'ab' ? 'Aktiebolag (AB)' : 'Enskild firma';
  const { safeToSpend, label } = calcSafeToSpend(biz.bankBalance, biz.vatReserved, legalEntity);
  const allTransactions = [...manualTransactions, ...biz.recentTransactions];

  return (
    <div className="min-h-screen" style={{ background: '#F4F6F8' }}>
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
      <AnimatePresence>
        {showImport && <MagicImport onClose={() => setShowImport(false)} onComplete={() => setShowImport(false)} />}
      </AnimatePresence>

      {/* Demo banner */}
      <div className="flex items-center gap-2 px-4 py-2"
        style={{ background: 'rgba(13,115,119,0.08)', borderBottom: '1px solid rgba(13,115,119,0.12)' }}>
        <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#0D7377' }} />
        <p className="text-xs font-medium" style={{ color: '#0D7377' }}>
          Demo-läge — Simulerad företagsdata
        </p>
      </div>

      {/* Top header */}
      <div className="px-5 pt-5 pb-6 flex items-center justify-between"
        style={{
          background: 'linear-gradient(160deg, #0D7377 0%, #074f52 100%)',
          borderRadius: '0 0 32px 32px',
        }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.6)' }}>Anchor Business</p>
            <h1 className="text-lg font-black text-white tracking-tight">{biz.companyName}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowManual(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <Plus className="w-4 h-4 text-white" />
          </button>
          <Link to={createPageUrl('Settings')}>
            <button className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Settings className="w-4 h-4 text-white" />
            </button>
          </Link>
        </div>
      </div>

      {/* Tab content */}
      <div className="pb-28 pt-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <HomeTab safeToSpend={safeToSpend} label={label} onScannerOpen={() => setShowScanner(true)} />
            </motion.div>
          )}
          {activeTab === 'skatt' && (
            <motion.div key="skatt" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <SkattMomsTab vatReserved={biz.vatReserved} vatDeadlines={biz.vatDeadlines} entityType={legalEntity} totalBalance={biz.bankBalance} />
            </motion.div>
          )}
          {activeTab === 'rapporter' && (
            <motion.div key="rapporter" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <RapporterTab runwayMonths={biz.runwayMonths} runwayData={biz.runwayData} monthlyBurn={monthlyBurn} invoices={biz.unpaidInvoices} transactions={biz.recentTransactions} />
            </motion.div>
          )}
          {activeTab === 'arkiv' && (
            <motion.div key="arkiv" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}>
              <ArkivTab transactions={allTransactions} />
            </motion.div>
          )}
          {activeTab === 'profil' && (
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