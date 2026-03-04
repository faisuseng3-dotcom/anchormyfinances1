import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';

export default function FutureChatBar({ onSubmit, loading }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const examples = [
    'Vad händer om jag tar ledigt i 2 veckor och åker till Spanien?',
    'Hur påverkas jag om jag jobbar 80% och skaffar ett lån på 50 000 kr?',
    'Om jag säger upp mig och lever på A-kassa i 3 månader?',
  ];

  const handleSend = () => {
    if (!text.trim() || loading) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Beskriv ditt scenario med egna ord…"
          className="flex-1 h-12 rounded-xl px-4 text-sm text-white placeholder-slate-500 outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || loading}
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
        >
          {loading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Send className="w-5 h-5 text-white" />}
        </button>
      </div>

      {/* Example chips */}
      <div className="flex flex-wrap gap-2">
        {examples.map((ex, i) => (
          <button key={i} onClick={() => { setText(ex); inputRef.current?.focus(); }}
            className="px-3 py-1.5 rounded-full text-xs text-slate-400 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {ex.length > 45 ? ex.slice(0, 44) + '…' : ex}
          </button>
        ))}
      </div>
    </div>
  );
}