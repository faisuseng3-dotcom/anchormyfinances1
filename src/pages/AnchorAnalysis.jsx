import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import AnchorChat from '@/components/chat/AnchorChat';

export default function AnchorAnalysis() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '20px 16px 10px', flexShrink: 0 }}>
        <h1 className="anchor-wordmark" style={{ fontSize: 22, color: 'white', margin: 0, lineHeight: 1 }}>
          Anchor
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', marginTop: 5 }}>
          Din personliga ekonomirådgivare
        </p>
      </div>
      <AnchorChat />
    </div>
  );
}

export const pageSeo = pageSeoFor('AnchorAnalysis');
