import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { id: 'streaming', label: 'Streaming' },
  { id: 'entertainment', label: 'Nöje' },
  { id: 'health', label: 'Hälsa' },
  { id: 'transport', label: 'Transport' },
  { id: 'food', label: 'Mat' },
  { id: 'insurance', label: 'Försäkring' },
  { id: 'other', label: 'Övrigt' },
];

const FREQUENCIES = [
  { id: 'monthly', label: 'Varje månad' },
  { id: 'quarterly', label: 'Varje kvartal' },
  { id: 'yearly', label: 'Varje år' },
];

export default function AddSubscriptionModal({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState({ name: '', amount: '', category: '', billingDay: '', frequency: 'monthly' });

  if (!isOpen) return null;

  const handleSave = () => {
    if (!form.name || !form.amount) return;
    onSave({
      name: form.name,
      amount: parseInt(form.amount.replace(/\s/g, '')) || 0,
      category: form.category || 'other',
      billingDay: parseInt(form.billingDay) || null,
      frequency: form.frequency,
    });
    setForm({ name: '', amount: '', category: '', billingDay: '', frequency: 'monthly' });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full glass-effect rounded-t-3xl p-6 pb-10 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Lägg till abonnemang</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs text-slate-400">Namn</Label>
            <Input placeholder="Netflix, Gymkort…" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="mt-1 h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Belopp (kr)</Label>
            <Input type="number" placeholder="149" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              className="mt-1 h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Dragningsdag (1–31)</Label>
            <Input type="number" min="1" max="31" placeholder="25" value={form.billingDay}
              onChange={e => setForm({ ...form, billingDay: e.target.value })}
              className="mt-1 h-11 rounded-xl" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Kategori</Label>
            <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
              <SelectTrigger className="mt-1 h-11 rounded-xl"><SelectValue placeholder="Välj" /></SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-slate-400">Frekvens</Label>
            <Select value={form.frequency} onValueChange={v => setForm({ ...form, frequency: v })}>
              <SelectTrigger className="mt-1 h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {FREQUENCIES.map(f => <SelectItem key={f.id} value={f.id}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSave} disabled={!form.name || !form.amount}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-white">
          Spara abonnemang
        </Button>
      </motion.div>
    </motion.div>
  );
}