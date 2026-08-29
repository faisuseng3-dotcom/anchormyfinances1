import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { createPageUrl } from '@/utils';

export default function AuthPageShell({ icon: Icon, title, subtitle, children, footer }) {
  return (
    <div
      className="h-full anchor-scroll-panel flex flex-col items-center justify-center px-6 py-12 anchor-page"
      style={{ background: 'var(--color-background-primary)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          {Icon && (
            <div
              className="w-14 h-14 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'var(--color-surface)' }}
            >
              <Icon className="w-7 h-7" style={{ color: 'var(--color-accent)' }} />
            </div>
          )}
          <h1 className="text-[28px] font-semibold text-[var(--color-text-primary)] tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-[15px] text-[var(--color-text-secondary)] mt-3 leading-relaxed">{subtitle}</p>
          )}
        </div>

        {children}

        {footer ?? (
          <div className="mt-10 pt-8 border-t border-[var(--color-border)] text-center">
            <Link
              to={createPageUrl('Landing')}
              className="text-[13px] text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] no-underline"
            >
              Till startsidan
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}
