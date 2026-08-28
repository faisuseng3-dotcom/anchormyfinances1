// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Link2, Loader2, Train, Check, Receipt, Target, Lightbulb } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { useTransactions } from '@/hooks/useTransactions';
import { getPurchaseImpact, getBestPurchaseDate } from '@/lib/financialEngine';
import PurchaseVerdictCard from '@/components/purchase/PurchaseVerdictCard';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export default function EventAnalysis({ mode, profile }) {
  const { transactions = [] } = useTransactions({ personalOnly: true, limit: 1000 });
  const [event, setEvent] = useState({ name: '', ticketCost: '', city: '', date: '', travelNeeded: false });
  const [urlInput, setUrlInput] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liveCalc, setLiveCalc] = useState(null);

  const income = profile?.income || 30000;
  const buffer = profile?.buffer || 0;
  const savingsGoal = profile?.savingsGoal || 0;
  const savingsGoalName = profile?.savingsGoalName || 'sparmålet';
  const totalFixed = (profile?.housingCost || 0) + ((profile?.subscriptions || []).reduce((s, x) => s + x.amount, 0));
  const margin = income - totalFixed;

  // Estimate travel costs
  useEffect(() => {
    const ticket = parseFloat(event.ticketCost) || 0;
    if (!ticket) { setLiveCalc(null); return; }

    const travelCost = event.travelNeeded ? 600 : 0; // Train avg
    const hotelCost = event.travelNeeded ? 1200 : 0;  // 1 night avg
    const foodCost = event.travelNeeded ? 400 : 150;
    const totalCost = ticket + travelCost + hotelCost + foodCost;
    const bufferPct = buffer > 0 ? (totalCost / buffer) * 100 : 0;
    const savingsPct = savingsGoal > 0 ? (totalCost / savingsGoal) * 100 : 0;
    const monthsToSave = margin > 0 ? totalCost / (margin * 0.2) : 99;

    setLiveCalc({ ticket, travelCost, hotelCost, foodCost, totalCost, bufferPct, savingsPct, monthsToSave });
  }, [event.ticketCost, event.travelNeeded, buffer, savingsGoal, margin]);

  const handleUrlAutofill = async () => {
    if (!urlInput) return;
    setUrlLoading(true);
    const res = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
      prompt: `Läs av denna event-URL (Ticketmaster, Airbnb, booking etc.) och extrahera data: ${urlInput}. Returnera JSON med: name (eventnamn/plats), ticket_cost (pris i kr), city (stad), date (datum som sträng).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          ticket_cost: { type: 'number' },
          city: { type: 'string' },
          date: { type: 'string' }
        }
      }
    });
    setEvent(e => ({
      ...e,
      name: res.name || e.name,
      ticketCost: res.ticket_cost ? String(res.ticket_cost) : e.ticketCost,
      city: res.city || e.city,
      date: res.date || e.date,
    }));
    setUrlLoading(false);
  };

  const handleAnalyze = async () => {
    setLoading(true);

    const ai = await base44.integrations.Core.InvokeLLM({
        model: 'claude_sonnet_4_6',
      prompt: `Du är en upplevelsecoach och finansrådgivare för en privatperson.

Event: ${event.name}
Biljett: ${fmt(event.ticketCost)} kr
Stad: ${event.city} (resa nödvändig: ${event.travelNeeded ? 'Ja' : 'Nej'})
Datum: ${event.date}
Uppskattad totalkostnad: ${fmt(liveCalc?.totalCost)} kr (biljett + resa + hotell + mat)
Användarens inkomst: ${fmt(income)} kr/mån
Buffert: ${fmt(buffer)} kr
Sparmål "${savingsGoalName}": ${fmt(savingsGoal)} kr
Andel av buffert: ${Math.round(liveCalc?.bufferPct || 0)}%
Andel av sparmål: ${Math.round(liveCalc?.savingsPct || 0)}%

Ge ENDAST narrativ text — appen räknar redan ut totalkostnad och köpverdikt själv:
1. value_pulse: En mening om upplevelsevärdet. Känn och kreativ. SVENSKA.
2. travel_breakdown: Om resa: kort breakdown av tåg, hotell, mat. SVENSKA.
3. goal_impact: En mening om hur detta påverkar sparmålet. SVENSKA.
4. smart_tip: Ett konkret tips för att göra upplevelsen billigare utan att sänka glädjen. SVENSKA.
5. mood_match: true/false - Matchar eventet användarens livsstilsmål?

Svara ENDAST med JSON.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          value_pulse: { type: 'string' },
          travel_breakdown: { type: 'string' },
          goal_impact: { type: 'string' },
          smart_tip: { type: 'string' },
          mood_match: { type: 'boolean' },
        }
      }
    });

    setAnalysis({
      ...liveCalc, ...ai, event,
      impact: getPurchaseImpact(profile, transactions, liveCalc?.totalCost || 0),
      bestDate: getBestPurchaseDate(profile, transactions, liveCalc?.totalCost || 0),
    });
    setLoading(false);
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 space-y-4 bg-white border border-[var(--color-border)]"
        style={{ boxShadow: 'var(--anchor-shadow-1)' }}>
        <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
          <PartyPopper className="w-5 h-5 text-[var(--color-warning)]" /> Eventinformation
        </h3>

        {/* URL */}
        <div>
          <Label className="text-xs text-[var(--color-text-secondary)]">URL (Ticketmaster, Airbnb, Booking…)</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
              <Input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                placeholder="https://ticketmaster.se/…" className="pl-9 h-10 text-sm" />
            </div>
            <Button onClick={handleUrlAutofill} disabled={!urlInput || urlLoading} size="sm"
              className="bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] h-10 flex-shrink-0">
              {urlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hämta'}
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-xs text-[var(--color-text-secondary)]">Eventnamn</Label>
          <Input value={event.name} onChange={e => setEvent(ev => ({ ...ev, name: e.target.value }))}
            placeholder="Taylor Swift, Midsommarfest, Berlin-weekend…" className="mt-1 h-10 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-[var(--color-text-secondary)]">Biljettpris / kostnad (kr)</Label>
            <Input type="number" value={event.ticketCost} onChange={e => setEvent(ev => ({ ...ev, ticketCost: e.target.value }))}
              placeholder="1 200" className="mt-1 h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-[var(--color-text-secondary)]">Stad</Label>
            <Input value={event.city} onChange={e => setEvent(ev => ({ ...ev, city: e.target.value }))}
              placeholder="Stockholm, Göteborg…" className="mt-1 h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-[var(--color-text-secondary)]">Datum</Label>
            <Input value={event.date} onChange={e => setEvent(ev => ({ ...ev, date: e.target.value }))}
              placeholder="15 aug 2026" className="mt-1 h-10 text-sm" />
          </div>
        </div>

        {/* Travel toggle */}
        <button onClick={() => setEvent(ev => ({ ...ev, travelNeeded: !ev.travelNeeded }))}
          className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 border transition-all text-sm ${event.travelNeeded ? 'border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-accent)]' : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)]'}`}>
          <Train className="w-4 h-4" />
          <span className="flex items-center gap-1.5">{event.travelNeeded ? <><Check className="w-3.5 h-3.5" aria-hidden /> Resa ingår (tåg + hotell beräknas)</> : 'Klicka om du behöver resa dit'}</span>
        </button>

        {/* Live total */}
        <AnimatePresence>
          {liveCalc && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="rounded-xl p-3 space-y-2"
              style={{ background: 'var(--color-warning-soft)', boxShadow: 'var(--anchor-shadow-1)' }}>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Biljett</span><span className="text-[var(--color-text-primary)] font-medium">{fmt(liveCalc.ticket)} kr</span></div>
                {liveCalc.travelCost > 0 && <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Tåg/transport</span><span className="text-[var(--color-text-primary)] font-medium">~{fmt(liveCalc.travelCost)} kr</span></div>}
                {liveCalc.hotelCost > 0 && <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Hotell (1 natt)</span><span className="text-[var(--color-text-primary)] font-medium">~{fmt(liveCalc.hotelCost)} kr</span></div>}
                <div className="flex justify-between"><span className="text-[var(--color-text-secondary)]">Mat & övrigt</span><span className="text-[var(--color-text-primary)] font-medium">~{fmt(liveCalc.foodCost)} kr</span></div>
              </div>
              <div className="border-t border-[var(--color-border)] pt-2 flex justify-between items-center">
                <span className="text-xs text-[var(--color-text-secondary)] font-semibold">Totalt</span>
                <span className="text-[var(--color-warning)] font-bold">{fmt(liveCalc.totalCost)} kr</span>
              </div>
              {savingsGoal > 0 && (
                <p className="text-[10px] text-[var(--color-text-secondary)]">
                  = {Math.round(liveCalc.savingsPct)}% av ditt sparmål "{savingsGoalName}"
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Button onClick={handleAnalyze} disabled={!event.name || !event.ticketCost || loading}
        className="w-full h-12 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] font-bold text-white">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyserar upplevelse…</> : <><PartyPopper className="w-4 h-4 mr-2" aria-hidden /> Generera Value Pulse Rapport</>}
      </Button>

      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {(() => {
              return (
                <>
                  {/* Verdict: deterministisk köpverdikt + AI:s narrativa värdebeskrivning */}
                  <div>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-2">{analysis.event.name}</p>
                    <PurchaseVerdictCard price={analysis.totalCost} impact={analysis.impact} bestDate={analysis.bestDate} />
                    {analysis.value_pulse && (
                      <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed italic">"{analysis.value_pulse}"</p>
                    )}
                    {analysis.mood_match && (
                      <div className="mt-3 rounded-lg p-2 text-xs flex items-center gap-1.5" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
                        <Check className="w-3.5 h-3.5 flex-shrink-0" aria-hidden /> Matchar din livsstilsprofil – detta är bra för ditt mående!
                      </div>
                    )}
                  </div>

                  {/* Total cost breakdown */}
                  <div className="rounded-2xl p-4 bg-white border border-[var(--color-border)]" style={{ boxShadow: 'var(--anchor-shadow-1)' }}>
                    <p className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5"><Receipt className="w-3.5 h-3.5" aria-hidden /> Totalbilden</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[var(--color-text-secondary)]">Total uppskattad kostnad</span>
                      <span className="text-xl font-black text-[var(--color-text-primary)]">{fmt(analysis.totalCost)} kr</span>
                    </div>
                    {analysis.travel_breakdown && event.travelNeeded && (
                      <p className="text-xs text-[var(--color-text-secondary)] mt-1">{analysis.travel_breakdown}</p>
                    )}
                  </div>

                  {/* Goal impact */}
                  {analysis.goal_impact && (
                    <div className="rounded-xl p-3 flex gap-2 text-xs"
                      style={{ background: 'var(--color-success-soft)', boxShadow: 'var(--anchor-shadow-1)' }}>
                      <Target className="w-4 h-4 text-[var(--color-success)] flex-shrink-0 mt-0.5" aria-hidden />
                      <p className="text-[var(--color-text-secondary)]">{analysis.goal_impact}</p>
                    </div>
                  )}

                  {/* Smart tip */}
                  {analysis.smart_tip && (
                    <div className="rounded-xl p-3 flex gap-2 text-xs bg-[var(--color-accent-soft)]">
                      <Lightbulb className="w-4 h-4 text-[var(--color-accent)] flex-shrink-0 mt-0.5" aria-hidden />
                      <p className="text-[var(--color-text-secondary)]">{analysis.smart_tip}</p>
                    </div>
                  )}
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}