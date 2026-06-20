// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, Download, Trash2, Pencil, X, Check, ChevronLeft } from 'lucide-react';
import PageShell, { GlassSection } from '@/components/layout/PageShell';
import { useFinancialProfile } from '@/hooks/useFinancialProfile';
import {
  listSemanticMemories,
  updateSemanticMemory,
  deleteSemanticMemory,
  clearAllUserMemory,
  exportUserMemory,
  setMemoryEnabled,
  isMemoryEnabled,
  MEMORY_UX_NOTICE,
} from '@/lib/anchorMemory';
import { MEMORY_TYPE_LABELS } from '@/lib/anchorMemory/types';
import { anchorPrimaryButtonClass, anchorSecondaryButtonClass } from '@/lib/anchorTheme';
import { toast } from 'sonner';

function MemoryRow({ memory, onEdit, onDelete }) {
  const label = MEMORY_TYPE_LABELS[memory.type] || memory.type;
  const date = new Date(memory.createdAt || memory.updatedAt || Date.now()).toLocaleDateString('sv-SE');

  return (
    <div className="flex items-start gap-3 py-3 border-b border-white/[0.06] last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-white/40 uppercase tracking-wide">{label}</p>
        <p className="text-[14px] text-white/85 mt-0.5 leading-relaxed">{memory.value}</p>
        <p className="text-[11px] text-white/30 mt-1">{date}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(memory)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-white/[0.06] text-white/60"
          aria-label="Redigera minne"
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          onClick={() => onDelete(memory.id)}
          className="w-9 h-9 rounded-full flex items-center justify-center bg-rose-500/10 text-rose-300/80"
          aria-label="Ta bort minne"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export default function AIMemoryProfile() {
  const { profile, updateProfile, isLoading } = useFinancialProfile();
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const memoryOn = isMemoryEnabled(profile);

  const reload = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    const list = await listSemanticMemories(profile);
    setMemories(list.filter((m) => m.active !== false));
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleToggle = async () => {
    await setMemoryEnabled(profile, updateProfile, !memoryOn);
    if (!memoryOn) {
      toast.success('Minne aktiverat');
      reload();
    } else {
      setMemories([]);
      toast.success('Minne avstängt och raderat');
    }
  };

  const handleExport = async () => {
    const data = await exportUserMemory(profile);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anchor-minne-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Minnen exporterade');
  };

  const handleDeleteMemory = async (id) => {
    await deleteSemanticMemory(profile, id);
    setMemories((prev) => prev.filter((m) => m.id !== id));
    toast.success('Minne borttaget');
  };

  const handleSaveEdit = async () => {
    if (!editing || !editValue.trim()) return;
    await updateSemanticMemory(profile, editing.id, { value: editValue.trim() });
    setEditing(null);
    reload();
    toast.success('Minne uppdaterat');
  };

  const handleClearAll = async () => {
    await clearAllUserMemory(profile);
    setMemories([]);
    setConfirmClear(false);
    toast.success('All historik och minnen raderade');
  };

  if (isLoading || !profile) {
    return (
      <PageShell title="Min AI-profil" backHref={createPageUrl('Settings')}>
        <p className="text-white/50 text-sm">Laddar…</p>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Min AI-profil"
      subtitle="Det Anchor kommer ihåg om dig"
      backHref={createPageUrl('Settings')}
    >
      <GlassSection>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--color-accent)]/15 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-[var(--color-accent)]" />
          </div>
          <div className="flex-1">
            <p className="anchor-card-title">Personligt minne</p>
            <p className="anchor-type-body-sm mt-1">{MEMORY_UX_NOTICE}</p>
          </div>
        </div>

        <label className="flex items-center justify-between mt-5 py-3 border-t border-white/[0.06] cursor-pointer">
          <span className="text-[15px] text-white/80">Kom ihåg tidigare diskussioner</span>
          <button
            type="button"
            role="switch"
            aria-checked={memoryOn}
            onClick={handleToggle}
            className={`relative w-12 h-7 rounded-full transition-colors ${memoryOn ? 'bg-[var(--color-accent)]' : 'bg-white/15'}`}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${memoryOn ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </label>
      </GlassSection>

      {memoryOn && (
        <>
          <GlassSection className="mt-6">
            <p className="anchor-card-title mb-1">Sparade minnen</p>
            <p className="anchor-type-body-sm mb-4">
              Mål, köp, resor och andra saker du diskuterat med Anchor.
            </p>

            {loading ? (
              <p className="text-white/40 text-sm">Laddar minnen…</p>
            ) : memories.length === 0 ? (
              <p className="text-white/40 text-sm py-4">
                Inga minnen ännu. Prata med Coach, analysera köp eller planera resor — Anchor sparar det viktigaste automatiskt.
              </p>
            ) : (
              <div>
                {memories.map((m) => (
                  <MemoryRow
                    key={m.id}
                    memory={m}
                    onEdit={(mem) => { setEditing(mem); setEditValue(mem.value); }}
                    onDelete={handleDeleteMemory}
                  />
                ))}
              </div>
            )}
          </GlassSection>

          {editing && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50">
              <div className="w-full max-w-md rounded-2xl bg-[#0a1028] p-5 ring-1 ring-white/10">
                <p className="anchor-card-title mb-3">Redigera minne</p>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full min-h-[100px] rounded-xl bg-white/[0.06] border-0 text-white text-[14px] p-3 resize-none"
                />
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={() => setEditing(null)} className={`flex-1 ${anchorSecondaryButtonClass}`}>
                    <X size={16} className="mr-1" /> Avbryt
                  </button>
                  <button type="button" onClick={handleSaveEdit} className={`flex-1 ${anchorPrimaryButtonClass}`}>
                    <Check size={16} className="mr-1" /> Spara
                  </button>
                </div>
              </div>
            </div>
          )}

          <GlassSection className="mt-6 space-y-3">
            <p className="anchor-card-title">Integritet</p>
            <p className="anchor-type-body-sm">
              Du äger ditt minne. Exportera, radera enskilda minnen eller rensa allt.
            </p>

            <button type="button" onClick={handleExport} className={`w-full ${anchorSecondaryButtonClass}`}>
              <Download size={16} className="mr-2" />
              Exportera minnen (JSON)
            </button>

            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="w-full min-h-12 rounded-full text-[14px] font-semibold text-rose-200 bg-rose-500/15 ring-1 ring-rose-400/25"
            >
              <Trash2 size={16} className="inline mr-2" />
              Rensa all historik
            </button>
          </GlassSection>
        </>
      )}

      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-sm rounded-2xl bg-[#0a1028] p-5 ring-1 ring-white/10">
            <p className="anchor-card-title">Rensa allt?</p>
            <p className="anchor-type-body-sm mt-2">
              All konversationshistorik och alla sparade minnen tas bort permanent.
            </p>
            <div className="flex gap-2 mt-5">
              <button type="button" onClick={() => setConfirmClear(false)} className={`flex-1 ${anchorSecondaryButtonClass}`}>
                Avbryt
              </button>
              <button type="button" onClick={handleClearAll} className="flex-1 min-h-12 rounded-full text-sm font-semibold text-white bg-rose-500/80">
                Radera allt
              </button>
            </div>
          </div>
        </div>
      )}

      <Link
        to={createPageUrl('Settings')}
        className="inline-flex items-center gap-1 text-[13px] text-white/45 hover:text-white/70 mt-8 no-underline"
      >
        <ChevronLeft size={14} />
        Tillbaka till Inställningar
      </Link>
    </PageShell>
  );
}
