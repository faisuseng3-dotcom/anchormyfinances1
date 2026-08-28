/** Framer Motion presets — spring sheets, fade routes, stagger lists. */

export const springSheet = {
  type: 'spring',
  damping: 28,
  stiffness: 340,
  mass: 0.75,
};

export const springSheetExit = {
  type: 'spring',
  damping: 32,
  stiffness: 380,
  mass: 0.8,
};

export const springPop = {
  type: 'spring',
  damping: 22,
  stiffness: 380,
  mass: 0.65,
};

export const easeOverlay = {
  duration: 0.22,
  ease: [0.22, 1, 0.36, 1],
};

export const pageEnter = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
};

export const staggerItem = (i = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { delay: i * 0.04, duration: 0.32, ease: [0.22, 1, 0.36, 1] },
});

/**
 * Pure fade/appear entry — no translation, only opacity (+ a barely-there
 * scale). Used for the Dashboard's page-build-in sequence: each element
 * appears exactly where it already sits, nothing slides or flies in.
 * Tune the whole feel from these two constants.
 */
export const DASHBOARD_ENTRY_STAGGER = 0.07;
export const DASHBOARD_ENTRY_DURATION = 0.3;

export const dashboardEntryItem = (i = 0, { reduced = false } = {}) => {
  if (reduced) {
    return {
      initial: { opacity: 1, scale: 1 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    transition: {
      delay: i * DASHBOARD_ENTRY_STAGGER,
      duration: DASHBOARD_ENTRY_DURATION,
      ease: [0.22, 1, 0.36, 1],
    },
  };
};

export const sheetBackdrop = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: easeOverlay,
};

export const sheetPanel = {
  initial: { y: '100%' },
  animate: { y: 0 },
  exit: { y: '100%' },
  transition: springSheet,
};

/** Slide-over drawer från höger */
export const drawerPanel = {
  initial: { x: '100%' },
  animate: { x: 0 },
  exit: { x: '100%' },
  transition: springSheet,
};

export const drawerPanelExit = {
  transition: springSheetExit,
};

/** Cross-fade mellan copilot-vyer */
export const crossFade = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.99 },
  transition: springPop,
};
