import type { Variants } from 'framer-motion';

/** Standard easing for UI motion */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** Simple fade */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Fade + rise (cards, sections) */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2 } },
};

/** Scale pop (modals, badges, avatars) */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

/** Springy pop for player joins, reactions */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: 16 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.15 } },
};

/** Parent that staggers children */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  exit: {},
};

/** Child of staggerContainer */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** Attention shake (validation errors, wrong taps) */
export const shake: Variants = {
  visible: { x: 0 },
  shake: {
    x: [0, -10, 10, -6, 6, 0],
    transition: { duration: 0.4 },
  },
};

/** Full-page transition wrapper */
export const pageWrap: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

/** Gentle idle bobble for decorative characters */
export const bobble = {
  animate: { rotate: [-3, 3, -3] as number[], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const } },
};
