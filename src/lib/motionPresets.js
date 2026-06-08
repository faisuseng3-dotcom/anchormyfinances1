/** Framer Motion presets — spring sheets, fade routes, stagger lists. */

export const springSheet = {
  type: 'spring',
  damping: 34,
  stiffness: 380,
  mass: 0.85,
};

export const springSheetExit = {
  type: 'spring',
  damping: 38,
  stiffness: 420,
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
