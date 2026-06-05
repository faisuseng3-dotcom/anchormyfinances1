import { useEffect } from 'react';
import { getNextWeekFixedExpenses } from '@/lib/proactiveAlerts';

/**
 * Skickar högst en proaktiv vecko-varning per dag (lokal notis om tillstånd finns).
 * Server-cron: pushDailyCoach med type week_ahead.
 */
export function useProactiveWeekPush(profile) {
  useEffect(() => {
    if (!profile || typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;

    const alert = getNextWeekFixedExpenses(profile, 7);
    if (!alert || alert.count < 2) return;

    const today = new Date().toISOString().slice(0, 10);
    const key = `anchor_week_push_${today}`;
    if (localStorage.getItem(key)) return;

    try {
      const reg = navigator.serviceWorker?.controller;
      if (reg?.showNotification) {
        reg.showNotification(alert.pushTitle, {
          body: alert.pushBody,
          icon: '/icon-192.png',
          badge: '/icon-96.png',
          tag: 'anchor-week-ahead',
          data: { url: '/FuturePulse' },
        });
      } else {
        new Notification(alert.pushTitle, { body: alert.pushBody, icon: '/icon-192.png' });
      }
      localStorage.setItem(key, '1');
    } catch {
      /* ignore */
    }
  }, [profile]);
}
