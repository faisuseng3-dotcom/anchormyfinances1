import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileUp, Sparkles } from 'lucide-react';

export default function CommandCenter({ onMagicEntry }) {
  return (
    <div
      className="rounded-3xl overflow-hidden relative"
      style={{
        background: 'rgba(6,8,18,0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Horizon line */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(15,222,189,0.3), rgba(167,139,250,0.3), transparent)' }} />

      {/* Scanner sweep */}
      <div className="relative overflow-hidden" style={{ height: 2 }}>
        <motion.div
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-y-0 w-1/4"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.5), transparent)' }}
        />
      </div>

      <div className="flex items-center px-2 py-1">
        {/* CSV Portal */}
        <Link to="/Import" className="flex-1">
          <motion.div
            whileTap={{ scale: 1.08 }}
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl"
            style={{ cursor: 'pointer' }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(15,222,189,0.08)',
                border: '1px solid rgba(15,222,189,0.2)',
                boxShadow: '0 0 12px rgba(15,222,189,0.15)',
              }}
            >
              <FileUp className="w-4 h-4" style={{ color: '#0FDEBD' }} />
            </div>
            <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(15,222,189,0.6)' }}>IMPORTERA</p>
          </motion.div>
        </Link>

        {/* Vertical divider */}
        <div className="w-px self-stretch mx-1" style={{ background: 'rgba(255,255,255,0.05)' }} />

        {/* Magic Entry Portal */}
        <motion.button
          whileTap={{ scale: 1.08 }}
          onClick={onMagicEntry}
          className="flex-1 flex flex-col items-center gap-1.5 py-4 rounded-2xl"
        >
          <motion.div
            animate={{ boxShadow: ['0 0 10px rgba(167,139,250,0.2)', '0 0 22px rgba(167,139,250,0.55)', '0 0 10px rgba(167,139,250,0.2)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(167,139,250,0.1)',
              border: '1px solid rgba(167,139,250,0.3)',
            }}
          >
            <motion.div animate={{ rotate: [0, 20, -20, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}>
              <Sparkles className="w-4 h-4" style={{ color: '#A78BFA' }} />
            </motion.div>
          </motion.div>
          <p className="text-[9px] font-black tracking-widest" style={{ color: 'rgba(167,139,250,0.6)' }}>MAGISK</p>
        </motion.button>
      </div>

      {/* Bottom horizon */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(167,139,250,0.2), rgba(15,222,189,0.2), transparent)' }} />
    </div>
  );
}