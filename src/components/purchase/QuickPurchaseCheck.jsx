// @ts-nocheck
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { getPurchaseImpact, getBestPurchaseDate } from '@/lib/financialEngine';
import { extractPriceKr } from '@/lib/purchaseTextParsing';
import { anchorInputClass, anchorPrimaryButtonClass } from '@/lib/anchorTheme';
import PurchaseVerdictCard from '@/components/purchase/PurchaseVerdictCard';

export default function QuickPurchaseCheck({ profile }) {
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 1000 });
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [notFound, setNotFound] = useState(false);

  const handleCheck = () => {
    const price = extractPriceKr(text);
    if (!price) {
      setResult(null);
      setNotFound(true);
      return;
    }
    setNotFound(false);
    setResult({
      price,
      impact: getPurchaseImpact(profile, transactions, price),
      bestDate: getBestPurchaseDate(profile, transactions, price),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setNotFound(false);
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
          placeholder="Jag vill köpa en TV för 8000 kr…"
          className={`${anchorInputClass} flex-1`}
        />
        <button
          type="button"
          onClick={handleCheck}
          disabled={!text.trim()}
          className={`${anchorPrimaryButtonClass} px-4 disabled:opacity-50`}
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>
      {notFound && (
        <p className="text-[13px] text-white/45">
          Jag hittade inget pris i texten — skriv t.ex. "en TV för 8000 kr".
        </p>
      )}
      {result && (
        <PurchaseVerdictCard price={result.price} impact={result.impact} bestDate={result.bestDate} />
      )}
    </div>
  );
}
