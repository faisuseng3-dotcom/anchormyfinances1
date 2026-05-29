import React, { useRef, useState } from 'react';
import { Camera, Loader2, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfileAvatar from './ProfileAvatar';

const MAX_BYTES = 5 * 1024 * 1024;

export default function ProfilePhotoUpload({
  profile,
  onPhotoChange,
  size = 64,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const pick = () => {
    if (!disabled && !uploading) inputRef.current?.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Välj en bildfil (JPG, PNG, WebP).');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Bilden får max vara 5 MB.');
      return;
    }

    setError(null);
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onPhotoChange?.(file_url);
    } catch {
      setError('Uppladdningen misslyckades. Försök igen.');
    } finally {
      setUploading(false);
    }
  };

  const remove = () => {
    setError(null);
    onPhotoChange?.(null);
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="relative">
        <button
          type="button"
          onClick={pick}
          disabled={disabled || uploading}
          className="relative rounded-full p-0 border-0 bg-transparent cursor-pointer disabled:opacity-60"
          aria-label="Byt profilbild"
        >
          <ProfileAvatar profile={profile} size={size} />
          <span
            className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-[var(--color-background-primary)]"
            style={{ background: 'var(--color-accent)' }}
          >
            {uploading ? (
              <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-white" />
            )}
          </span>
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFile}
        />
      </div>

      {profile?.profile_photo_url && !uploading && (
        <button
          type="button"
          onClick={remove}
          disabled={disabled}
          className="flex items-center gap-1 text-[11px] font-semibold opacity-70 hover:opacity-100"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Trash2 className="w-3 h-3" />
          Ta bort bild
        </button>
      )}

      {error && (
        <p className="text-[11px] font-medium" style={{ color: '#E53E3E' }}>
          {error}
        </p>
      )}
    </div>
  );
}
