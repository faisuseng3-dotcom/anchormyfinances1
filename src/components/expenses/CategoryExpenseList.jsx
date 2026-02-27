import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Coffee, Car, Film, Heart, Zap, Package, Home, Wifi, Shield, Star, Minus, DollarSign, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import OptimizationHub from './OptimizationHub';

const fmt = (v) => v ? Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';

export const categoryConfig = {
  food:          { label: 'Livsmedel',    icon: Coffee,       color: '#F97316', bg: 'bg-orange-500/10',  text: 'text-orange-400',  emoji: '🛒' },
  shopping:      { label: 'Shopping',     icon: ShoppingCart, color: '#A855F7', bg: 'bg-purple-500/10',  text: 'text-purple-400',  emoji: '🛍️' },
  transport:     { label: 'Fordon',       icon: Car,          color: '#3B82F6', bg: 'bg-blue-500/10',    text: 'text-blue-400',    emoji: '🚗' },
  entertainment: { label: 'Streaming',    icon: Film,         color: '#EC4899', bg: 'bg-pink-500/10',    text: 'text-pink-400',    emoji: '📺' },
  health:        { label: 'Hälsa/Fritid', icon: Heart,        color: '#10B981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', emoji: '💪' },
  utilities:     { label: 'Boende & El',  icon: Zap,          color: '#F59E0B', bg: 'bg-amber-500/10',   text: 'text-amber-400',   emoji: '⚡' },
  other:         { label: 'Telekom',      icon: Wifi,         color: '#6366F1', bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  emoji: '📱' },
};

// Categories with high AI optimization potential
const HIGH_OPT_CATEGORIES = ['utilities', 'other', 'entertainment'];

const FIXED_SUB_NAMES = ['spotify', 'netflix', 'disney', 'bredband', 'mobilabonnemang', 'elavtal', 'hemförsäkring', 'barnförsäkring', 'storytel', 'gymmedlemskap', 'padel', 'bilförsäkring'];

function isRecurring(name) {
  return FIXED_SUB_NAMES.some(s => name.toLowerCase().includes(s));
}

const HAPPY_LABELS = { star: 'Värt det', neutral: 'Okej', skip: 'Onödigt' };

export default function CategoryExpenseList({ expenses, subscriptions = [], autoOpenCategory, onAutoOpenHandled }) {
  const [expandedCats, setExpandedCats] = useState({});
  const [hubItem, setHubItem] = useState(null);
  const [feelings, setFeelings] = useState({});
  const [sparkle, setSparkle] = useState(null);

  // When donut category is clicked, open its hub with the first item
  React.useEffect(() => {
    if (!autoOpenCategory) return;
    const allItems = [
      ...expenses.map(e => ({ ...e, isSubscription: isRecurring(e.name) })),
      ...(subscriptions || []).map(s => ({ ...s, date: new Date().toISOString().split('T')[0], isSubscription: true }))
    ];
    const catItems = allItems.filter(i => (i.category || 'other') === autoOpenCategory);
    if (catItems.length > 0) {
      setHubItem({ ...catItems[0], category: autoOpenCategory });
    }
    if (onAutoOpenHandled) onAutoOpenHandled();
  }, [autoOpenCategory]);

  // Combine expenses + subscriptions into a unified list
  const allItems = [
    ...expenses.map(e => ({ ...e, isSubscription: isRecurring(e.name) })),
    ...(subscriptions || []).map(s => ({ ...s, date: new Date().toISOString().split('T')[0], isSubscription: true }))
  ];

  // Group by category
  const grouped = {};
  allItems.forEach(item => {
    const cat = item.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const toggleCat = (cat) => setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }));

  const handleFeel = (key, feeling) => {
    setFeelings(prev => ({ ...prev, [key]: feeling }));
    if (feeling === 'star') {
      setSparkle(key);
      setTimeout(() => setSparkle(null), 1200);
    }
  };

  if (allItems.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500">
        <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Inga utgifter registrerade</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {Object.entries(grouped).map(([cat, items], gi) => {
          const cfg = categoryConfig[cat] || categoryConfig.other;
          const Icon = cfg.icon;
          const total = items.reduce((s, i) => s + i.amount, 0);
          const isExpanded = expandedCats[cat] !== false; // default open
          const isHighOpt = HIGH_OPT_CATEGORIES.includes(cat);

          return (
            <motion.div
              key={cat}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: gi * 0.06 }}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(17,24,39,0.5)',
                border: isHighOpt ? `1px solid ${cfg.color}40` : '1px solid rgba(255,255,255,0.07)',
                boxShadow: isHighOpt ? `0 0 16px ${cfg.color}20` : 'none',
              }}
            >
              {/* Category Header */}
              <button
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                onClick={() => toggleCat(cat)}
              >
                <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.text}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">{cfg.emoji} {cfg.label}</span>
                    {isHighOpt && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: `${cfg.color}25`, color: cfg.color }}>
                        ✦ AI-optimering
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{items.length} poster</span>
                </div>
                <span className={`text-sm font-bold ${cfg.text} mr-1`}>{fmt(total)} kr</span>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Items */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="border-t border-white/5">
                      {items.map((item, idx) => {
                        const key = `${cat}-${idx}`;
                        const feel = feelings[key];
                        return (
                          <div
                            key={key}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            <button
                              className="flex-1 flex items-center gap-3 text-left"
                              onClick={() => setHubItem({ ...item, category: cat })}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-medium text-white truncate">{item.name}</span>
                                  {item.isSubscription && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-400 font-semibold flex-shrink-0">Återkommande</span>
                                  )}
                                </div>
                                <span className="text-xs text-slate-500">{item.date}</span>
                              </div>
                              <span className="text-sm font-bold text-rose-400 flex-shrink-0">{fmt(item.amount)} kr</span>
                            </button>

                            {/* Emotional feedback */}
                            <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                              {feel ? (
                                <motion.span
                                  initial={{ scale: 0.5 }}
                                  animate={{ scale: 1 }}
                                  className="text-base"
                                >
                                  {feel === 'star' ? (sparkle === key ? '✨' : '⭐') : feel === 'neutral' ? '😐' : '💸'}
                                </motion.span>
                              ) : (
                                <>
                                  <button onClick={() => handleFeel(key, 'star')} className="text-sm hover:scale-125 transition-transform" title="Värt det">⭐</button>
                                  <button onClick={() => handleFeel(key, 'neutral')} className="text-sm hover:scale-125 transition-transform" title="Okej">😐</button>
                                  <button onClick={() => handleFeel(key, 'skip')} className="text-sm hover:scale-125 transition-transform" title="Onödigt">💸</button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* AI note for high-opt categories */}
                    {isHighOpt && (
                      <div className="px-4 pb-3 pt-1">
                        <p className="text-xs text-slate-500 italic" style={{ color: cfg.color + 'bb' }}>
                          <Sparkles className="inline w-3 h-3 mr-1" />
                          AI ser optimeringspotential i {cfg.label.toLowerCase()} – klicka på en post för analys
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Optimization Hub */}
      <OptimizationHub item={hubItem} onClose={() => setHubItem(null)} feelings={feelings} />
    </>
  );
}