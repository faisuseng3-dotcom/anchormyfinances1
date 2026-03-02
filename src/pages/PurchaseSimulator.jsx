import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { Button } from "@/components/ui/button";
import CategorySelector from '@/components/purchase/CategorySelector';
import PurchaseAnalyzer from '@/components/purchase/PurchaseAnalyzer';
import VehicleAnalysis from '@/components/purchase/categories/VehicleAnalysis';
import HousingAnalysis from '@/components/purchase/categories/HousingAnalysis';
import ElectronicsAnalysis from '@/components/purchase/categories/ElectronicsAnalysis';
import EventAnalysis from '@/components/purchase/categories/EventAnalysis';
import ModeGate from '@/components/ModeGate';

export default function PurchaseSimulator() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const currentMode = profile?.mode || 'basic';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <Link to={createPageUrl('Dashboard')}>
          <Button variant="ghost" size="icon" className="mb-4 rounded-xl bg-white/5 hover:bg-white/10">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Button>
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Köpanalysator</h1>
            <p className="text-sm text-slate-400 capitalize">{currentMode} Mode</p>
          </div>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {/* Universal analyzer always visible at top */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">🔗 Länk- & Bildanalys</p>
          <PurchaseAnalyzer profile={profile} />
        </motion.div>

        <div className="border-t border-white/10 pt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Eller välj kategori</p>
        </div>

        {!selectedCategory ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CategorySelector 
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </motion.div>
        ) : (
          <>
            <Button
              variant="ghost"
              onClick={() => setSelectedCategory(null)}
              className="text-slate-400 hover:text-white"
            >
              ← Byt kategori
            </Button>

            {selectedCategory === 'vehicle' && <VehicleAnalysis mode={currentMode} profile={profile} />}
            {selectedCategory === 'housing' && <HousingAnalysis mode={currentMode} profile={profile} />}
            {selectedCategory === 'electronics' && <ElectronicsAnalysis mode={currentMode} profile={profile} />}
            {selectedCategory === 'event' && <EventAnalysis mode={currentMode} profile={profile} />}
          </>
        )}
      </div>
    </div>
  );
}