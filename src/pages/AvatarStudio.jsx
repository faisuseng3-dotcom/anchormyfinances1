import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AvatarStudioEditor from '@/components/social/avatar/AvatarStudioEditor';
import { useSocialProfile } from '@/hooks/useSocialProfile';
import { isGuestMode } from '@/components/guestStorage';
import { SNAP } from '@/components/social/avatar/bitmojiTheme';
import PageShell from '@/components/layout/PageShell';
import { sectionSubtitleClass } from '@/lib/anchorTheme';

export default function AvatarStudio() {
  const { socialProfile, isLoading, saveSocialProfile } = useSocialProfile({
    enabled: !isGuestMode(),
  });
  const [config, setConfig] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (socialProfile && config === null) {
      const initial =
        socialProfile.avatar_config || socialProfile.avatar_style || undefined;
      if (initial) setConfig(initial);
    }
  }, [socialProfile, config]);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await saveSocialProfile({
        avatar_config: config,
        avatar_style: config,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (isGuestMode()) {
    return (
      <PageShell title="Din avatar" subtitle="Bitmoji" backHref={createPageUrl('Dashboard')}>
        <p className={sectionSubtitleClass}>
          Skapa konto för att designa och spara din avatar.
        </p>
        <Link
          to={createPageUrl('CreateAccount')}
          className="inline-flex mt-4 px-6 py-3 rounded-full font-bold no-underline"
          style={{ background: SNAP.yellow, color: SNAP.text }}
        >
          Skapa konto
        </Link>
      </PageShell>
    );
  }

  if (isLoading && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: SNAP.bg }}>
        <p style={{ color: SNAP.textMuted }}>Laddar din avatar…</p>
      </div>
    );
  }

  return (
    <AvatarStudioEditor
      initialValue={config ?? socialProfile?.avatar_config ?? socialProfile?.avatar_style}
      onChange={setConfig}
      onSave={handleSave}
      saved={saved}
      saving={saving}
      backHref={createPageUrl('Dashboard')}
    />
  );
}
