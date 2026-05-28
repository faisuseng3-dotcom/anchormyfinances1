import React, { useState, useRef } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { anchorInputClass, anchorIconButtonClass } from '@/lib/anchorTheme';

const EXAMPLES = [
  'Ledigt i 2 veckor utan lön',
  'Jobba 80 % och låna 50 000 kr',
  'A-kassa i 3 månader',
];

export default function FutureChatBar({ onSubmit, loading }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSend = () => {
    if (!text.trim() || loading) return;
    onSubmit(text.trim());
    setText('');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Beskriv vad som skulle hända…"
          className={`${anchorInputClass} flex-1`}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || loading}
          className={`${anchorIconButtonClass} disabled:opacity-40`}
          aria-label="Beräkna"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setText(ex);
              inputRef.current?.focus();
            }}
            className="px-3 py-1.5 rounded-lg text-[13px] text-white/50 hover:text-white/75 bg-white/[0.05] transition-colors"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
