import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { createPageUrl } from '@/utils';
import PageShell from '@/components/layout/PageShell';
import ScanOverlay from '@/components/resell/ScanOverlay';
import PriceTag from '@/components/resell/PriceTag';
import PlatformPriceTable from '@/components/resell/PlatformPriceTable';
import FutureImpactModal from '@/components/resell/FutureImpactModal';
import { DashboardDivider, DashboardListRow, DashboardStatStrip } from '@/components/dashboard/DashboardChrome';
import {
  anchorGhostButtonClass,
  anchorInputClass,
  anchorPrimaryButtonClass,
  anchorSecondaryButtonClass,
  anchorIconButtonClass,
  sectionMetaClass,
  sectionSubtitleClass,
} from '@/lib/anchorTheme';

const PLATFORMS = ['Tradera', 'Blocket', 'Vinted', 'Sellpy', 'Plick'];
const SEARCH_HINTS = ['PS5-kontroll', 'iPhone 14', 'Nike skor', 'Vinterjacka'];

export default function ResellScanner() {
  const fileRef = useRef(null);
  const [phase, setPhase] = useState('idle');
  const [capturedImage, setCapturedImage] = useState(null);
  const [result, setResult] = useState(null);
  const [showFutureModal, setShowFutureModal] = useState(false);
  const [futureAdded, setFutureAdded] = useState(false);
  const [guesses, setGuesses] = useState([]);
  const [manualQuery, setManualQuery] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [scanError, setScanError] = useState(null);

  const compressImage = (file) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 1024;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas compression failed'));
              return;
            }
            resolve(new File([blob], 'scan.jpg', { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.82,
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Image load failed'));
      };
      img.src = url;
    });

  const awardPoints = () => {
    base44.functions
      .invoke('awardPoints', { event_type: 'resell_scanner' })
      .then((r) => {
        if (r?.data?.points > 0) {
          import('sonner').then(({ toast }) => {
            toast.success(`+${r.data.points} poäng`);
          });
        }
      })
      .catch(() => {});
  };

  const applyResult = (data) => {
    setResult(data);
    setPhase('result');
    awardPoints();
  };

  const runScan = async (file) => {
    const uploadResult = await base44.integrations.Core.UploadFile({ file });
    if (!uploadResult?.file_url) throw new Error('Uppladdning misslyckades');
    const res = await base44.functions.invoke('resellScanner', { imageUrl: uploadResult.file_url });
    const data = res?.data;
    if (!data) throw new Error('Tomt svar från servern');

    if (data.identified) {
      if ((data.confidence === 'låg' || data.confidence === 'medel') && data.guesses?.length > 0) {
        setGuesses(data.guesses);
        setResult(data);
        setPhase('guess');
      } else {
        applyResult(data);
      }
    } else {
      setPhase('error');
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setCapturedImage(previewUrl);
    setPhase('scanning');
    try {
      const compressed = await compressImage(file);
      await runScan(compressed);
    } catch (err) {
      console.error('ResellScanner handleFile error:', err);
      setScanError(err?.message || 'Okänt fel');
      setPhase('error');
    }
  };

  const handleManualSearch = async () => {
    if (!manualQuery.trim()) return;
    setManualLoading(true);
    const res = await base44.functions.invoke('resellScanner', { manualQuery: manualQuery.trim() });
    setManualLoading(false);
    if (res.data?.identified) {
      applyResult(res.data);
    } else {
      setPhase('error');
    }
  };

  const confirmGuess = (guess) => {
    const confirmed = {
      ...result,
      model: guess.label,
      category: guess.category || result.category,
      confidence: 'hög',
      guesses: [],
    };
    applyResult(confirmed);
  };

  const reset = () => {
    setPhase('idle');
    setCapturedImage(null);
    setResult(null);
    setShowFutureModal(false);
    setFutureAdded(false);
    setGuesses([]);
    setManualQuery('');
    setManualLoading(false);
    setScanError(null);
  };

  const openFile = (capture) => {
    if (!fileRef.current) return;
    fileRef.current.accept = capture ? 'image/*;capture=camera' : 'image/*';
    fileRef.current.click();
  };

  return (
    <PageShell
      title="Sälj något du inte använder"
      subtitle="Fota varan — vi föreslår pris och plattform"
      backHref={createPageUrl('Dashboard')}
    >
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 max-w-md mx-auto"
          >
            <div className="aspect-square rounded-xl bg-white/[0.04] flex flex-col items-center justify-center px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center mb-4">
                <Camera className="w-8 h-8 text-white/70" />
              </div>
              <p className="text-[17px] font-semibold text-white">Ta en bild av varan</p>
              <p className={`${sectionSubtitleClass} mt-2`}>
                Vi jämför med Tradera, Blocket, Vinted och fler
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => openFile(true)}
                className={`${anchorPrimaryButtonClass} flex-1`}
              >
                <Camera className="w-4 h-4" />
                Kamera
              </button>
              <button
                type="button"
                onClick={() => openFile(false)}
                className={`${anchorSecondaryButtonClass} flex-1`}
              >
                <Upload className="w-4 h-4" />
                Galleri
              </button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />

            <p className={`${sectionMetaClass} text-center`}>{PLATFORMS.join(' · ')}</p>
          </motion.div>
        )}

        {phase === 'scanning' && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-md mx-auto">
            <ScanOverlay imageData={capturedImage} />
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6 max-w-md mx-auto"
          >
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <img src={capturedImage} alt="Vara" className="w-full h-full object-cover" />
              <PriceTag result={result} />
            </div>

            <div>
              <p className="text-[17px] font-semibold text-white">
                {result.brand} {result.model}
              </p>
              <p className={sectionMetaClass}>
                {result.category} · {result.condition}
              </p>
              {result.conditionNote && (
                <p className={`${sectionSubtitleClass} mt-1`}>{result.conditionNote}</p>
              )}
              {result.uncertainAboutModel && (
                <p className={`${sectionSubtitleClass} mt-2`}>
                  Priserna är ungefärliga — välj rätt modell om du kan.
                </p>
              )}
            </div>

            <DashboardStatStrip
              items={[
                { label: 'Snabb', value: `${result.quickSalePrice} kr` },
                { label: 'Snitt', value: `${result.avgPrice} kr` },
                { label: 'Max', value: `${result.maxPrice} kr` },
              ]}
            />

            <PlatformPriceTable
              platformPrices={result.platformPrices}
              recommendedPlatform={result.recommendedPlatform}
              result={result}
            />

            {result.sellingTips && (
              <>
                <DashboardDivider />
                <p className="text-[14px] text-white/70 leading-relaxed">{result.sellingTips}</p>
              </>
            )}

            <div className="flex gap-3 pt-2">
              {futureAdded ? (
                <p className="flex-1 text-center text-[15px] font-medium text-emerald-300/90 py-3">
                  Tillagd i din ekonomi
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowFutureModal(true)}
                  className={`${anchorPrimaryButtonClass} flex-1`}
                >
                  Lägg till försäljning
                </button>
              )}
              <button type="button" onClick={reset} className={anchorIconButtonClass} aria-label="Ny bild">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {phase === 'guess' && (
          <motion.div
            key="guess"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-5 max-w-md mx-auto"
          >
            {capturedImage && (
              <div className="aspect-square rounded-xl overflow-hidden opacity-80">
                <img src={capturedImage} alt="Vara" className="w-full h-full object-cover" />
              </div>
            )}
            <div>
              <p className="text-[17px] font-semibold text-white">Vilken vara är det?</p>
              <p className={sectionSubtitleClass}>Välj det som stämmer bäst</p>
            </div>

            {guesses.map((guess, i) => (
              <React.Fragment key={guess.label}>
                {i > 0 && <DashboardDivider />}
                <DashboardListRow
                  onClick={() => confirmGuess(guess)}
                  title={guess.label}
                  subtitle={guess.category}
                />
              </React.Fragment>
            ))}

            <button type="button" onClick={() => setPhase('error')} className={`${anchorGhostButtonClass} w-full`}>
              Inget av dessa
            </button>
          </motion.div>
        )}

        {phase === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-5 max-w-md mx-auto"
          >
            <div className="text-center py-4">
              <p className="text-[17px] font-semibold text-white">Kunde inte läsa bilden</p>
              <p className={`${sectionSubtitleClass} mt-1`}>
                Skriv vad du säljer så söker vi pris ändå
              </p>
              {scanError && <p className="text-[13px] text-rose-300/80 mt-2">{scanError}</p>}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
                placeholder="t.ex. PS5 DualSense"
                className={`${anchorInputClass} flex-1`}
                autoFocus
              />
              <button
                type="button"
                onClick={handleManualSearch}
                disabled={!manualQuery.trim() || manualLoading}
                className={`${anchorPrimaryButtonClass} shrink-0 px-5 disabled:opacity-50`}
              >
                {manualLoading ? (
                  <span className="w-4 h-4 border-2 border-[#0a1628]/30 border-t-[#0a1628] rounded-full animate-spin" />
                ) : (
                  'Sök'
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {SEARCH_HINTS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setManualQuery(s)}
                  className="px-3 py-1.5 rounded-lg text-[13px] text-white/50 bg-white/[0.05] hover:text-white/75"
                >
                  {s}
                </button>
              ))}
            </div>

            <button type="button" onClick={reset} className={`${anchorGhostButtonClass} w-full`}>
              Ta en ny bild
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showFutureModal && result && (
          <FutureImpactModal
            result={result}
            onClose={() => setShowFutureModal(false)}
            onAdded={() => {
              setFutureAdded(true);
              setShowFutureModal(false);
            }}
          />
        )}
      </AnimatePresence>
    </PageShell>
  );
}
