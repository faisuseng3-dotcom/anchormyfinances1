import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AvatarEditor from '@/components/social/avatar/AvatarEditor';
import { useSocialProfile } from '@/hooks/useSocialProfile';
import { isGuestMode } from '@/components/guestStorage';
import PageShell from '@/components/layout/PageShell';
import { sectionSubtitleClass } from '@/lib/anchorTheme';
import { configForSave, DEFAULT_AVATAR_CONFIG } from '@/components/social/avatar/avatarConfig';

export default function AvatarStudio() {
  const { socialProfile, isLoading, saveSocialProfile } = useSocialProfile({
    enabled: !isGuestMode(),
  });
  const [config, setConfig] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (socialProfile && config === null) {
      const initial = socialProfile.avatar_config || socialProfile.avatar_style;
      setConfig(initial ? configForSave({ ...DEFAULT_AVATAR_CONFIG, ...initial }) : configForSave(DEFAULT_AVATAR_CONFIG));
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
      <PageShell title="Din avatar" subtitle="Profilbild" backHref={createPageUrl('Dashboard')}>
        <p className={sectionSubtitleClass}>
          Skapa konto för att designa och spara din avatar.
        </p>
        <Link
          to={createPageUrl('CreateAccount')}
          className="inline-flex mt-4 px-6 py-3 rounded-full font-bold no-underline text-white"
          style={{ background: 'var(--color-accent)' }}
        >
          Skapa konto
        </Link>
      </PageShell>
    );
  }

  if (isLoading && !config) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background-primary)' }}>
        <p style={{ color: 'var(--color-text-muted)' }}>Laddar…</p>
      </div>
    );
  }

  return (
    <AvatarEditor
      initialValue={config ?? socialProfile?.avatar_config ?? socialProfile?.avatar_style ?? DEFAULT_AVATAR_CONFIG}
      onChange={setConfig}
      onSave={handleSave}
      saved={saved}
      saving={saving}
      backHref={createPageUrl('Social')}
    />
  );
}
