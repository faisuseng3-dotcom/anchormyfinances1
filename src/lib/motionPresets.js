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
