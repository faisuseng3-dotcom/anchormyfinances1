import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, ThumbsUp, MessageSquare, Lock, Send, X, Check, AlertTriangle, Palette, Train, Monitor, UtensilsCrossed } from 'lucide-react';

const REVIEW_ICON_MAP = {
  software: Palette,
  travel: Train,
  equipment: Monitor,
  dining: UtensilsCrossed,
};

const REVIEW_EVENTS = [
  { id: 1, iconKey: 'software', vendor: 'Adobe Inc', account: '5420', amount: 699, hasReceipt: true, review: null },
  { id: 2, iconKey: 'travel', vendor: 'SJ AB', account: '5800', amount: 580, hasReceipt: true, review: null },
  { id: 3, iconKey: 'equipment', vendor: 'Webhallen', account: '5410', amount: 4990, hasReceipt: false, review: null },
  { id: 4, iconKey: 'dining', vendor: 'Restaurang PM & Vänner', account: '5900', amount: 1840, hasReceipt: false, review: null },
];

export default function ReviewMode() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState(REVIEW_EVENTS);
  const [inviteEmail, setInviteEmail] = useState('');
  const [invited, setInvited] = useState(false);
  const [comment, setComment] = useState({});
  const [commentOpen, setCommentOpen] = useState(null);

  const handleApprove = (id) => setEvents(prev => prev.map(e => e.id === id ? { ...e, review: 'approved' } : e));
  const handleComment = (id, text) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, review: 'comment', reviewText: text } : e));
    setCommentOpen(null);
  };

  const approved = events.filter(e => e.review === 'approved').length;

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl p-4 flex items-center gap-3"
        style={{ background: 'rgba(75,124,243,0.07)', border: '1px solid rgba(75,124,243,0.2)' }}
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(75,124,243,0.15)', border: '1px solid rgba(75,124,243,0.3)' }}>
          <UserCheck className="w-4 h-4" style={{ color: '#4B7CF3' }} />
        </div>
        <div className="text-left flex-1">
          <p className="text-sm font-bold" style={{ color: '#F0EAD6' }}>Bjud in revisor — Review Mode</p>
          <p className="text-xs" style={{ color: 'rgba(155,173,184,0.55)' }}>
            {approved}/{events.length} händelser godkända · Begränsad, säker vy
          </p>
        </div>
        <Lock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgba(155,173,184,0.4)' }} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center"
            style={{ background: 'rgba(0,0,0,0.75)' }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: 80 }}
              animate={{ y: 0 }}
              exit={{ y: 80 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-t-2xl overflow-hidden"
              style={{ background: '#1A2B3C', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              {/* Header */}
              <div className="px-5 pt-5 pb-4 flex items-center justify-between sticky top-0"
                style={{ background: '#1A2B3C', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <p className="font-bold text-sm" style={{ color: '#F0EAD6' }}>Review Mode</p>
                  <p className="text-xs" style={{ color: 'rgba(155,173,184,0.5)' }}>{approved}/{events.length} godkända av revisor</p>
                </div>
                <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <X className="w-4 h-4" style={{ color: 'rgba(155,173,184,0.6)' }} />
                </button>
              </div>

              <div className="px-5 py-4 space-y-3">
                {/* Invite */}
                {!invited ? (
                  <div className="flex gap-2">
                    <input
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="revisor@byrå.se"
                      className="flex-1 h-10 px-3 rounded-xl text-xs"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EAD6' }}
                    />
                    <button
                      onClick={() => inviteEmail && setInvited(true)}
                      className="h-10 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
                      style={{ background: 'rgba(75,124,243,0.2)', color: '#4B7CF3', border: '1px solid rgba(75,124,243,0.4)' }}>
                      <Send className="w-3 h-3" /> Bjud in
                    </button>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl text-center"
                    style={{ background: 'rgba(61,170,122,0.1)', border: '1px solid rgba(61,170,122,0.25)' }}>
                    <p className="text-xs font-bold inline-flex items-center justify-center gap-1" style={{ color: '#3DAA7A' }}><Check className="w-3 h-3" aria-hidden /> Inbjudan skickad till {inviteEmail}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: 'rgba(155,173,184,0.5)' }}>Revisorn ser en begränsad, skrivskyddad vy</p>
                  </div>
                )}

                {/* Events to review */}
                {events.map(e => (
                  <div key={e.id} className="p-3 rounded-xl"
                    style={{
                      background: e.review === 'approved' ? 'rgba(61,170,122,0.07)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${e.review === 'approved' ? 'rgba(61,170,122,0.25)' : e.review === 'comment' ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    <div className="flex items-center gap-3">
                      {(() => { const Icon = REVIEW_ICON_MAP[e.iconKey] || Monitor; return <Icon className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(155,173,184,0.7)' }} aria-hidden />; })()}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold" style={{ color: '#F0EAD6' }}>{e.vendor}</p>
                        <p className="text-[11px]" style={{ color: 'rgba(155,173,184,0.5)' }}>
                          Konto {e.account} · {e.amount.toLocaleString('sv-SE')} kr
                          {!e.hasReceipt && <span className="inline-flex items-center gap-0.5" style={{ color: '#D4AF37' }}> · <AlertTriangle className="w-3 h-3" aria-hidden /> Saknar kvitto</span>}
                        </p>
                        {e.review === 'comment' && (
                          <p className="text-[11px] mt-1 italic inline-flex items-start gap-1" style={{ color: '#D4AF37' }}><MessageSquare className="w-3 h-3 flex-shrink-0 mt-0.5" aria-hidden /> "{e.reviewText}"</p>
                        )}
                      </div>
                      {e.review === 'approved' ? (
                        <Check className="w-3.5 h-3.5" style={{ color: '#3DAA7A' }} aria-hidden />
                      ) : (
                        <div className="flex gap-1.5">
                          <button onClick={() => handleApprove(e.id)}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(61,170,122,0.15)', border: '1px solid rgba(61,170,122,0.3)' }}>
                            <ThumbsUp className="w-3 h-3" style={{ color: '#3DAA7A' }} />
                          </button>
                          <button onClick={() => setCommentOpen(e.id)}
                            className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)' }}>
                            <MessageSquare className="w-3 h-3" style={{ color: '#D4AF37' }} />
                          </button>
                        </div>
                      )}
                    </div>
                    {commentOpen === e.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2 flex gap-2">
                        <input
                          autoFocus
                          value={comment[e.id] || ''}
                          onChange={ev => setComment(prev => ({ ...prev, [e.id]: ev.target.value }))}
                          placeholder="Lämna en kommentar..."
                          className="flex-1 h-9 px-3 rounded-lg text-xs"
                          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#F0EAD6' }}
                        />
                        <button onClick={() => handleComment(e.id, comment[e.id])}
                          className="px-3 h-9 rounded-lg text-xs font-bold"
                          style={{ background: 'rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                          Skicka
                        </button>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}