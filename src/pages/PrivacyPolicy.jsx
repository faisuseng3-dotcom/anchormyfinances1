import React from 'react';
import { pageSeoFor } from '@/lib/pageSeo';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
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
        Integritetspolicy
      </h1>
      <p className="text-sm mb-10" style={{ color: 'var(--color-text-muted)' }}>
        Senast uppdaterad: april 2026
      </p>

      <div className="space-y-10 text-sm leading-relaxed">

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            1. Personuppgiftsansvarig
          </h2>
          <p>
            Personuppgiftsansvarig för behandlingen av dina uppgifter i denna tjänst är den fysiska person som registrerat applikationen, nedan kallad tjänsteutgivaren. Kontaktuppgifter anges under avsnitt 7.
          </p>
          <p className="mt-3">
            Tjänsten tillhandahålls under namnet Lago och är ett verktyg för personlig ekonomiplanering. Lago är ett produktnamn, inte en juridisk person.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            2. Vilka uppgifter behandlas
          </h2>
          <p>Följande kategorier av personuppgifter samlas in och behandlas:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>E-postadress, som används för autentisering och kommunikation.</li>
            <li>Finansiell data som du själv anger, såsom inkomst, kostnader, lån och sparmål.</li>
            <li>Transaktionsdata som du registrerar manuellt i tjänsten.</li>
            <li>Tekniska sessionsdata, såsom inloggningstidpunkt, för driftssäkerhet.</li>
          </ul>
          <p className="mt-3">
            Inga bankuppgifter, personnummer eller betalningskortsnummer samlas in.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            3. Ändamål och rättslig grund
          </h2>
          <p>
            Uppgifterna behandlas uteslutande för att tillhandahålla tjänstens funktioner — beräkningar, prognoser och ekonomisk översikt. Den rättsliga grunden är fullgörande av avtal (GDPR art. 6.1 b), det vill säga att leverera den tjänst du registrerat dig för.
          </p>
          <p className="mt-3">
            Uppgifterna används inte för marknadsföring, profilering eller försäljning till tredje part.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            4. Datalagring och säkerhet
          </h2>
          <p>
            All data lagras på servrar inom EU (datacenter i Frankfurt och/eller Stockholm) hos infrastrukturleverantören Base44. Data överförs krypterat via TLS och lagras krypterat i vila.
          </p>
          <p className="mt-3">
            Uppgifter bevaras så länge ditt konto är aktivt. Vid radering av konto raderas all tillhörande data permanent inom 30 dagar.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            5. Dina rättigheter enligt GDPR
          </h2>
          <p>Som registrerad har du rätt att:</p>
          <ul className="mt-3 space-y-2 list-disc list-inside">
            <li>Begära registerutdrag — ett fullständigt utdrag av de uppgifter vi behandlar om dig.</li>
            <li>Begära rättelse av felaktiga eller ofullständiga uppgifter.</li>
            <li>Begära radering ("rätten att bli glömd") — ditt konto och all data tas bort permanent.</li>
            <li>Begära begränsning av behandlingen under pågående granskning.</li>
            <li>Invända mot behandling som baseras på berättigat intresse.</li>
            <li>Dataportabilitet — erhålla dina uppgifter i ett maskinläsbart format.</li>
          </ul>
          <p className="mt-3">
            Radering kan utföras direkt i appen under Inställningar. Övriga rättighetsärenden hanteras via kontaktadressen nedan.
          </p>
          <p className="mt-3">
            Du har rätt att inge klagomål till Integritetsskyddsmyndigheten (IMY) om du anser att behandlingen strider mot GDPR.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            6. Cookies och lokal lagring
          </h2>
          <p>
            Tjänsten använder webbläsarens localStorage enbart för sessionshantering och lokalt sparade inställningar. Inga spårningscookies eller reklamcookies används. Tjänsten använder plattformsleverantörens (Base44) inbyggda anonyma händelseanalys för att förbättra tjänsten — inga personuppgifter delas med tredje part i detta syfte.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-base mb-3" style={{ color: 'var(--color-text-primary)' }}>
            7. Kontakt och dataskyddsärenden
          </h2>
          <p>
            Frågor om integritet, begäran om registerutdrag eller radering riktas till tjänsteutgivaren via:{' '}
            <a
              href="mailto:hello@anchormyfinances.com"
              style={{ color: 'var(--color-accent)' }}
              className="hover:underline"
            >
              hello@anchormyfinances.com
            </a>
          </p>
          <p className="mt-3">
            Svar lämnas inom 30 dagar i enlighet med GDPR art. 12.
          </p>
        </section>

      </div>

      <footer className="mt-16 pt-8 border-t text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
        <Link to="/TermsOfService" className="hover:opacity-80 transition-opacity mr-6" style={{ color: 'var(--color-text-muted)' }}>
          Användarvillkor
        </Link>
        <Link to="/" className="hover:opacity-80 transition-opacity" style={{ color: 'var(--color-text-muted)' }}>
          Tillbaka till tjänsten
        </Link>
      </footer>
    </div>
  );
}

export const pageSeo = pageSeoFor('PrivacyPolicy');
