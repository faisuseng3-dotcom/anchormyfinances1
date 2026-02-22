import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const typeConfig = {
  success: {
    bg: 'bg-emerald-50 border-emerald-100',
    icon: CheckCircle,
    iconColor: 'text-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700'
  },
  warning: {
    bg: 'bg-amber-50 border-amber-100',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    badge: 'bg-amber-100 text-amber-700'
  },
  danger: {
    bg: 'bg-rose-50 border-rose-100',
    icon: AlertCircle,
    iconColor: 'text-rose-500',
    badge: 'bg-rose-100 text-rose-700'
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
      className={`p-4 rounded-xl border ${config.bg}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg ${config.badge} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-slate-900">{title}</h4>
          <p className="text-sm text-slate-600 mt-1">{description}</p>
          {impact && (
            <span className={`inline-block text-xs px-2 py-1 rounded-full mt-2 ${config.badge}`}>
              {impact}
            </span>
          )}
        </div>
      </div>
      {action && onAction && (
        <Button
          onClick={onAction}
          variant="ghost"
          className="w-full mt-3 justify-between text-slate-700 hover:bg-white/50"
        >
          {action}
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
}