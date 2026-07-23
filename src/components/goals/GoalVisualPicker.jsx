import React, { useRef, useState } from 'react';
import { Camera, ImageIcon, Loader2, Trash2, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { DREAM_GOAL_ICON_OPTIONS } from '@/lib/anchorIcons';
import VisualSavingsGoalRing from './VisualSavingsGoalRing';

const MAX_BYTES = 5 * 1024 * 1024;

/**
 * Kräver bild ELLER vald symbol (inte default) — stödjer Hershfield-visualisering.
 */
export default function GoalVisualPicker({
  imageUrl = null,
  iconId = 'default',
  visualType = 'icon',
  onChange,
  previewPct = 12,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState(imageUrl ? 'image' : 'icon');

  const pickImage = () => {
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
      onChange?.({ imageUrl: file_url, iconId, visualType: 'image' });
      setTab('image');
    } catch {
      setError('Uppladdningen misslyckades. Försök igen.');
    } finally {
      setUploading(false);
    }
  };

  const selectIcon = (id) => {
    setError(null);
    onChange?.({ imageUrl: null, iconId: id, visualType: 'icon' });
    setTab('icon');
  };

  const removeImage = () => {
    setError(null);
    onChange?.({ imageUrl: null, iconId, visualType: iconId !== 'default' ? 'icon' : null });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setTab('image')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'image'
              ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
              : 'bg-white/5 text-white/50 hover:text-white/80'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          Ladda upp bild
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setTab('icon')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'icon'
              ? 'bg-[#4fae82]/20 text-[#4fae82] ring-1 ring-[#4fae82]/40'
              : 'bg-white/5 text-white/50 hover:text-white/80'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Välj symbol
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-5">
        <VisualSavingsGoalRing
          pct={previewPct}
          size={112}
          stroke={6}
          imageUrl={visualType === 'image' ? imageUrl : null}
          iconId={iconId}
          showMilestones
        />
        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs text-white/45 leading-relaxed">
            Din bild blir skarpare ju närmare målet du kommer — så du ser ditt framtida jag ta form.
          </p>
          {(imageUrl || (iconId && iconId !== 'default')) && (
            <p className="text-[11px] text-emerald-400/90 mt-2 font-medium">Visuellt mål valt</p>
          )}
        </div>
      </div>

      {tab === 'image' && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={pickImage}
            disabled={disabled || uploading}
            className="w-full py-4 rounded-3xl border-dashed border-white/15 hover:border-emerald-500/40 bg-white/[0.03] flex flex-col items-center gap-2 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            ) : (
              <ImageIcon className="w-6 h-6 text-white/40" />
            )}
            <span className="text-sm text-white/70">
              {uploading ? 'Laddar upp…' : imageUrl ? 'Byt bild' : 'T.ex. strand, bil eller drömbostad'}
            </span>
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleFile}
          />
          {imageUrl && !uploading && (
            <button
              type="button"
              onClick={removeImage}
              disabled={disabled}
              className="flex items-center gap-1 text-[11px] font-semibold text-white/45 hover:text-white/70"
            >
              <Trash2 className="w-3 h-3" />
              Ta bort bild
            </button>
          )}
        </div>
      )}

      {tab === 'icon' && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {DREAM_GOAL_ICON_OPTIONS.filter((o) => o.id !== 'default').map(({ id, Icon }) => (
            <button
              key={id}
              type="button"
              disabled={disabled}
              onClick={() => selectIcon(id)}
              className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${
                iconId === id && visualType === 'icon'
                  ? 'bg-[#4fae82]/30 ring-2 ring-[#4fae82] scale-105'
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <Icon className="w-8 h-8 text-[#4fae82]" strokeWidth={1.6} />
            </button>
          ))}
        </div>
      )}

      {error && (
        <p className="text-[11px] font-medium text-rose-400">{error}</p>
      )}
    </div>
  );
}
