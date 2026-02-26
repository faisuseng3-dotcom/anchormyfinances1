import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function FamilyFinances({ profile }) {
  const [incomeA, setIncomeA] = useState('');
  const [incomeB, setIncomeB] = useState('');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const a = parseFloat(incomeA) || 0;
    const b = parseFloat(incomeB) || 0;
    const total = a + b;

    if (total === 0) return;

    const percentA = Math.round((a / total) * 100);
    const percentB = Math.round((b / total) * 100);

    setResult({ percentA, percentB, total });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="dark-card p-6 rounded-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-blue-400" />
          <h3 className="font-semibold text-white">Family Finances 2.0</h3>
        </div>

        <p className="text-sm text-slate-400 mb-6">
          Beräkna rättvis kostnadsfördelning baserat på inkomst.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <Label>Person A - Månadsinkomst (kr)</Label>
            <Input
              type="number"
              value={incomeA}
              onChange={(e) => setIncomeA(e.target.value)}
              placeholder="35000"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Person B - Månadsinkomst (kr)</Label>
            <Input
              type="number"
              value={incomeB}
              onChange={(e) => setIncomeB(e.target.value)}
              placeholder="28000"
              className="mt-1"
            />
          </div>
        </div>

        <Button
          onClick={calculate}
          disabled={!incomeA || !incomeB}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-600"
        >
          Beräkna fördelning
        </Button>
      </div>

      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="dark-card p-6 rounded-2xl"
        >
          <h4 className="font-semibold text-white mb-4">Rättvis Fördelning</h4>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
              <p className="text-xs text-slate-400 mb-1">Person A</p>
              <p className="text-3xl font-bold text-blue-400">{result.percentA}%</p>
            </div>
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
              <p className="text-xs text-slate-400 mb-1">Person B</p>
              <p className="text-3xl font-bold text-cyan-400">{result.percentB}%</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white/5">
            <p className="text-sm text-slate-400 mb-3">
              Exempel: Hyra 12 000 kr/mån
            </p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Person A betalar:</span>
                <span className="font-bold text-blue-400">{Math.round(12000 * (result.percentA / 100))} kr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-300">Person B betalar:</span>
                <span className="font-bold text-cyan-400">{Math.round(12000 * (result.percentB / 100))} kr</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}