import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Plane, MessageSquare, BarChart2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import BasicTravelPlanner from '@/components/travel/BasicTravelPlanner';
import SmartTravelPlanner from '@/components/travel/SmartTravelPlanner';
import ProTravelPlanner from '@/components/travel/ProTravelPlanner';
import TravelAgentChat from '@/components/travel/TravelAgentChat';

export default function TravelPlanner() {
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Reseplanerare</h1>
            <p className="text-sm text-slate-400 capitalize">{currentMode} Mode</p>
          </div>
        </div>
      </div>

      <div className="px-6">
        {currentMode === 'basic' && <BasicTravelPlanner profile={profile} />}
        {currentMode === 'smart' && <SmartTravelPlanner profile={profile} />}
        {currentMode === 'pro' && <ProTravelPlanner profile={profile} />}
      </div>
    </div>
  );
}