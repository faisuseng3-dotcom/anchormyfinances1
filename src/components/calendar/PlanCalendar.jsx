import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from 'lucide-react';
import {
  getCalendarGrid,
  getMonthEventMap,
  getMonthSummary,
  getMonthLabel,
  getWeekdayLabels,
  formatDateKey,
  formatDayHeading,
  formatKr,
  createPlannedEvent,
  EVENT_COLORS,
} from '@/lib/planCalendarEngine';
import { anchorInputClass, anchorPrimaryButtonClass, elevatedSheet } from '@/lib/anchorTheme';

const PLAN_CATEGORIES = [
  { id: 'social', label: 'Middag & umgänge' },
  { id: 'food', label: 'Mat & handla' },
  { id: 'travel', label: 'Resa' },
  { id: 'gift', label: 'Present' },
  { id: 'health', label: 'Hälsa' },
  { id: 'other', label: 'Annat' },
];

function EventDots({ events }) {
  if (!events?.length) return <div className="h-1.5" />;
  const dots = events.slice(0, 3);
  return (
    <div className="flex items-center justify-center gap-[3px] h-1.5 mt-1">
      {dots.map((ev, i) => (
        <span
          key={i}
          className="w-1 h-1 rounded-full"
          style={{ background: ev.color || EVENT_COLORS.planned }}
        />
      ))}
    </div>
  );
}

function DayDetailPanel({ date, events, onClose, onAdd, onRemove, saving }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('social');

  const totalOut = events.reduce((s, e) => (e.amount < 0 ? s + Math.abs(e.amount) : s), 0);
  const totalIn = events.reduce((s, e) => (e.amount > 0 ? s + e.amount : s), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onAdd(createPlannedEvent({
      date: formatDateKey(date),
      title,
      amount,
      category,
    }));
    setTitle('');
    setAmount('');
    setCategory('social');
    setAdding(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/55"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 380 }}
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-[22px] max-h-[82vh] overflow-hidden flex flex-col"
        style={elevatedSheet()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <div>
            <p className="text-[13px] text-white/45 capitalize">{formatDayHeading(date)}</p>
            {totalOut > 0 && (
              <p className="text-[15px] text-white/70 mt-0.5 tabular-nums">
                {totalIn > 0 && <span className="text-emerald-300/90">+{formatKr(totalIn)} · </span>}
                −{formatKr(totalOut)} planerat
              </p>
            )}
          </div>
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-full bg-white/[0.08] flex items-center justify-center">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-4">
          {events.length === 0 && !adding && (
            <p className="text-[14px] text-white/45 py-6 text-center">
              Inga händelser denna dag. Lägg till något du planerar.
            </p>
          )}

          <ul className="space-y-0">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="flex items-center gap-3 py-3.5 border-b border-white/[0.06] last:border-0"
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: ev.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-medium text-white truncate">{ev.title}</p>
                  <p className="text-[12px] text-white/40 mt-0.5">
                    {ev.source === 'auto' ? 'Automatiskt' : 'Din planering'}
                    {ev.note ? ` · ${ev.note}` : ''}
                  </p>
                </div>
                <span className={`text-[15px] font-semibold tabular-nums flex-shrink-0 ${
                  ev.amount > 0 ? 'text-emerald-300' : 'text-white/85'
                }`}>
                  {ev.amount > 0 ? '+' : '−'}{formatKr(ev.amount)}
                </span>
                {ev.source === 'planned' && (
                  <button
                    type="button"
                    onClick={() => onRemove(ev.id)}
                    disabled={saving}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white/35 hover:text-rose-300 hover:bg-white/[0.06] transition-colors"
                    aria-label="Ta bort"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          <AnimatePresence mode="wait">
            {adding ? (
              <motion.form
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSubmit}
                className="mt-4 pt-4 border-t border-white/[0.08] space-y-3"
              >
                <input
                  className={anchorInputClass}
                  placeholder="Vad planerar du?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
                <input
                  className={anchorInputClass}
                  placeholder="Belopp (kr)"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d\s]/g, ''))}
                />
                <div className="flex flex-wrap gap-2">
                  {PLAN_CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                        category === c.id
                          ? 'bg-white text-[#0a1628]'
                          : 'bg-white/[0.08] text-white/65 hover:bg-white/[0.12]'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setAdding(false)}
                    className="flex-1 h-11 rounded-xl text-[14px] font-medium text-white/60 bg-white/[0.06]"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim() || saving}
                    className={`${anchorPrimaryButtonClass} flex-1 h-11 text-[14px]`}
                  >
                    Spara
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.button
                key="add-btn"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                type="button"
                onClick={() => setAdding(true)}
                className="mt-4 w-full flex items-center justify-center gap-2 h-12 rounded-xl border border-dashed border-white/15 text-[14px] font-medium text-white/55 hover:text-white/80 hover:border-white/25 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Lägg till händelse
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="px-5 pb-8 pt-2" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          <div className="flex items-center gap-4 text-[11px] text-white/35">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: EVENT_COLORS.bill }} />
              Fasta & abonnemang
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: EVENT_COLORS.income }} />
              Inkomst
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: EVENT_COLORS.planned }} />
              Din plan
            </span>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function PlanCalendar({ profile, onSavePlannedEvents }) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [panelOpen, setPanelOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const grid = useMemo(() => getCalendarGrid(viewYear, viewMonth), [viewYear, viewMonth]);
  const eventMap = useMemo(
    () => getMonthEventMap(profile, viewYear, viewMonth),
    [profile, viewYear, viewMonth],
  );
  const summary = useMemo(
    () => getMonthSummary(profile, viewYear, viewMonth),
    [profile, viewYear, viewMonth],
  );

  const selectedEvents = useMemo(() => {
    const key = formatDateKey(selectedDate);
    return eventMap[key] || [];
  }, [eventMap, selectedDate]);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(today);
  };

  const handleDayClick = (date, inMonth) => {
    if (!inMonth) {
      setViewYear(date.getFullYear());
      setViewMonth(date.getMonth());
    }
    setSelectedDate(date);
    setPanelOpen(true);
  };

  const persistEvents = async (nextEvents) => {
    if (!onSavePlannedEvents) return;
    setSaving(true);
    try {
      await onSavePlannedEvents(nextEvents);
    } finally {
      setSaving(false);
    }
  };

  const handleAdd = async (event) => {
    const current = profile?.plannedEvents || [];
    await persistEvents([...current, event]);
  };

  const handleRemove = async (id) => {
    const current = profile?.plannedEvents || [];
    await persistEvents(current.filter((e) => e.id !== id));
  };

  const todayKey = formatDateKey(today);
  const selectedKey = formatDateKey(selectedDate);
  const weekdays = getWeekdayLabels();

  return (
    <div className="select-none">
      {/* Month header */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={goPrev}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
          aria-label="Föregående månad"
        >
          <ChevronLeft className="w-5 h-5 text-white/80" />
        </button>

        <button type="button" onClick={goToday} className="text-center">
          <h2 className="text-[20px] font-semibold text-white tracking-tight">
            {getMonthLabel(viewYear, viewMonth)}
          </h2>
          {(viewYear !== today.getFullYear() || viewMonth !== today.getMonth()) && (
            <span className="text-[12px] text-white/40 mt-0.5 block">Tryck för idag</span>
          )}
        </button>

        <button
          type="button"
          onClick={goNext}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.06] hover:bg-white/[0.1] transition-colors"
          aria-label="Nästa månad"
        >
          <ChevronRight className="w-5 h-5 text-white/80" />
        </button>
      </div>

      {/* Month summary strip */}
      {(summary.plannedCount > 0 || summary.autoCount > 0) && (
        <div className="flex items-center gap-3 mb-4 px-1 text-[13px] text-white/50 tabular-nums">
          {summary.plannedCount > 0 && (
            <span>{summary.plannedCount} planerade · {formatKr(summary.plannedTotal)}</span>
          )}
          {summary.autoCount > 0 && (
            <span className="text-white/35">{summary.autoCount} automatiska</span>
          )}
        </div>
      )}

      {/* Weekday row */}
      <div className="grid grid-cols-7 mb-2">
        {weekdays.map((wd, i) => (
          <div key={`${wd}-${i}`} className="text-center text-[11px] font-medium text-white/35 py-1">
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {grid.map(({ date, inMonth }, idx) => {
          const key = formatDateKey(date);
          const events = eventMap[key] || [];
          const isToday = key === todayKey;
          const isSelected = key === selectedKey;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDayClick(date, inMonth)}
              className={`relative flex flex-col items-center py-1.5 rounded-xl transition-colors ${
                inMonth ? 'hover:bg-white/[0.05]' : 'opacity-30'
              }`}
            >
              <span
                className={`w-9 h-9 flex items-center justify-center rounded-full text-[15px] font-medium tabular-nums transition-all ${
                  isSelected
                    ? 'bg-white text-[#0a1628] font-semibold'
                    : isToday
                      ? 'ring-1 ring-white/50 text-white'
                      : inMonth
                        ? 'text-white/90'
                        : 'text-white/40'
                }`}
              >
                {date.getDate()}
              </span>
              <EventDots events={events} />
            </button>
          );
        })}
      </div>

      {/* Selected day preview (when panel closed) */}
      {!panelOpen && selectedEvents.length > 0 && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setPanelOpen(true)}
          className="mt-6 w-full text-left rounded-2xl px-4 py-3.5 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.07] transition-colors"
        >
          <p className="text-[12px] text-white/40 capitalize mb-1">{formatDayHeading(selectedDate)}</p>
          <p className="text-[14px] text-white/80">
            {selectedEvents.length} händelse{selectedEvents.length > 1 ? 'r' : ''}
            {' · '}
            {selectedEvents.slice(0, 2).map((e) => e.title).join(', ')}
            {selectedEvents.length > 2 ? '…' : ''}
          </p>
        </motion.button>
      )}

      <AnimatePresence>
        {panelOpen && (
          <DayDetailPanel
            date={selectedDate}
            events={selectedEvents}
            onClose={() => setPanelOpen(false)}
            onAdd={handleAdd}
            onRemove={handleRemove}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
