import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const STORIES = [
  {
    id: 1,
    emoji: '💰',
    color: '#0D7377',
    title: 'Dagens likviditet',
    preview: 'Du har 28 400 kr att röra dig med idag',
    detail: 'Efter att moms och skatt är reserverade har du 28 400 kr i fritt kapital. Det täcker 3,2 veckors löpande kostnader.',
  },
  {
    id: 2,
    emoji: '🧾',
    color: '#1A6B5A',
    title: 'Faktura hittad',
    preview: 'Jag hittade en obokförd faktura på 14 900 kr',
    detail: 'Apple Store, 2026-04-10. Vill du att jag bokar den under Programvaror & IT (5420) och drar av 2 980 kr i moms?',
    cta: 'Boka nu',
  },
  {
    id: 3,
    emoji: '📈',
    color: '#2D4A8A',
    title: 'Runway-uppdatering',
    preview: 'Din runway är 4,2 månader med nuvarande burn',
    detail: 'Månadskostnaden ligger på 38 500 kr. Om du pausar tre prenumerationer kan du förlänga runway till 5,8 månader.',
    cta: 'Se detaljer',
  },
  {
    id: 4,
    emoji: '⚡',
    color: '#7A3E9D',
    title: 'Skattetips',
    preview: 'Du kör mycket bil — förmånsbil kan löna sig',
    detail: 'Baserat på dina resekvitton ser jag frekventa bilresor. En förmånsbil via firman kan ge dig lägre nettokostnad. Vill du se en kalkyl?',
    cta: 'Räkna ut',
  },
  {
    id: 5,
    emoji: '✅',
    color: '#1A7A4A',
    title: 'Allt ser bra ut',
    preview: 'Momsen är reserverad och inget förfaller',
    detail: 'Du har 12 450 kr reserverat för moms. Nästa inlämning är om 47 dagar. Inga fakturor förfaller den närmaste veckan.',
  },
];

function StoryModal({ story, onClose }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}>
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-t-3xl p-6"
        style={{ background: story.color }}>
        <div className="flex items-start justify-between mb-4">
          <div className="text-4xl">{story.emoji}</div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.2)' }}>
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-xl font-black text-white mb-2">{story.title}</p>
        <p className="text-sm text-white/80 leading-relaxed">{story.detail}</p>
        {story.cta && (
          <button className="mt-4 w-full h-12 rounded-2xl font-bold text-sm"
            style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}>
            {story.cta}
          </button>
        )}
        <div className="mt-4 h-1 rounded-full bg-white/20">
          <motion.div className="h-full rounded-full bg-white" initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 5 }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function StoriesDigest() {
  const [active, setActive] = useState(null);
  const [seen, setSeen] = useState([]);

  const handleOpen = (story) => {
    setActive(story);
    setSeen(s => s.includes(story.id) ? s : [...s, story.id]);
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
        {STORIES.map(story => {
          const isSeen = seen.includes(story.id);
          return (
            <button key={story.id} onClick={() => handleOpen(story)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl relative"
                style={{
                  background: isSeen ? 'rgba(255,255,255,0.06)' : `${story.color}25`,
                  border: isSeen ? '2px solid rgba(255,255,255,0.1)' : `2px solid ${story.color}`,
                }}>
                {story.emoji}
                {!isSeen && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2"
                    style={{ background: '#0D7377', borderColor: '#0F1724' }} />
                )}
              </div>
              <p className="text-[10px] font-semibold text-center w-16 leading-tight truncate"
                style={{ color: isSeen ? 'rgba(155,173,184,0.4)' : 'rgba(240,234,214,0.8)' }}>
                {story.title}
              </p>
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {active && <StoryModal story={active} onClose={() => setActive(null)} />}
      </AnimatePresence>
    </>
  );
}