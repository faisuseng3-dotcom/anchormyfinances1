import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import AvatarBuilder from '@/components/social/AvatarBuilder';
import { useSocialProfile } from '@/hooks/useSocialProfile';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import { isGuestMode } from '@/components/guestStorage';

export default function AvatarStudio() {
  const { socialProfile, isLoading, saveSocialProfile } = useSocialProfile({
    enabled: !isGuestMode(),
  });
  const [config, setConfig] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialConfig =
    config ??
    socialProfile?.avatar_config ??
    socialProfile?.avatar_style ??
    undefined;

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await saveSocialProfile({
        avatar_config: config,
        avatar_style: config,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  if (isGuestMode()) {
    return (
      <PageShell title="Avatar" subtitle="Skapa din look" backHref={createPageUrl('Dashboard')}>
        <p className={sectionSubtitleClass}>
          Skapa konto för att spara din avatar och visa den i Jämför och Social.
        </p>
        <Link
          to={createPageUrl('CreateAccount')}
          className="inline-flex mt-4 px-6 py-3 rounded-xl font-semibold bg-[#FFE566] text-[#1a1a1a] no-underline"
        >
          Skapa konto
        </Link>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Skapa avatar"
      subtitle="Bitmoji-stil"
      backHref={createPageUrl('Dashboard')}
      className="!pb-28"
    >
      <p className={`${sectionSubtitleClass} -mt-4 mb-4`}>
        Bygg din karaktär som i Snapchat — sparas till din profil och syns när du jämför ekonomi
        med andra.
      </p>

      {isLoading ? (
        <div className="py-20 text-center text-white/50">Laddar…</div>
      ) : (
        <AvatarBuilder
          value={initialConfig}
          onChange={setConfig}
          onSave={handleSave}
          saved={saved}
        />
      )}

      <p className={`${sectionSubtitleClass} text-center mt-6`}>
        Tips: sätt också ett @namn under{' '}
        <Link to={createPageUrl('Social')} className="text-white/70 underline">
          Social
        </Link>{' '}
        så andra känner igen dig.
      </p>
    </PageShell>
  );
}
