// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { askPersonalAdvisor } from '@/lib/personalAdvisor';
import { useAdvisorContext } from '@/hooks/useAdvisorContext';
import { useOptimisticTransactions } from '@/hooks/useOptimisticTransactions';
import {
  isVoiceExpenseUtterance,
  isVoiceQuickQuestion,
  parseVoiceExpenseLocal,
} from '@/lib/voiceExpenseParse';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, Loader2, Radio } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function VoiceAssistant({ isOpen, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState([]);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const messagesEndRef = useRef(null);

  const { profile, transactions, isDemoMode } = useAdvisorContext();
  const { createTransaction } = useOptimisticTransactions();

  useEffect(() => {
    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'sv-SE';

      recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          handleUserMessage(transcriptText);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Jag hörde inget. Försök igen och prata lite högre.',
            timestamp: new Date()
          }]);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      synthRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setTranscript('');
      setIsListening(true);
      recognitionRef.current.start();
      
      base44.analytics.track({
        eventName: 'voice_assistant_started'
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserMessage = async (text) => {
    const userMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setTranscript('');
    setIsProcessing(true);

    try {
      let question = text;

      const loanMatch = text.match(/(?:lån|skuld|kredit)[^0-9]*(\d[\d\s]*)\s*kr/i);
      if (loanMatch) {
        const amount = parseInt(loanMatch[1].replace(/\s/g, ''));
        if (amount > 0 && profile?.id) {
          const existingLoans = profile?.loans || [];
          const newLoan = { name: 'Mitt lån', totalAmount: amount, interestRate: 10, monthlyPayment: Math.round(amount / 48) };
          await base44.entities.FinancialProfile.update(profile.id, {
            loans: [...existingLoans, newLoan]
          });
          localStorage.setItem('user_debt', amount);
          question += ` (Jag har just registrerat ett lån på ${amount} kr i profilen.)`;
        }
      }

      let response;

      if (isVoiceExpenseUtterance(text)) {
        const parsed = parseVoiceExpenseLocal(text);
        if (parsed) {
          createTransaction({
            type: 'expense',
            amount: parsed.amount,
            label: parsed.label,
            vendor: parsed.vendor,
            category: parsed.category,
          });
          response = `Okej, ${parsed.amount} kr på ${parsed.vendor} är registrerat.`;
        } else {
          const advisor = await askPersonalAdvisor(
            { scenario: 'voice_expense_parse', question: text },
            { profile, transactions, isDemoMode },
          );
          if (advisor.amount) {
            createTransaction({
              type: 'expense',
              amount: advisor.amount,
              label: advisor.vendor,
              vendor: advisor.vendor,
              category: advisor.category || 'other',
            });
          }
          response = advisor.confirm_line || `Registrerat ${advisor.amount || ''} kr.`;
        }
      } else {
        const scenario = isVoiceQuickQuestion(text) ? 'voice_quick_answer' : 'question';
        const advisor = await askPersonalAdvisor(
          { scenario, question },
          { profile, transactions, isDemoMode },
        );
        response = advisor.answer || advisor.message || 'Jag kunde inte formulera ett svar just nu.';
      }

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);

      base44.analytics.track({
        eventName: 'voice_question_asked',
        properties: {
          question_length: text.length
        }
      });

      // Speak the response
      speakText(response);
    } catch (error) {
      console.error('AI error:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Förlåt, jag kunde inte analysera det just nu. Försök igen.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
    }
  };

  const audioRef = useRef(null);

  const speakText = async (text) => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(true);
    try {
      const res = await base44.functions.invoke('tts', { text });
      // res.data is an ArrayBuffer (binary audio)
      const blob = new Blob([res.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
      };
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
    } catch {
      // Fallback to browser TTS if OpenAI fails
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'sv-SE';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    synthRef.current.cancel();
    setIsSpeaking(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg mx-auto rounded-t-[28px] shadow-2xl max-h-[min(85dvh,720px)] flex flex-col ring-1 ring-inset ring-white/10"
          style={{ background: 'linear-gradient(180deg, #0a1628 0%, #050d28 100%)' }}
        >
          <div className="p-6 pb-4 border-b border-white/[0.08] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0D7377]/25 ring-1 ring-[#0FDEBD]/30 flex items-center justify-center">
                <Radio className="w-5 h-5 text-[#0FDEBD]" />
              </div>
              <div>
                <h2 className="font-semibold text-white">Röstrådgivare</h2>
                <p className="text-xs text-white/45">
                  {isListening ? 'Lyssnar…' : isProcessing ? 'Bearbetar…' : isSpeaking ? 'Läser upp…' : 'Redo'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.06] ring-1 ring-white/10 flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-[#0FDEBD]" />
                </div>
                <h3 className="font-semibold text-white mb-2">Prata med Lago</h3>
                <p className="text-sm text-white/50 max-w-xs mx-auto">
                  Fråga om budget, köp eller sparande — svar bygger på din profil och transaktioner.
                </p>
              </div>
            )}

            {messages.map((message, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-[#0D7377] text-white'
                      : 'bg-white/[0.06] ring-1 ring-white/10 text-white/90'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.role === 'assistant' && i === messages.length - 1 && isSpeaking && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={stopSpeaking}
                      className="mt-2 h-7 text-xs"
                    >
                      <Volume2 className="w-3 h-3 mr-1" />
                      Sluta läsa upp
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white/[0.06] ring-1 ring-white/10 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-white/50">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Bearbetar…</span>
                  </div>
                </div>
              </motion.div>
            )}

            {transcript && isListening && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end"
              >
                <div className="bg-[#0D7377]/20 ring-1 ring-[#0FDEBD]/20 rounded-2xl px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-white/80">{transcript}</p>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Microphone Button */}
          <div className="p-6 pt-4 border-t border-white/[0.08]">
            <div className="flex items-center justify-center gap-4">
              {isSpeaking && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopSpeaking}
                  className="rounded-full"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Tysta
                </Button>
              )}
              
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className="relative"
              >
                <motion.div
                  animate={isListening ? {
                    scale: [1, 1.1, 1],
                    opacity: [0.5, 0.8, 0.5]
                  } : {}}
                  transition={{
                    duration: 1.5,
                    repeat: isListening ? Infinity : 0
                  }}
                  className={`absolute inset-0 rounded-full ${
                    isListening ? 'bg-[#0FDEBD]/50' : 'bg-[#0D7377]/60'
                  } blur-xl`}
                />
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                    isListening
                      ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                      : 'bg-gradient-to-br from-[#0D7377] to-[#0a4f52]'
                  } shadow-lg ring-2 ring-[#0FDEBD]/30`}
                >
                  {isProcessing ? (
                    <Loader2 className="w-7 h-7 text-white animate-spin" />
                  ) : isListening ? (
                    <MicOff className="w-7 h-7 text-white" />
                  ) : (
                    <Mic className="w-7 h-7 text-white" />
                  )}
                </motion.div>
              </button>

              {messages.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMessages([])}
                  className="rounded-full"
                >
                  Rensa
                </Button>
              )}
            </div>

            {!recognitionRef.current && (
              <p className="text-xs text-center text-amber-600 mt-3">
                Röststyrning stöds inte i din webbläsare
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}