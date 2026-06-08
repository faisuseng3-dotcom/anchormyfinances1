// @ts-nocheck
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Touch target ≥48dp med omedelbar tryck-feedback. */
export default function AnchorPressable({
  as: Component = motion.button,
  children,
  className,
  minTouch = true,
  scaleOnPress = true,
  ...props
}) {
  const useButton =
    Component === motion.button ||
    Component === 'button' ||
    /** @type {string} */ (Component) === 'button';
  const MotionComp = useButton ? motion.button : motion(Component);

  return (
    <MotionComp
      type={Component === motion.button ? props.type || 'button' : undefined}
      whileTap={scaleOnPress ? { scale: 0.96, opacity: 0.72 } : { opacity: 0.72 }}
      transition={{ duration: 0.12, ease: 'easeOut' }}
      className={cn(
        'inline-flex items-center justify-center',
        minTouch && 'min-w-12 min-h-12',
        'touch-manipulation select-none',
        className,
      )}
      {...props}
    >
      {children}
    </MotionComp>
  );
}
