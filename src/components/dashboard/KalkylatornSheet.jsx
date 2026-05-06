import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { X, TrendingUp, Landmark, Rocket, Brain, BarChart2, GitBranch } from 'lucide-react';

const PRO_TOOLS = [
{
  id: 'future',
  label: 'Framtids-kollen',
  desc: 'Prognoser & tillväxt',
  emoji: '⚡',
  color: '#34d399',
  page: 'ProTools'
},
{
  id: 'loans',
  label: 'Ränte-jämföraren',
  desc: 'Optimera dina lån',
  emoji: '🛰️',
  color: '#60a5fa',
  page: 'Loans'
},
{
  id: 'whatif',
  label: 'Mål-acceleratorn',
  desc: '"Tänk om"-scenarier',
  emoji: '🌌',
  color: '#a78bfa',
  page: 'WhatIf'
},
{
  id: 'simulator',
  label: 'Köp-simulatorn',
  desc: 'Analysera ett köp',
  emoji: '🔭',
  color: '#fbbf24',
  page: 'PurchaseSimulator'
},
{
  id: 'history',
  label: 'Ekonomisk resa',
  desc: 'Se din progress',
  emoji: '🪞',
  color: '#fb7185',
  page: 'FinancialHistory'
},
{
  id: 'protools',
  label: 'Alla Pro-verktyg',
  desc: 'Superkrafter & AI',
  emoji: '🚀',
  color: '#0FDEBD',
  page: 'ProTools'
}];


export default function KalkylatornSheet({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen &&
      <>
          {/* Backdrop */}
          <motion.div
          key="backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }} />
        

          {/* Sheet */}
          <motion.div
          key="sheet"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 280 }}
          className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 -8px 40px rgba(0,0,0,0.18)',
            maxHeight: '80vh'
          }}>
          
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 bg-[hsl(var(--foreground))] text-[hsl(var(--foreground))]">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.12)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 bg-[hsl(var(--foreground))] text-[hsl(var(--background))]">
              <div>
                <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(0,0,0,0.3)' }}>ANCHOR</p>
                <h2 className="text-xl font-black bg-[hsl(var(--foreground))] text-[hsl(var(--background))] opacity-100" style={{ color: '#1A2332', letterSpacing: '-0.02em' }}>
                  Pro-verktyg
                </h2>
              </div>
              <button
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.06)' }}>
              
                <X className="w-4 h-4" style={{ color: '#8896A5' }} />
              </button>
            </div>

            {/* Tools grid */}
            <div className="px-5 pb-8 overflow-y-auto text-[hsl(var(--foreground))] bg-[#080707]" style={{ maxHeight: 'calc(80vh - 110px)' }}>
              <div className="grid grid-cols-2 gap-3">
                {PRO_TOOLS.map((tool, i) =>
              <Link key={tool.id} to={createPageUrl(tool.page)} onClick={onClose}>
                    <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-2xl p-4 flex flex-col gap-2"
                  style={{
                    background: `${tool.color}10`,
                    border: `1px solid ${tool.color}30`
                  }}>
                  
                      <span style={{ fontSize: 24 }}>{tool.emoji}</span>
                      <div>
                        <p className="text-sm font-black" style={{ color: '#1A2332' }}>{tool.label}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: '#8896A5' }}>{tool.desc}</p>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full mt-1" style={{ background: tool.color }} />
                    </motion.div>
                  </Link>
              )}
              </div>
            </div>
          </motion.div>
        </>
      }
    </AnimatePresence>);

}