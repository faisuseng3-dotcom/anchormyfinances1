// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export function AnimatedNumber({ value, duration = 1.5, className = '' }) {
  const spring = useSpring(0, { 
    duration: duration * 1000,
    bounce: 0 
  });
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString('sv-SE')
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={className}>
      {display}
    </motion.span>
  );
}

export function AnimatedCurrency({ value, duration = 1.5, className = '', suffix = ' kr' }) {
  const spring = useSpring(0, { 
    duration: duration * 1000,
    bounce: 0 
  });
  
  const [displayValue, setDisplayValue] = useState('0');

  useEffect(() => {
    spring.set(value);
    
    const unsubscribe = spring.onChange((latest) => {
      const rounded = Math.round(latest);
      const formatted = rounded.toLocaleString('sv-SE').replace(/,/g, ' ');
      setDisplayValue(formatted);
    });

    return unsubscribe;
  }, [spring, value]);

  return (
    <span className={className}>
      {displayValue}{suffix}
    </span>
  );
}