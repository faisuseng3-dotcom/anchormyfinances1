import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Brain, Zap, Check, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";

const modes = [
  {
    id: 'basic',
    title: 'Basic Mode',
    subtitle: 'Kontroll över nutid',
    description: 'Få koll på din ekonomi här och nu. Automatisk kategorisering och enkla översikter.',
    icon: Shield,
    color: 'from-blue-500 to-cyan-600',
    features: [
      'Nuvarande ekonomisk översikt',
      'Automatisk kategorisering',
      'Enkla varningar och påminnelser',
      'Buffertmål och framsteg'
    ],
    available: true
  },
  {
    id: 'smart',
    title: 'Smart Mode',
    subtitle: 'Förståelse och förbättring',
    description: 'AI analyserar dina mönster och ger konkreta förbättringsförslag med prognoser.',
    icon: Brain,
    color: 'from-purple-500 to-pink-600',
    features: [
      'Ekonomiska mönster och trender',
      'Konkreta förbättringsförslag',
      '3-månaders prognoser',
      'Personlig ekonomisk coaching'
    ],
    available: true
  },
  {
    id: 'pro',
    title: 'Pro Mode',
    subtitle: 'Strategisk framtidskontroll',
    description: 'Din personliga ekonomiska strateg. Simulera beslut och optimera automatiskt.',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    features: [
      'Flerårig framtidsprognos',
      'Beslutsmotor och simuleringar',
      'Livsbeslutssimulator',
      'Automatisk optimering',
      'Månatlig strategisk briefing'
    ],
    available: true,
    premium: true
  }
];

export default function ModeSelector({ currentMode, onSelectMode, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl my-8"
      >
        <div className="glass-effect rounded-3xl p-8 shadow-2xl border border-white/10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Välj ditt läge</h2>
            <p className="text-slate-400">Anpassa upplevelsen efter din ekonomiska nivå</p>
          </div>

          <div className="space-y-4">
            {modes.map((mode, i) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.id;
              
              return (
                <motion.div
                  key={mode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                    isActive
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/10 hover:border-white/20 dark-card'
                  }`}
                  onClick={() => mode.available && onSelectMode(mode.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${mode.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-white">{mode.title}</h3>
                        {isActive && (
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {mode.premium && (
                          <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-indigo-400 font-medium mb-2">{mode.subtitle}</p>
                      <p className="text-sm text-slate-400 mb-4">{mode.description}</p>
                      
                      <ul className="space-y-2">
                        {mode.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {!mode.available && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                          <Lock className="w-4 h-4" />
                          <span>Kommer snart</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-8 flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl"
            >
              Avbryt
            </Button>
            <Button
              onClick={onClose}
              className="flex-1 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
            >
              Fortsätt
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}