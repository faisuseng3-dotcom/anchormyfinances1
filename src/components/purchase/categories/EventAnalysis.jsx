import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PartyPopper, Link2, Loader2, MapPin, Train, Hotel } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';

const fmt = (v) => Math.round(v || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

export default function EventAnalysis({ mode, profile }) {
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

Ge:
1. cfo_verdict: "Kör på!" | "Planera smart" | "Vänta lite" | "Skippa"
2. cfo_score: 1-10 (10 = självklart värt det)
3. value_pulse: En mening om upplevelsevärdet. Känn och kreativ. SVENSKA.
4. total_real_cost: Uppskattad total kostnad inkl. allt (kr) baserat på stad och eventtyp
5. travel_breakdown: Om resa: kort breakdown av tåg, hotell, mat. SVENSKA.
6. goal_impact: En mening om hur detta påverkar sparmålet. SVENSKA.
7. smart_tip: Ett konkret tips för att göra upplevelsen billigare utan att sänka glädjen. SVENSKA.
8. mood_match: true/false - Matchar eventet användarens livsstilsmål?

Svara ENDAST med JSON.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          cfo_verdict: { type: 'string' },
          cfo_score: { type: 'number' },
          value_pulse: { type: 'string' },
          total_real_cost: { type: 'number' },
          travel_breakdown: { type: 'string' },
          goal_impact: { type: 'string' },
          smart_tip: { type: 'string' },
          mood_match: { type: 'boolean' },
        }
      }
    });

    setAnalysis({ ...liveCalc, ...ai, event });
    setLoading(false);
  };

  const VERDICT_COLOR = {
    'Kör på!': '#10B981',
    'Planera smart': '#6366F1',
    'Vänta lite': '#F59E0B',
    'Skippa': '#EF4444',
  };

  return (
    <div className="space-y-5">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 space-y-4"
        style={{ background: 'rgba(17,24,39,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h3 className="font-semibold text-white flex items-center gap-2">
          <PartyPopper className="w-5 h-5 text-amber-400" /> Eventinformation
        </h3>

        {/* URL */}
        <div>
          <Label className="text-xs text-slate-400">URL (Ticketmaster, Airbnb, Booking…)</Label>
          <div className="flex gap-2 mt-1">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input value={urlInput} onChange={e => setUrlInput(e.target.value)}
                placeholder="https://ticketmaster.se/…" className="pl-9 h-10 text-sm" />
            </div>
            <Button onClick={handleUrlAutofill} disabled={!urlInput || urlLoading} size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 h-10 flex-shrink-0">
              {urlLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Hämta'}
            </Button>
          </div>
        </div>

        <div>
          <Label className="text-xs text-slate-400">Eventnamn</Label>
          <Input value={event.name} onChange={e => setEvent(ev => ({ ...ev, name: e.target.value }))}
            placeholder="Taylor Swift, Midsommarfest, Berlin-weekend…" className="mt-1 h-10 text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-slate-400">Biljettpris / kostnad (kr)</Label>
            <Input type="number" value={event.ticketCost} onChange={e => setEvent(ev => ({ ...ev, ticketCost: e.target.value }))}
              placeholder="1 200" className="mt-1 h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Stad</Label>
            <Input value={event.city} onChange={e => setEvent(ev => ({ ...ev, city: e.target.value }))}
              placeholder="Stockholm, Göteborg…" className="mt-1 h-10 text-sm" />
          </div>
          <div>
            <Label className="text-xs text-slate-400">Datum</Label>
            <Input value={event.date} onChange={e => setEvent(ev => ({ ...ev, date: e.target.value }))}
              placeholder="15 aug 2026" className="mt-1 h-10 text-sm" />
          </div>
        </div>

        {/* Travel toggle */}
        <button onClick={() => setEvent(ev => ({ ...ev, travelNeeded: !ev.travelNeeded }))}
          className={`w-full py-3 px-4 rounded-xl flex items-center gap-3 border transition-all text-sm ${event.travelNeeded ? 'border-amber-500 bg-amber-500/10 text-amber-300' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
          <Train className="w-4 h-4" />
          <span>{event.travelNeeded ? '✓ Resa ingår (tåg + hotell beräknas)' : 'Klicka om du behöver resa dit'}</span>
        </button>

        {/* Live total */}
        <AnimatePresence>
          {liveCalc && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="rounded-xl p-3 space-y-2"
              style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500">Biljett</span><span className="text-white font-medium">{fmt(liveCalc.ticket)} kr</span></div>
                {liveCalc.travelCost > 0 && <div className="flex justify-between"><span className="text-slate-500">Tåg/transport</span><span className="text-white font-medium">~{fmt(liveCalc.travelCost)} kr</span></div>}
                {liveCalc.hotelCost > 0 && <div className="flex justify-between"><span className="text-slate-500">Hotell (1 natt)</span><span className="text-white font-medium">~{fmt(liveCalc.hotelCost)} kr</span></div>}
                <div className="flex justify-between"><span className="text-slate-500">Mat & övrigt</span><span className="text-white font-medium">~{fmt(liveCalc.foodCost)} kr</span></div>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-semibold">Totalt</span>
                <span className="text-amber-400 font-bold">{fmt(liveCalc.totalCost)} kr</span>
              </div>
              {savingsGoal > 0 && (
                <p className="text-[10px] text-slate-500">
                  = {Math.round(liveCalc.savingsPct)}% av ditt sparmål "{savingsGoalName}"
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Button onClick={handleAnalyze} disabled={!event.name || !event.ticketCost || loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 font-bold text-white">
        {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Analyserar upplevelse…</> : '🎉 Generera Value Pulse Rapport'}
      </Button>

      <AnimatePresence>
        {analysis && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {(() => {
              const vc = VERDICT_COLOR[analysis.cfo_verdict] || '#F59E0B';
              return (
                <>
                  {/* Verdict */}
                  <div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${vc}11 0%, transparent 100%)`, border: `1px solid ${vc}44` }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">{analysis.event.name}</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-lg font-black"
                          style={{ color: vc }}>{analysis.cfo_verdict}</div>
                        <p className="text-sm text-slate-300 mt-2 leading-relaxed italic">"{analysis.value_pulse}"</p>
                      </div>
                      <div className="text-center ml-4">
                        <div className="text-4xl font-black" style={{ color: vc }}>{analysis.cfo_score}</div>
                        <div className="text-[10px] text-slate-500">VÄRDE</div>
                      </div>
                    </div>
                    {analysis.mood_match && (
                      <div className="mt-3 rounded-lg p-2 text-xs bg-emerald-500/10 text-emerald-300">
                        ✓ Matchar din livsstilsprofil – detta är bra för ditt mående!
                      </div>
                    )}
                  </div>

                  {/* Total cost breakdown */}
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(17,24,39,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🧾 Totalbilden</p>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Total uppskattad kostnad</span>
                      <span className="text-xl font-black text-white">{fmt(analysis.total_real_cost || analysis.totalCost)} kr</span>
                    </div>
                    {analysis.travel_breakdown && event.travelNeeded && (
                      <p className="text-xs text-slate-400 mt-1">{analysis.travel_breakdown}</p>
                    )}
                  </div>

                  {/* Goal impact */}
                  {analysis.goal_impact && (
                    <div className="rounded-xl p-3 flex gap-2 text-xs"
                      style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.2)' }}>
                      <span className="text-indigo-400">🎯</span>
                      <p className="text-slate-300">{analysis.goal_impact}</p>
                    </div>
                  )}

                  {/* Smart tip */}
                  {analysis.smart_tip && (
                    <div className="rounded-xl p-3 flex gap-2 text-xs"
                      style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <span className="text-emerald-400">💡</span>
                      <p className="text-slate-300">{analysis.smart_tip}</p>
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