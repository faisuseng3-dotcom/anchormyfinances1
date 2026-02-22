import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, Landmark, TrendingDown, PiggyBank, AlertCircle, CheckCircle, ChevronRight, Percent } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function Loans() {
  const [consolidationAnalysis, setConsolidationAnalysis] = useState(null);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
  };

  useEffect(() => {
    if (profile?.loans?.length >= 2) {
      analyzeConsolidation();
    }
  }, [profile]);

  const analyzeConsolidation = () => {
    const loans = profile.loans || [];
    const totalDebt = loans.reduce((sum, l) => sum + l.totalAmount, 0);
    const totalMonthly = loans.reduce((sum, l) => sum + l.monthlyPayment, 0);
    const avgRate = loans.reduce((sum, l) => sum + (l.interestRate * l.totalAmount), 0) / totalDebt;
    
    // Assume consolidated loan at lower rate
    const newRate = Math.max(avgRate - 2, 3);
    const newMonthly = totalDebt * (newRate / 100 / 12) / (1 - Math.pow(1 + newRate / 100 / 12, -60));
    const monthlySavings = totalMonthly - newMonthly;

    setConsolidationAnalysis({
      totalDebt,
      currentMonthly: totalMonthly,
      currentAvgRate: avgRate,
      newRate,
      newMonthly: Math.round(newMonthly),
      monthlySavings: Math.round(monthlySavings),
      yearlySavings: Math.round(monthlySavings * 12)
    });
  };

  const loans = profile?.loans || [];
  const totalDebt = loans.reduce((sum, l) => sum + l.totalAmount, 0);
  const totalMonthly = loans.reduce((sum, l) => sum + l.monthlyPayment, 0);
  const totalInterestYearly = loans.reduce((sum, l) => sum + (l.totalAmount * (l.interestRate / 100)), 0);

  // Sort by interest rate (highest first = pay off first)
  const sortedLoans = [...loans].sort((a, b) => b.interestRate - a.interestRate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Lånintelligens</h1>
            <p className="text-sm text-slate-500">Optimera dina lån</p>
          </div>
        </div>

        {/* Summary cards */}
        {loans.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-white rounded-xl border border-slate-100">
              <Landmark className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-xs text-slate-500">Total skuld</p>
              <p className="text-lg font-semibold text-slate-900">{formatNumber(totalDebt)} kr</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100">
              <TrendingDown className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-xs text-slate-500">Månadskostnad</p>
              <p className="text-lg font-semibold text-slate-900">{formatNumber(totalMonthly)} kr</p>
            </div>
            <div className="p-4 bg-white rounded-xl border border-slate-100 col-span-2">
              <Percent className="w-5 h-5 text-rose-500 mb-2" />
              <p className="text-xs text-slate-500">Årlig räntekostnad</p>
              <p className="text-lg font-semibold text-rose-600">{formatNumber(Math.round(totalInterestYearly))} kr</p>
            </div>
          </div>
        )}

        {/* Consolidation opportunity */}
        {consolidationAnalysis && consolidationAnalysis.monthlySavings > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-6"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <PiggyBank className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white">Samla dina lån</h3>
                <p className="text-emerald-100 text-sm mt-1">
                  Genom att samla dina {loans.length} lån kan du potentiellt spara:
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-emerald-100 text-xs">Per månad</p>
                    <p className="text-xl font-bold text-white">{formatNumber(consolidationAnalysis.monthlySavings)} kr</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-emerald-100 text-xs">Per år</p>
                    <p className="text-xl font-bold text-white">{formatNumber(consolidationAnalysis.yearlySavings)} kr</p>
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full mt-4 bg-white text-emerald-600 hover:bg-emerald-50">
              Se hur det fungerar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        )}

        {/* Loans list */}
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Dina lån</h3>
          
          {loans.length === 0 ? (
            <div className="p-6 bg-white rounded-2xl border border-slate-100 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Inga lån!</h4>
              <p className="text-sm text-slate-500 mt-1">Du har inga registrerade lån.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 uppercase tracking-wide">Prioriteringsordning (betala av högst ränta först)</p>
              {sortedLoans.map((loan, i) => {
                const progress = 100 - ((loan.totalAmount / totalDebt) * 100);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-4 bg-white rounded-xl border border-slate-100"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                          i === 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{loan.name}</p>
                          <p className="text-sm text-slate-500">{loan.interestRate}% ränta</p>
                        </div>
                      </div>
                      {i === 0 && (
                        <span className="text-xs bg-rose-100 text-rose-600 px-2 py-1 rounded-full">
                          Högst prio
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-slate-500">Skuld kvar</p>
                        <p className="font-semibold text-slate-900">{formatNumber(loan.totalAmount)} kr</p>
                      </div>
                      <div>
                        <p className="text-slate-500">Månadskostnad</p>
                        <p className="font-semibold text-slate-900">{formatNumber(loan.monthlyPayment)} kr</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Årlig räntekostnad</span>
                        <span className="text-rose-600 font-medium">
                          {formatNumber(Math.round(loan.totalAmount * (loan.interestRate / 100)))} kr
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tips */}
        {loans.length > 0 && (
          <div className="mt-6 p-5 bg-blue-50 rounded-2xl">
            <h4 className="font-semibold text-blue-900 mb-3">Tips för snabbare avbetalning</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                Betala alltid mer på lånet med högst ränta först
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                Amortera extra när du får bonusar eller skatteåterbäring
              </li>
              <li className="flex items-start gap-2 text-sm text-blue-800">
                <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                Jämför räntor och byt till billigare alternativ
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}