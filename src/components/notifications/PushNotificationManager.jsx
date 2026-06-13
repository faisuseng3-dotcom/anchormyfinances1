import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

export default function PushNotificationManager() {
  const [status, setStatus] = useState('idle'); // idle | requesting | subscribed | denied | unsupported
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setStatus('unsupported');
      return;
    }

    const perm = Notification.permission;
    if (perm === 'granted') {
      setStatus('subscribed');
    } else if (perm === 'denied') {
      setStatus('denied');
    } else {
      // Visa banner efter 3 sekunder om användaren inte svarat
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const subscribe = async () => {
    setStatus('requesting');
    setShowBanner(false);

    try {
      // Registrera service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Be om tillstånd
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus('denied');
        return;
      }

      // Hämta publik nyckel från backend om VITE-variabel saknas
      let publicKey = VAPID_PUBLIC_KEY;
      if (!publicKey) {
        // Fallback: hämta från environment via en enkel fetch
        const res = await base44.functions.invoke('getVapidPublicKey', {});
        publicKey = res.data?.publicKey;
      }

      if (!publicKey) {
        throw new Error('VAPID public key saknas');
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      });

      const { endpoint, keys } = subscription.toJSON();

      await base44.functions.invoke('savePushSubscription', {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      });

      setStatus('subscribed');
    } catch (err) {
      console.error('Push subscription failed:', err);
      setStatus('denied');
    }
  };

  if (status === 'unsupported' || status === 'subscribed') return null;

  return (
    <AnimatePresence>
      {showBanner && status === 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl p-4 flex items-center gap-3"
          style={{
            background: 'var(--color-card)',
            boxShadow: 'var(--anchor-shadow-1)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.35)'
          }}
        >
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(75,124,243,0.15)', boxShadow: 'var(--anchor-shadow-1)' }}>
            <Bell className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              Aktivera notiser
            </p>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Få varningar om utgifter & sparmöjligheter
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowBanner(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium"
              style={{ color: 'var(--color-text-muted)', background: 'var(--color-surface)' }}
            >
              Senare
            </button>
            <button
              onClick={subscribe}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              Aktivera
            </button>
          </div>
        </motion.div>
      )}

      {status === 'requesting' && (
        <motion.div
          key="requesting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl p-4 flex items-center gap-3"
          style={{ background: 'var(--color-card)', boxShadow: 'var(--anchor-shadow-1)' }}
        >
          <div className="w-5 h-5 rounded-full border-2 animate-spin flex-shrink-0"
            style={{ borderColor: 'var(--color-surface)', borderTopColor: 'var(--color-accent)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Aktiverar notiser...</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}