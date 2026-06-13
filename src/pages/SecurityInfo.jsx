import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { motion } from 'framer-motion';
import { Shield, Lock, Trash2, Database, Eye, CheckCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const sections = [
  {
    icon: Shield,
    color: 'from-emerald-500 to-teal-600',
    title: 'Ingen bankdata krävs',
    points: [
      'Vi begär aldrig ditt BankID, kortnummer eller inloggningsuppgifter till din bank.',
      'Du matar in siffror manuellt – vi ser dem aldrig automatiskt.',
      'Ingen integration mot banker eller betaltjänster existerar.',
    ],
  },
  {
    icon: Lock,
    color: 'from-indigo-500 to-purple-600',
    title: 'Krypterad & säker datalagring',
    points: [
      'All data krypteras i transit (TLS) och i vila (AES-256).',
      'Datan lagras på Base44:s säkra molninfrastruktur i EU.',
      'Inga tredjeparter säljer eller delar din ekonomiska data.',
    ],
  },
  {
    icon: Eye,
    color: 'from-blue-500 to-cyan-600',
    title: 'Du äger din data',
    points: [
      'Du har alltid tillgång till all data du registrerat.',
      'Vi delar inte din data med annonsörer eller partners.',
      'Din data används aldrig för att träna externa AI-modeller.',
    ],
  },
  {
    icon: Trash2,
    color: 'from-rose-500 to-pink-600',
    title: 'Permanent radering',
    points: [
      'Du kan begära permanent radering av ditt konto och all data.',
      'Vid radering raderas alla transaktioner, profil och spardata permanent.',
      'Kontakta oss via Inställningar → Konto för att initiera radering.',
    ],
  },
];

export default function SecurityInfo() {
  return (
    <div className="min-h-screen pb-24">
      <div className="px-6 pt-8 pb-4">
        <Link to={createPageUrl('Settings')} className="flex items-center gap-2 text-slate-400 mb-6">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Tillbaka till Inställningar</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold">Trust Center</p>
              <h1 className="text-2xl font-bold text-white">Säkerhet & Data</h1>
            </div>
          </div>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            ANCHOR är byggt på tillit. Här är exakt hur din data hanteras – transparent och ärligt.
          </p>
        </motion.div>
      </div>

      <div className="px-6 space-y-4">
        {sections.map(({ icon: Icon, color, title, points }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-2xl p-5"
            style={{ background: 'rgba(17,24,39,0.6)', boxShadow: 'var(--anchor-shadow-1)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-base font-bold text-white">{title}</h2>
            </div>
            <div className="space-y-3">
              {points.map((point, j) => (
                <div key={j} className="flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl p-5 text-center"
          style={{ background: 'rgba(16,185,129,0.08)', boxShadow: 'var(--anchor-shadow-1)' }}
        >
          <Database className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-white mb-1">Frågor om din data?</p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Vi följer GDPR och EU:s dataskyddslagar fullt ut.
            Din integritet är en grundrättighet – inte en bonus.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export const pageSeo = pageSeoFor('SecurityInfo');
