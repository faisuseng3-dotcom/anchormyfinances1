import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div
      className="h-full anchor-scroll-panel px-6 py-10 max-w-2xl mx-auto"
      style={{ background: 'var(--color-background-primary)', color: 'var(--color-text-secondary)' }}
    >
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm mb-10 hover:opacity-80 transition-opacity"
        style={{ color: 'var(--color-accent)' }}
      >
        <ArrowLeft className="w-4 h-4" /> Tillbaka
      </Link>

      <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text-primary)' }}>
        Användarvillkor
      </h1>
      <p className="text-sm mb-10" style={{ color: 'var(--color-text-muted)' }}>
        Senast uppdaterad: april 2026
      </p>

      <div className="space-y-10 text-sm leading-relaxed">

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            1. Tjänstens karaktär
          </h2>
          <p>
            Anchor är ett verktyg för personlig ekonomiplanering och budgetsimulering. Tjänsten beräknar prognoser och sammanställer ekonomisk data uteslutande baserat på de uppgifter du själv anger.
          </p>
          <p className="mt-3">
            Anchor är ett produktnamn och utgör inte en juridisk person. Tjänsten tillhandahålls av den fysiska person som registrerat applikationen hos tjänsteleverantören Base44.
          </p>
          <p className="mt-3">
            Genom att registrera ett konto och använda tjänsten godkänner du dessa villkor i sin helhet.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            2. Inte finansiell rådgivning
          </h2>
          <p>
            Anchor tillhandahåller inte licensierad finansiell rådgivning. Alla beräkningar, prognoser och sammanfattningar i tjänsten är simuleringar baserade på de siffror du anger och ska inte betraktas som rekommendationer att köpa, sälja eller omstrukturera tillgångar eller skulder.
          </p>
          <p className="mt-3">
            Vid ekonomiska beslut av väsentlig karaktär rekommenderas kontakt med en certifierad finansiell rådgivare eller auktoriserad revisor.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            3. Användarens ansvar
          </h2>
          <p>Du ansvarar för att:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>De uppgifter du anger i tjänsten är korrekta och aktuella.</li>
            <li>Inloggningsuppgifter förvaras konfidentiellt och inte delas med tredje part.</li>
            <li>Kontot används för personligt bruk och inte för obehörig åtkomst eller missbruk av systemet.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            4. Ändringar i tjänsten
          </h2>
          <p>
            Tjänsteutgivaren förbehåller sig rätten att uppdatera, förändra eller utöka tjänstens funktioner. Vid väsentliga ändringar av dessa villkor aviseras berörda användare via e-post till den adress som är registrerad på kontot, med minst 14 dagars varsel.
          </p>
          <p className="mt-3">
            Fortsatt användning av tjänsten efter att ny villkorsversion trätt i kraft innebär att du godkänner de uppdaterade villkoren.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            5. Avslutande av konto och dataradering
          </h2>
          <p>
            Du kan när som helst avsluta ditt konto via Inställningar i appen. Samtliga personuppgifter och din ekonomiska data raderas permanent inom 30 dagar från begäran.
          </p>
          <p className="mt-3">
            Tjänsteutgivaren kan stänga av konton som bedöms missbruka tjänsten, försöka bereda sig obehörig åtkomst eller på annat sätt bryta mot dessa villkor.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            6. Ansvarsbegränsning
          </h2>
          <p>
            Tjänsteutgivaren ansvarar inte för ekonomiska beslut fattade med stöd av tjänstens beräkningar, för driftsavbrott utanför tjänsteutgivarens kontroll, eller för dataintrång som beror på felaktig hantering av inloggningsuppgifter från användarens sida.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            7. Tillämplig lag och tvistlösning
          </h2>
          <p>
            Dessa villkor regleras av svensk lag. Tvister som inte kan lösas i samförstånd hänskjuts till allmän domstol med Stockholms tingsrätt som första instans, om inte parterna skriftligen överenskommit om annan tvistlösningsmekanism.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            8. Kontakt
          </h2>
          <p>
            Frågor om dessa villkor riktas till:{' '}
            <a
              href="mailto:hello@anchormyfinances.com"
              style={{ color: 'var(--color-accent)' }}
              className="hover:underline"
            >
              hello@anchormyfinances.com
            </a>
          </p>
        </section>

      </div>

      <footer className="mt-16 pt-8 border-t text-xs" style={{ borderColor: 'rgba(255,255,255,0.07)', color: 'var(--color-text-muted)' }}>
        <Link to="/PrivacyPolicy" className="hover:opacity-80 transition-opacity mr-6" style={{ color: 'var(--color-text-muted)' }}>
          Integritetspolicy
        </Link>
        <Link to="/" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>
          Tillbaka till tjänsten
        </Link>
      </footer>
    </div>
  );
}

export const pageSeo = pageSeoFor('TermsOfService');
