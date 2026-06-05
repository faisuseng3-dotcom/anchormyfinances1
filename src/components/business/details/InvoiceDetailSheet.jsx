import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, CheckCircle2, Pencil, FileText, AlertCircle } from 'lucide-react';

const STEPS = ['Skickad', 'Mottagen', 'Förfallen', 'Betald'];

function StatusTimeline({ status }) {
  const activeIdx = status === 'overdue' ? 2 : status === 'paid' ? 3 : status === 'received' ? 1 : 0;
  return (
    <div className="flex items-center gap-0 w-full">
      {STEPS.map((step, i) => {
        const isDone = i <= activeIdx;
        const isOverdue = step === 'Förfallen' && status === 'overdue';
        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center flex-shrink-0" style={{ width: 56 }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all"
                style={{
                  background: isDone ? (isOverdue ? '#E53E3E' : '#0D7377') : '#F4F6F8',
                  borderColor: isDone ? (isOverdue ? '#E53E3E' : '#0D7377') : '#E8ECF0',
                }}>
                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
              </div>
              <p className="text-[9px] font-semibold mt-1 text-center leading-tight"
                style={{ color: isDone ? (isOverdue ? '#E53E3E' : '#0D7377') : '#C0C8D2' }}>
                {step}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mb-4 transition-all"
                style={{ background: i < activeIdx ? '#0D7377' : '#E8ECF0' }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default function InvoiceDetailSheet({ invoice, onClose, onMarkPaid }) {
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState(invoice.client);
  const [sent, setSent] = useState(false);
  const [marked, setMarked] = useState(false);

  const isOverdue = invoice.status === 'overdue';

  const handleReminder = () => {
    setSent(true);
    setTimeout(() => setSent(false), 2500);
  };

  const handleMarkPaid = () => {
    setMarked(true);
    setTimeout(() => {
      if (onMarkPaid) onMarkPaid(invoice.id);
      onClose();
    }, 1000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="w-full max-w-md rounded-t-3xl overflow-hidden"
        style={{ background: '#fff', maxHeight: '88vh', overflowY: 'auto' }}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center justify-between"
          style={{ borderBottom: '1px solid #F0F2F5' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ background: isOverdue ? 'rgba(229,62,62,0.1)' : 'rgba(13,115,119,0.1)' }}>
              {isOverdue
                ? <AlertCircle className="w-5 h-5" style={{ color: '#E53E3E' }} />
                : <FileText className="w-5 h-5" style={{ color: '#0D7377' }} />}
            </div>
            <div>
              {editing ? (
                <input autoFocus value={editNote} onChange={e => setEditNote(e.target.value)}
                  onBlur={() => setEditing(false)}
                  className="text-sm font-black rounded-lg px-2 py-0.5"
                  style={{ color: '#1A2332', border: '1.5px solid #0D7377', background: '#F4F6F8' }} />
              ) : (
                <p className="text-base font-black" style={{ color: '#1A2332' }}>{editNote}</p>
              )}
              <p className="text-xs" style={{ color: '#9AA5B4' }}>{invoice.id} · Förfaller {invoice.due}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(v => !v)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#F4F6F8' }}>
              <Pencil className="w-3.5 h-3.5" style={{ color: '#9AA5B4' }} />
            </button>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: '#F4F6F8' }}>
              <X className="w-4 h-4" style={{ color: '#9AA5B4' }} />
            </button>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Amount */}
          <div className="p-4 rounded-2xl text-center"
            style={{ background: isOverdue ? 'rgba(229,62,62,0.06)' : 'rgba(13,115,119,0.06)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: '#9AA5B4' }}>Fakturabelopp</p>
            <p className="text-3xl font-black" style={{ color: isOverdue ? '#E53E3E' : '#0D7377', letterSpacing: '-1px' }}>
              {invoice.amount.toLocaleString('sv-SE')} kr
            </p>
            {isOverdue && (
              <p className="text-xs font-bold mt-1" style={{ color: '#E53E3E' }}>
                Förfallen sedan {invoice.daysLeft ? Math.abs(invoice.daysLeft) : '?'} dagar
              </p>
            )}
            {!isOverdue && invoice.daysLeft >= 0 && (
              <p className="text-xs mt-1" style={{ color: '#9AA5B4' }}>
                {invoice.daysLeft} dagar kvar
              </p>
            )}
          </div>

          {/* Timeline */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: '#9AA5B4' }}>Status-tidslinje</p>
            <StatusTimeline status={invoice.status} />
          </div>

          {/* Invoice mini-copy */}
          <div className="p-4 rounded-2xl" style={{ background: '#F4F6F8' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: '#9AA5B4' }}>Fakturakopia</p>
            <div className="space-y-2 text-xs">
              {[
                ['Fakturanummer', invoice.id],
                ['Kund', editNote],
                ['Förfallodatum', invoice.due],
                ['Belopp (exkl. moms)', `${Math.round(invoice.amount / 1.25).toLocaleString('sv-SE')} kr`],
                ['Moms 25%', `${Math.round(invoice.amount - invoice.amount / 1.25).toLocaleString('sv-SE')} kr`],
                ['Totalt', `${invoice.amount.toLocaleString('sv-SE')} kr`],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: '#9AA5B4' }}>{label}</span>
                  <span className="font-semibold" style={{ color: '#1A2332' }}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 pb-2">
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleReminder}
              className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={{ background: sent ? 'rgba(13,115,119,0.1)' : '#F4F6F8', color: sent ? '#0D7377' : '#4A5568' }}>
              {sent ? <CheckCircle2 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              {sent ? 'Påminnelse skickad!' : 'Skicka påminnelse'}
            </motion.button>

            {!marked ? (
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleMarkPaid}
                className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: '#0D7377', color: '#fff' }}>
                <CheckCircle2 className="w-4 h-4" />
                Markera som betald
              </motion.button>
            ) : (
              <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                className="w-full h-12 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: 'rgba(13,115,119,0.1)', color: '#0D7377' }}>
                <CheckCircle2 className="w-4 h-4" />
                Betald — flyttar till intäkter...
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}