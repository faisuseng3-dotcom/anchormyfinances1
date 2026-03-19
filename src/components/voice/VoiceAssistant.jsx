import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mic, MicOff, Volume2, Loader2, Sparkles } from 'lucide-react';
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

  const { data: profile } = useQuery({
    queryKey: ['financialProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FinancialProfile.list();
      return profiles[0] || null;
    }
  });

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
      // Prepare financial context
      const totalSubscriptions = (profile?.subscriptions || []).reduce((sum, s) => sum + s.amount, 0);
      const totalLoanPayments = (profile?.loans || []).reduce((sum, l) => sum + l.monthlyPayment, 0);
      const totalFixedCosts = (profile?.housingCost || 0) + totalSubscriptions + totalLoanPayments;
      const monthlyMargin = (profile?.income || 0) - totalFixedCosts;
      const totalDebt = (profile?.loans || []).reduce((sum, l) => sum + l.totalAmount, 0);

      const contextPrompt = `Du är en muntlig ekonomicoach – som en trygg storasyster eller polare som råkar vara finansexpert. Svara ALLTID på svenska och prata som om du pratar, INTE skriver.

Användarens ekonomi just nu:
- Inkomst: ${profile?.income || 0} kr/mån
- Boende: ${profile?.housingCost || 0} kr
- Abonnemang: ${totalSubscriptions} kr/mån
- Lån: ${totalLoanPayments} kr/mån
- Marginal: ${monthlyMargin} kr
- Buffert: ${profile?.buffer || 0} kr
- Sparmål: ${profile?.savingsGoal || 0} kr (${profile?.savingsGoalName || 'ej satt'})
- Skuld totalt: ${totalDebt} kr

Fråga: "${text}"

RÖSTREGLER – detta är extremt viktigt:
1. Prata talspråkligt. Säg "typ", "alltså", "okej" ibland. Undvik formella ord.
2. KORTA meningar. Max 2-3 meningar totalt.
3. Istället för "Du har spenderat 500 kronor" – säg "okej, en femhundring rök".
4. Börja gärna med "Hörru," eller "Okej så," eller "Alltså," för att låta naturlig.
5. Inga bullet points, inga rubriker, inga stjärnor. Ren text för tal.
6. Använd siffror konkret men avrunda gärna. "typ tolv hundra kvar" istället för "1 247 kronor".
7. Avsluta med en enkel uppmuntran eller ett tips – kort.

Svara nu med ren taltext:`;

      // Detect loan registration intent
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
        }
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: contextPrompt + (loanMatch ? '\n\nOBS: AI:n har precis sparat detta lån i profilen. Bekräfta det i svaret och hänvisa till Lånintelligens-sidan.' : '')
      });

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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-gradient-to-b from-white to-slate-50 rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-900">AI-coach</h2>
                <p className="text-xs text-slate-500">
                  {isListening ? 'Lyssnar...' : isProcessing ? 'Analyserar...' : isSpeaking ? 'Svarar...' : 'Redo att hjälpa'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <Mic className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Prata med din AI-coach</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto">
                  Fråga om dina köp, ekonomi eller få råd. Jag analyserar din situation i realtid.
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
                      ? 'bg-purple-600 text-white'
                      : 'bg-white border border-slate-100 text-slate-900'
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
                <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Analyserar din ekonomi...</span>
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
                <div className="bg-purple-100 rounded-2xl px-4 py-3 max-w-[80%]">
                  <p className="text-sm text-purple-900">{transcript}</p>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Microphone Button */}
          <div className="p-6 pt-4 border-t border-slate-100">
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
                    isListening ? 'bg-purple-400' : 'bg-purple-500'
                  } blur-xl`}
                />
                <motion.div
                  whileTap={{ scale: 0.95 }}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center ${
                    isListening
                      ? 'bg-gradient-to-br from-rose-500 to-rose-600'
                      : 'bg-gradient-to-br from-purple-500 to-purple-600'
                  } shadow-lg`}
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