import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function DecisionEngine({ profile }) {
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const X = parseFloat(amount);
    if (!X || X <= 0) return;

    // X × (1.07^10)
    const futureValue = X * Math.pow(1.07, 10);
    const gain = futureValue - X;

    setResult({
      initial: X,
      futureValue: Math.round(futureValue),
      gain: Math.round(gain),
      triggered: X > 500
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dark-card p-6 rounded-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-400" />
          <div>
            <h3 className="font-semibold text-white">Framtidssimulator</h3>
            <p className="text-xs text-slate-400">7% årlig avkastning över 10 år</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label>Belopp att investera (kr)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              className="mt-1"
            />
          </div>

          <Button
            onClick={calculate}
            disabled={!amount}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600"
          >
            Simulera framtida värde
          </Button>
        </div>
      </motion.div>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="glass-effect p-6 rounded-2xl text-center">
            <p className="text-sm text-slate-400 mb-2">Värde om 10 år</p>
            <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {formatNumber(result.futureValue)} kr
            </p>
            <p className="text-sm text-emerald-400 mt-2">
              +{formatNumber(result.gain)} kr vinst
            </p>
          </div>

          {result.triggered && (
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <p className="text-sm text-amber-400">
                ⚡ Trigger aktiverad: Belopp över 500 kr - funderar du på att köpa detta eller investera?
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}