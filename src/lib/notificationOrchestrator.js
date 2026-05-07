/**
 * Notification Orchestrator
 * Sitter som ett lager mellan alla push-funktioner och användaren.
 * Prioriterar och köar notiser baserat på MLI och tid sedan senaste notis.
 */

const PRIORITY = {
  CRITICAL: 1,   // Saldo < 0, köpångest, bedrägeri
  STANDARD: 2,   // Budgetuppdateringar, insikter
  LOW: 3,        // Galaxy-achievements, social pepp
};

const COOLDOWN_MS = 2 * 60 * 60 * 1000; // 2 timmar
const QUEUE_KEY = 'anchor_notification_queue';
const LAST_NOTIF_KEY = 'anchor_last_notification_ts';

/**
 * Hämtar köade notiser.
 * @returns {Array}
 */
function getQueue() {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return [];
  }
}

/**
 * Sparar köade notiser.
 * @param {Array} queue
 */
function saveQueue(queue) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Kontrollerar om vi är i en "lugn period" för köade notiser (kl. 07:00–09:00).
 * @returns {boolean}
 */
function isDeliveryWindow() {
  const hour = new Date().getHours();
  return hour >= 7 && hour <= 9;
}

/**
 * Huvudfunktion: bestämmer om en notis ska skickas direkt, köas eller blockeras.
 *
 * @param {object} notification - { title, body, priority: 1|2|3 }
 * @param {number} mliScore - 0–100
 * @param {Function} sendFn - asynkron funktion som faktiskt skickar push
 * @returns {Promise<'sent'|'queued'|'blocked'>}
 */
export async function orchestrateNotification(notification, mliScore, sendFn) {
  const { priority = PRIORITY.STANDARD } = notification;
  const now = Date.now();
  const lastTs = parseInt(localStorage.getItem(LAST_NOTIF_KEY) || '0', 10);
  const timeSinceLast = now - lastTs;

  // P1 skickas ALLTID direkt, inga spärrar
  if (priority === PRIORITY.CRITICAL) {
    await sendFn(notification);
    localStorage.setItem(LAST_NOTIF_KEY, String(now));
    return 'sent';
  }

  // Om MLI > 75 blockeras allt utom P1
  if (mliScore > 75) {
    const queue = getQueue();
    queue.push({ ...notification, queuedAt: now });
    saveQueue(queue);
    return 'queued';
  }

  // Om det gått < 2h sedan senaste notis, köa P2 och P3
  if (timeSinceLast < COOLDOWN_MS) {
    const queue = getQueue();
    queue.push({ ...notification, queuedAt: now });
    saveQueue(queue);
    return 'queued';
  }

  // Annars: skicka direkt
  await sendFn(notification);
  localStorage.setItem(LAST_NOTIF_KEY, String(now));
  return 'sent';
}

/**
 * Levererar köade notiser om vi är i ett leveransfönster (07–09).
 * Anropas vid session-start.
 * @param {number} mliScore
 * @param {Function} sendFn
 */
export async function flushQueuedNotifications(mliScore, sendFn) {
  if (!isDeliveryWindow()) return;
  const queue = getQueue();
  if (!queue.length) return;

  // Skicka max 2 köade notiser per session, prioritet-sorterat
  const sorted = [...queue].sort((a, b) => (a.priority || 2) - (b.priority || 2));
  const toSend = sorted.slice(0, 2);
  const remaining = sorted.slice(2);

  for (const notif of toSend) {
    if (mliScore <= 75 || notif.priority === PRIORITY.CRITICAL) {
      await sendFn(notif);
    }
  }

  saveQueue(remaining);
  localStorage.setItem(LAST_NOTIF_KEY, String(Date.now()));
}

export { PRIORITY };