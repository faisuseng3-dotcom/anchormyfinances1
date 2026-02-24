import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function FeedbackPrompt({ isOpen, onClose, question, options, context }) {
  const [submitted, setSubmitted] = useState(false);

  const handleResponse = async (answer) => {
    // Track feedback
    base44.analytics.track({
      eventName: 'feedback_submitted',
      properties: {
        context,
        question,
        answer
      }
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
      setSubmitted(false);
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-effect rounded-2xl p-6 max-w-sm w-full shadow-xl"
        >
          {!submitted ? (
            <>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2">{question}</h3>
              <p className="text-sm text-slate-400 mb-4">Din feedback hjälper oss förbättra appen</p>

              <div className="space-y-2">
                {options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleResponse(option)}
                    className="w-full p-3 rounded-xl border-2 border-white/10 hover:border-purple-500 hover:bg-purple-500/10 transition-all text-left font-medium text-white"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-3xl"
                >
                  ✓
                </motion.div>
              </div>
              <p className="font-semibold text-white">Tack för din feedback!</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}