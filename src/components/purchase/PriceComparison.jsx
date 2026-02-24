import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, TrendingDown, TrendingUp, Store, Package, Truck, Bell, BellOff, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const formatNumber = (value) => {
  return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
};

export default function PriceComparison({ 
  productName, 
  prices, 
  economicImpact,
  onClose,
  onAddToWatchlist,
  isWatching 
}) {
  const [filter, setFilter] = useState('lowest');

  if (!prices || prices.length === 0) return null;

  const lowestPrice = Math.min(...prices.map(p => p.price));
  const highestPrice = Math.max(...prices.map(p => p.price));
  const priceDiff = highestPrice - lowestPrice;

  const sortedPrices = [...prices].sort((a, b) => {
    if (filter === 'lowest') return a.price - b.price;
    if (filter === 'fastest') return (a.deliveryDays || 999) - (b.deliveryDays || 999);
    return 0;
  });

  const budgetPercentage = economicImpact?.monthlyMargin > 0 
    ? Math.round((lowestPrice / economicImpact.monthlyMargin) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full glass-effect rounded-t-3xl shadow-2xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-white/10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="font-bold text-white text-lg pr-8">{productName}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  {prices.length} butiker
                </Badge>
                {priceDiff > 0 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Prisskillnad: {formatNumber(priceDiff)} kr
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Economic Impact */}
          {economicImpact && (
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-purple-900">AI-analys</p>
                  <p className="text-sm text-purple-700 mt-1">
                    {budgetPercentage > 0 && budgetPercentage < 100 
                      ? `Billigaste alternativet motsvarar ${budgetPercentage}% av din fria månadsbudget.`
                      : budgetPercentage >= 100
                      ? `Detta köp överskrider din månadsmarginal.`
                      : `Detta köp är inom din budget.`}
                  </p>
                  {priceDiff > 500 && (
                    <p className="text-sm text-purple-700 mt-1">
                      💡 Genom att välja billigaste alternativet sparar du {formatNumber(priceDiff)} kr.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="px-5 py-3 border-b border-white/10 flex gap-2 overflow-x-auto">
          <Button
            size="sm"
            variant={filter === 'lowest' ? 'default' : 'outline'}
            onClick={() => setFilter('lowest')}
            className="rounded-full"
          >
            <TrendingDown className="w-4 h-4 mr-1" />
            Lägsta pris
          </Button>
          <Button
            size="sm"
            variant={filter === 'fastest' ? 'default' : 'outline'}
            onClick={() => setFilter('fastest')}
            className="rounded-full"
          >
            <Truck className="w-4 h-4 mr-1" />
            Snabbast
          </Button>
        </div>

        {/* Price List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {sortedPrices.map((store, i) => {
            const isLowest = store.price === lowestPrice;
            
            return (
              <motion.a
                key={i}
                href={store.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`block p-4 rounded-xl border-2 transition-all ${
                  isLowest
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-white/10 dark-card hover:border-emerald-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isLowest ? 'bg-emerald-500' : 'bg-slate-100'
                    }`}>
                      <Store className={`w-5 h-5 ${isLowest ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white">{store.name}</h3>
                        {isLowest && (
                          <Badge className="bg-emerald-500 text-white text-xs">
                            Bäst pris
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {store.shipping && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            {store.shipping}
                          </p>
                        )}
                        {store.deliveryDays && (
                          <p className="text-xs text-slate-500">
                            {store.deliveryDays} dagar
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <p className={`text-xl font-bold ${isLowest ? 'text-emerald-400' : 'text-white'}`}>
                      {formatNumber(store.price)} kr
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-500">Till butik</span>
                    </div>
                  </div>
                </div>
              </motion.a>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-3 dark-card rounded-xl">
              <p className="text-xs text-slate-500">Lägsta pris</p>
              <p className="text-lg font-bold text-emerald-600">{formatNumber(lowestPrice)} kr</p>
            </div>
            <div className="p-3 dark-card rounded-xl">
              <p className="text-xs text-slate-500">Högsta pris</p>
              <p className="text-lg font-bold text-rose-600">{formatNumber(highestPrice)} kr</p>
            </div>
          </div>
          
          <Button
            onClick={onAddToWatchlist}
            variant={isWatching ? 'outline' : 'default'}
            className={`w-full h-12 rounded-xl ${
              isWatching 
                ? 'border-amber-200 text-amber-700 hover:bg-amber-50' 
                : 'bg-amber-500 hover:bg-amber-600'
            }`}
          >
            {isWatching ? (
              <>
                <BellOff className="w-4 h-4 mr-2" />
                Sluta bevaka pris
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Bevaka pris
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}