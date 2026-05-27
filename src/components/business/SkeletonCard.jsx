import React from 'react';

function SkeletonLine({ width = 'w-full', height = 'h-3' }) {
  return (
    <div className={`${height} ${width} rounded-full`}
      style={{
        background: 'linear-gradient(90deg, #E8ECF0 0%, #F4F6F8 50%, #E8ECF0 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.6s ease-in-out infinite',
      }} />
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex-shrink-0"
            style={{ background: '#F4F6F8', animation: 'skeletonShimmer 1.6s ease-in-out infinite', backgroundSize: '200% 100%',
              backgroundImage: 'linear-gradient(90deg, #E8ECF0 0%, #F4F6F8 50%, #E8ECF0 100%)' }} />
          <div className="flex-1 space-y-2">
            <SkeletonLine width="w-1/3" height="h-3" />
            <SkeletonLine width="w-1/2" height="h-2" />
          </div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonLine key={i} width={i % 2 === 0 ? 'w-full' : 'w-3/4'} />
        ))}
      </div>
    </>
  );
}

export function SkeletonHero() {
  return (
    <>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div className="rounded-3xl p-6 space-y-3"
        style={{
          background: 'linear-gradient(145deg, #0D7377 0%, #074f52 100%)',
          boxShadow: '0 12px 40px rgba(13,115,119,0.3)',
        }}>
        <div className="h-3 w-1/3 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }} />
        <div className="h-12 w-2/3 rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }} />
        <div className="h-3 w-1/2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[0,1,2].map(i => (
            <div key={i} className="h-12 rounded-2xl" style={{ background: 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>
      </div>
    </>
  );
}

export default SkeletonCard;