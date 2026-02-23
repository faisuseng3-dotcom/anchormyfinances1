import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Clock, CheckCircle, XCircle, TrendingDown, AlertTriangle, Target, Wallet, Loader2, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import PriceComparison from '@/components/purchase/PriceComparison';
import QuickExpenseModal from '@/components/purchase/QuickExpenseModal';

export default function PurchaseSimulator() {
  const queryClient = useQueryClient();
  const [purchaseName, setPurchaseName] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [priceData, setPriceData] = useState(null);
  const [showPriceComparison, setShowPriceComparison] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

  const updateProfile = useMutation({
    mutationFn: async (data) => {
      await base44.entities.FinancialProfile.update(profile.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
    }
  });

  const formatNumber = (value) => {
    return value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
  };

  const parseNumber = (value) => {
    return parseInt(value.replace(/\s/g, '')) || 0;
  };

  const analyzePurchase = async () => {
    if (!purchaseName || !profile) return;

    setAnalyzing(true);
    
    try {
      // First, try to find price comparisons
      const priceResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Du är en prisjämförelseassistent för svenska marknaden. Användaren söker efter: "${purchaseName}"

Hitta VERKLIGA, AKTUELLA priser från svenska butiker. Om du inte kan hitta exakta priser, uppskatta realistiska priser baserat på liknande produkter.

Svara i JSON-format med:
{
  "productName": "Fullständigt produktnamn",
  "estimatedPrice": pris i kr (om du inte hittar exakta priser),
  "stores": [
    {
      "name": "Butiksnamn (t.ex. Elgiganten, NetOnNet, MediaMarkt)",
      "price": pris i kr,
      "shipping": "fraktkostnad eller 'Fri frakt'",
      "deliveryDays": antal dagar,
      "url": "https://butik.se/produkt"
    }
  ]
}

Lägg till minst 3-5 butiker. Använd verkliga svenska elektronikkedjor och e-handlare.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            productName: { type: "string" },
            estimatedPrice: { type: "number" },
            stores: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  shipping: { type: "string" },
                  deliveryDays: { type: "number" },
                  url: { type: "string" }
                }
              }
            }
          }
        }
      });

      const amount = priceResponse.estimatedPrice || parseNumber(purchaseAmount) || 
                     (priceResponse.stores?.length > 0 ? Math.min(...priceResponse.stores.map(s => s.price)) : 0);

      if (amount === 0) {
        setAnalyzing(false);
        return;
      }

      // Calculate economic impact
      const totalSubscriptions = (profile.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
      const totalLoanPayments = (profile.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
      const totalFixedCosts = profile.housingCost + totalSubscriptions + totalLoanPayments;
      const monthlyMargin = profile.income - totalFixedCosts;

      const bufferImpact = profile.buffer > 0 ? Math.round((amount / profile.buffer) * 100) : 100;
      const savingsImpact = profile.savingsGoal > 0 ? Math.round((amount / profile.savingsGoal) * 100) : 0;
      const monthsDelayed = profile.savingsGoal > 0 && monthlyMargin > 0 ? Math.round(amount / (monthlyMargin * 0.3)) : 0;
      
      let recommendation = 'buy';
      let riskLevel = 'low';

      if (bufferImpact > 50) {
        recommendation = 'reject';
        riskLevel = 'high';
      } else if (bufferImpact > 25 || amount > monthlyMargin) {
        recommendation = 'wait';
        riskLevel = 'medium';
      }

      const analysisData = {
        name: priceResponse.productName || purchaseName,
        amount,
        bufferImpact,
        savingsImpact,
        monthsDelayed,
        remainingBuffer: profile.buffer - amount,
        monthlyMargin,
        recommendation,
        riskLevel
      };

      setAnalysis(analysisData);
      setPriceData(priceResponse);

      // If we have stores, show price comparison
      if (priceResponse.stores?.length > 0) {
        setShowPriceComparison(true);
      }
    } catch (error) {
      console.error('Price analysis error:', error);
    }
    
    setAnalyzing(false);
  };

  const handleDecision = async (decision) => {
    if (decision === 'wait') {
      const plannedPurchases = [...(profile.plannedPurchases || []), {
        name: analysis.name,
        amount: analysis.amount,
        addedDate: new Date().toISOString(),
        status: 'waiting'
      }];
      await updateProfile.mutateAsync({ plannedPurchases });
    } else if (decision === 'buy') {
      // Show expense modal to register the purchase
      setShowExpenseModal(true);
      return; // Don't reset yet
    }

    base44.analytics.track({
      eventName: 'purchase_decision_made',
      properties: {
        decision,
        amount: analysis.amount,
        risk_level: analysis.riskLevel
      }
    });
    
    setAnalysis(null);
    setPurchaseName('');
    setPurchaseAmount('');
    setPriceData(null);
    setShowPriceComparison(false);
  };

  const waitingPurchases = (profile?.plannedPurchases || []).filter(p => p.status === 'waiting');
  const priceWatches = profile?.priceWatches || [];
  const isWatching = priceData && priceWatches.some(w => w.productName === priceData.productName);

  const handleAddToWatchlist = async () => {
    if (!priceData) return;

    const lowestPrice = priceData.stores?.length > 0 
      ? Math.min(...priceData.stores.map(s => s.price))
      : priceData.estimatedPrice;

    if (isWatching) {
      // Remove from watchlist
      const newWatches = priceWatches.filter(w => w.productName !== priceData.productName);
      await updateProfile.mutateAsync({ priceWatches: newWatches });
    } else {
      // Add to watchlist
      const newWatch = {
        productName: priceData.productName,
        currentLowestPrice: lowestPrice,
        addedDate: new Date().toISOString()
      };
      await updateProfile.mutateAsync({ 
        priceWatches: [...priceWatches, newWatch] 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-8">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl('Dashboard')}>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Köpsimulator</h1>
            <p className="text-sm text-slate-500">Analysera köpets påverkan</p>
          </div>
        </div>

        {/* Input */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">Vad vill du köpa?</p>
            </div>
          </div>
          
          <Input
            placeholder="t.ex. iPhone 15, Samsung TV 55 tum, AirPods Pro"
            value={purchaseName}
            onChange={(e) => setPurchaseName(e.target.value)}
            className="h-12 rounded-xl"
          />
          
          <div className="relative">
            <Input
              type="text"
              placeholder="Belopp (valfritt)"
              value={formatNumber(parseNumber(purchaseAmount))}
              onChange={(e) => setPurchaseAmount(e.target.value)}
              className="h-12 rounded-xl pr-12"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">kr</span>
          </div>

          <Button
            onClick={analyzePurchase}
            disabled={!purchaseName || analyzing}
            className="w-full h-12 rounded-xl bg-purple-600 hover:bg-purple-700"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Söker priser...
              </>
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Jämför priser & analysera
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analysis Result */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 space-y-4"
          >
            {/* Impact cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-white rounded-xl border border-slate-100">
                <Wallet className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-xs text-slate-500">Buffert-påverkan</p>
                <p className={`text-lg font-semibold ${analysis.bufferImpact > 30 ? 'text-rose-600' : 'text-slate-900'}`}>
                  -{analysis.bufferImpact}%
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Kvar: {formatNumber(analysis.remainingBuffer)} kr
                </p>
              </div>

              {profile.savingsGoal > 0 && (
                <div className="p-4 bg-white rounded-xl border border-slate-100">
                  <Target className="w-5 h-5 text-purple-500 mb-2" />
                  <p className="text-xs text-slate-500">Sparmål-påverkan</p>
                  <p className="text-lg font-semibold text-slate-900">
                    -{analysis.savingsImpact}%
                  </p>
                  {analysis.monthsDelayed > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      +{analysis.monthsDelayed} mån till mål
                    </p>
                  )}
                </div>
              )}

              <div className="p-4 bg-white rounded-xl border border-slate-100">
                <TrendingDown className="w-5 h-5 text-amber-500 mb-2" />
                <p className="text-xs text-slate-500">Månadsmarginal</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatNumber(analysis.monthlyMargin)} kr
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${
                analysis.riskLevel === 'high' ? 'bg-rose-50 border-rose-100' :
                analysis.riskLevel === 'medium' ? 'bg-amber-50 border-amber-100' :
                'bg-emerald-50 border-emerald-100'
              }`}>
                <AlertTriangle className={`w-5 h-5 mb-2 ${
                  analysis.riskLevel === 'high' ? 'text-rose-500' :
                  analysis.riskLevel === 'medium' ? 'text-amber-500' :
                  'text-emerald-500'
                }`} />
                <p className="text-xs text-slate-500">Risknivå</p>
                <p className={`text-lg font-semibold ${
                  analysis.riskLevel === 'high' ? 'text-rose-600' :
                  analysis.riskLevel === 'medium' ? 'text-amber-600' :
                  'text-emerald-600'
                }`}>
                  {analysis.riskLevel === 'high' ? 'Hög' :
                   analysis.riskLevel === 'medium' ? 'Medel' : 'Låg'}
                </p>
              </div>
            </div>

            {/* Recommendation */}
            <div className={`p-5 rounded-2xl ${
              analysis.recommendation === 'buy' ? 'bg-emerald-500' :
              analysis.recommendation === 'wait' ? 'bg-amber-500' :
              'bg-rose-500'
            }`}>
              <p className="text-white/80 text-sm">AI-rekommendation</p>
              <h3 className="text-xl font-bold text-white mt-1">
                {analysis.recommendation === 'buy' ? 'Köp nu ✓' :
                 analysis.recommendation === 'wait' ? 'Vänta 24h' :
                 'Avbryt köpet'}
              </h3>
              <p className="text-white/80 text-sm mt-2">
                {analysis.recommendation === 'buy' 
                  ? 'Detta köp påverkar inte din ekonomi negativt.' 
                  : analysis.recommendation === 'wait'
                  ? 'Ta dig tid att tänka över köpet. Vi lägger det i din bevakningslista.'
                  : 'Detta köp riskerar din ekonomiska trygghet.'}
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleDecision('buy')}
                className="h-14 rounded-xl bg-emerald-500 hover:bg-emerald-600 flex flex-col items-center justify-center gap-1"
              >
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs">Köp nu</span>
              </Button>
              <Button
                onClick={() => handleDecision('wait')}
                className="h-14 rounded-xl bg-amber-500 hover:bg-amber-600 flex flex-col items-center justify-center gap-1"
              >
                <Clock className="w-5 h-5" />
                <span className="text-xs">Vänta</span>
              </Button>
              <Button
                onClick={() => handleDecision('reject')}
                className="h-14 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex flex-col items-center justify-center gap-1"
              >
                <XCircle className="w-5 h-5" />
                <span className="text-xs">Avbryt</span>
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Price Comparison Modal */}
      <AnimatePresence>
        {showPriceComparison && priceData && (
          <PriceComparison
            productName={priceData.productName}
            prices={priceData.stores || []}
            economicImpact={analysis}
            onClose={() => setShowPriceComparison(false)}
            onAddToWatchlist={handleAddToWatchlist}
            isWatching={isWatching}
          />
        )}
      </AnimatePresence>

      {/* Waiting list */}
      {waitingPurchases.length > 0 && !analysis && (
        <div className="px-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Bevakningslista</h3>
          <div className="space-y-3">
            {waitingPurchases.map((purchase, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-xl border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{purchase.name}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(purchase.addedDate).toLocaleDateString('sv-SE')}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-slate-900">{formatNumber(purchase.amount)} kr</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price Watches */}
      {priceWatches.length > 0 && !analysis && (
        <div className="px-6 mt-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-3">Prisbevakning</h3>
          <div className="space-y-3">
            {priceWatches.map((watch, i) => (
              <div
                key={i}
                className="p-4 bg-white rounded-xl border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{watch.productName}</p>
                    <p className="text-sm text-slate-500">
                      Lägsta: {formatNumber(watch.currentLowestPrice)} kr
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Expense Modal */}
      <QuickExpenseModal
        isOpen={showExpenseModal}
        onClose={() => {
          setShowExpenseModal(false);
          setAnalysis(null);
          setPurchaseName('');
          setPurchaseAmount('');
          setPriceData(null);
          setShowPriceComparison(false);
        }}
        profile={profile}
        prefilledName={analysis?.name || ''}
        prefilledAmount={analysis?.amount?.toString() || ''}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['financialProfile'] });
        }}
      />
    </div>
  );
}