import React from 'react';
import { motion } from 'framer-motion';
import ReceiptVault from '@/components/business/ReceiptVault';
import ActivityStream from '@/components/business/ActivityStream';
import SmartPasteImport from '@/components/business/SmartPasteImport';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

export default function ArkivTab({ transactions, onBooked }) {
  return (
    <div className="px-5 space-y-4">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-2xl font-black pt-4" style={{ color: '#1A2332', letterSpacing: '-0.5px' }}>
        Arkiv
      </motion.p>
      <p className="text-sm -mt-2" style={{ color: '#9AA5B4' }}>Kvitton, verifikat och din huvudbok</p>
      <SmartPasteImport onBooked={onBooked} />
      <ReceiptVault transactions={transactions} />
      <ActivityStream />
      <Link to="/LedgerVault">
        <motion.div whileTap={{ scale: 0.97 }}
          className="w-full rounded-3xl p-4 flex items-center justify-between mt-1"
          style={{ background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(13,115,119,0.1)' }}>
              <BookOpen className="w-5 h-5" style={{ color: '#0D7377' }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: '#1A2332' }}>Din Huvudbok</p>
              <p className="text-xs" style={{ color: '#9AA5B4' }}>Alla verifikat och bokföringsposter</p>
            </div>
          </div>
          <span className="text-sm font-bold" style={{ color: '#0D7377' }}>→</span>
        </motion.div>
      </Link>
    </div>
  );
}