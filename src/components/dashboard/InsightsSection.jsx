import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function InsightsSection({ insights, profile }) {
  const successInsights = insights.filter(i => i.type === 'success');
  const warningInsights = insights.filter(i => i.type === 'warning' || i.type === 'danger');

  return (
    <div className="space-y-4">
      {/* Success Insights - Chips */}
      {successInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Insights</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {successInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">{insight.title}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Warning/Risk Insights */}
      {warningInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Risks</h3>
          </div>
          <div className="space-y-2">
            {warningInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
                className={`p-4 rounded-xl border ${
                  insight.type === 'danger' 
                    ? 'bg-rose-500/10 border-rose-500/20' 
                    : 'bg-amber-500/10 border-amber-500/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 ${
                    insight.type === 'danger' ? 'text-rose-400' : 'text-amber-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white mb-1">{insight.title}</p>
                    <p className="text-xs text-slate-400">{insight.description}</p>
                    {insight.impact && (
                      <p className="text-xs text-slate-500 mt-1">{insight.impact}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      {warningInsights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white">Actions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {warningInsights.slice(0, 3).map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 + 0.2 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-500/50 text-white text-xs"
                >
                  {insight.action || 'Åtgärda'}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}