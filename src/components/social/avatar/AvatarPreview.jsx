import React from 'react';
import { AvatarSVG } from './BitmojiEngine';

/** Liten rund förhandsvisning i listor */
export default function AvatarPreview({ config, size = 120, expression }) {
  const bg = config?.bg || '#5AC8FA';
  return (
    <div
      className="rounded-full overflow-hidden flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: bg,
        boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
      }}
    >
      <AvatarSVG config={config} size={size} expression={expression} />
    </div>
  );
}
