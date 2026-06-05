import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

const typeConfig = {
  success: {
    bg: 'bg-emerald-500/10',
    icon: CheckCircle,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-green-600',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    actionColor: 'text-emerald-400'
  },
  warning: {
    bg: 'bg-amber-500/10',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-400',
    actionColor: 'text-amber-400'
  },
  danger: {
    bg: 'bg-rose-500/10',
    icon: AlertCircle,
    iconColor: 'text-rose-400',
    iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-400',
    actionColor: 'text-rose-400'
  }
};

export default function AIInsightCard({ type = 'warning', title, description, impact, action, onAction, index = 0 }) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      className="glass-effect rounded-xl p-4 border border-white/10 relative overflow-hidden cursor-pointer"
    >
      <div className={`absolute inset-0 ${config.bg}`} />
      
      <div className="flex items-start gap-3 relative z-10">
        <div className={`${config.iconBg} rounded-xl p-2 mt-0.5 shadow-lg flex-shrink-0`}>
          <Icon className={`w-4 h-4 text-white`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white mb-1">{title}</h4>
          <p className="text-sm text-slate-300 mb-2">{description}</p>
          {impact && (
            <span className={`inline-block text-xs ${config.badgeBg} ${config.badgeText} px-3 py-1.5 rounded-lg font-medium shadow-lg`}>
              {impact}
            </span>
          )}
        </div>
      </div>
      {action && onAction && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onAction}
          className={`w-full mt-3 text-sm font-medium ${config.actionColor} hover:underline flex items-center justify-between relative z-10 px-2 py-1`}
        >
          {action}
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </motion.div>
  );
}