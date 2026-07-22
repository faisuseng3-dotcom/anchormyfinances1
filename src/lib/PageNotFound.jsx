import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { isGuestMode } from '@/components/guestStorage';
import { createPageUrl } from '@/utils';
import { anchorPageClass, anchorPrimaryButtonClass, anchorGhostButtonClass } from '@/lib/anchorTheme';

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1) || 'okänd sida';
  const { isAuthenticated } = useAuth();
  const homeHref =
    isAuthenticated || isGuestMode() ? createPageUrl('Dashboard') : '/';

  return (
    <div className={`${anchorPageClass} flex flex-col items-center justify-center px-6 py-16`}>
      <div className="w-full max-w-md text-center space-y-6">
        <p className="text-[72px] font-light text-white/20 tabular-nums leading-none">404</p>
        <div className="space-y-2">
          <h1 className="text-[24px] font-light tracking-tight text-white">Sidan finns inte</h1>
          <p className="text-[15px] text-white/50 leading-relaxed">
            <span className="text-white/70">{pageName}</span> kunde inte hittas i Lago.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to={homeHref} className={`${anchorPrimaryButtonClass} no-underline`}>
            Till Hem
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className={anchorGhostButtonClass}
          >
            <ArrowLeft className="w-4 h-4" />
            Gå tillbaka
          </button>
        </div>
      </div>
    </div>
  );
}
