import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto text-slate-300"
      style={{ background: 'linear-gradient(160deg, #07090f 0%, #0d1321 50%, #0b1120 100%)' }}>
      <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 text-sm mb-8 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" /> Tillbaka
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Integritetspolicy</h1>
      </div>

      <p className="text-slate-400 text-sm mb-8">Senast uppdaterad: mars 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold text-base mb-2">1. Insamling av data</h2>
          <p className="text-slate-400">Vi samlar endast in de uppgifter du själv anger — e-postadress, lösenord samt de ekonomiska siffror du matar in — för att appen ska kunna räkna ut din prognos och ge dig personlig ekonomisk överblick.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">2. Syfte</h2>
          <p className="text-slate-400">Uppgifterna används enbart för att tillhandahålla tjänsten Anchor och för att du ska kunna följa din ekonomiska utveckling. Vi använder ingen data för marknadsföring utan ditt uttryckliga samtycke.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">3. Delning av data</h2>
          <p className="text-slate-400">Vi säljer aldrig din data vidare till tredje part. All data lagras säkert och krypterat. Vi delar inte information med externa parter utöver vad som krävs för att driva tjänsten tekniskt.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">4. Dina rättigheter (GDPR)</h2>
          <p className="text-slate-400">Du har när som helst rätt att:</p>
          <ul className="list-disc list-inside text-slate-400 mt-2 space-y-1">
            <li>Begära ett utdrag på all data vi har om dig.</li>
            <li>Få all din information permanent raderad från våra servrar ("rätten att bli glömd").</li>
            <li>Korrigera felaktiga uppgifter.</li>
            <li>Invända mot behandlingen av dina uppgifter.</li>
          </ul>
          <p className="text-slate-400 mt-3">Du kan radera ditt konto och all tillhörande data direkt i appen under Inställningar → "Radera mitt konto".</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">5. Cookies och lokal lagring</h2>
          <p className="text-slate-400">Vi använder lokal lagring (localStorage) enbart för att hålla dig inloggad under en aktiv session. Inga spårningscookies eller reklamcookies används.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">6. Kontakt</h2>
          <p className="text-slate-400">Vid frågor om din data eller för att begära radering, kontakta oss på: <a href="mailto:hello@anchormyfinances.com" className="text-indigo-400 hover:underline">hello@anchormyfinances.com</a></p>
        </section>
      </div>
    </div>
  );
}