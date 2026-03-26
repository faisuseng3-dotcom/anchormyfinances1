import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen px-6 py-10 max-w-2xl mx-auto text-slate-300"
      style={{ background: 'linear-gradient(160deg, #07090f 0%, #0d1321 50%, #0b1120 100%)' }}>
      <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 text-sm mb-8 hover:text-indigo-300">
        <ArrowLeft className="w-4 h-4" /> Tillbaka
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Användarvillkor</h1>
      </div>

      <p className="text-slate-400 text-sm mb-8">Senast uppdaterad: mars 2026</p>

      <div className="space-y-8 text-sm leading-relaxed">
        <section>
          <h2 className="text-white font-semibold text-base mb-2">1. Om tjänsten</h2>
          <p className="text-slate-400">Anchor är ett verktyg för ekonomisk simulering och personlig budgetplanering. Genom att skapa ett konto och använda Anchor godkänner du dessa villkor.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">2. Ej finansiell rådgivning</h2>
          <p className="text-slate-400">Anchor tillhandahåller <strong className="text-white">inga officiella finansiella råd</strong>. All information och alla prognoser i appen är simuleringar baserade på de uppgifter du själv anger. Alla ekonomiska beslut du fattar baserat på appens innehåll är ditt eget ansvar. Rådgör alltid med en certifierad finansiell rådgivare vid viktiga ekonomiska beslut.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">3. Ditt ansvar</h2>
          <p className="text-slate-400">Du ansvarar själv för att:</p>
          <ul className="list-disc list-inside text-slate-400 mt-2 space-y-1">
            <li>Hålla dina inloggningsuppgifter hemliga och säkra.</li>
            <li>De uppgifter du anger i appen är korrekta.</li>
            <li>Inte dela ditt konto med andra.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">4. Ändringar i tjänsten</h2>
          <p className="text-slate-400">Vi förbehåller oss rätten att uppdatera, ändra eller lägga till funktioner i appen. Vi meddelar om väsentliga förändringar via e-post eller direkt i appen.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">5. Avslutande av konto</h2>
          <p className="text-slate-400">Du kan när som helst radera ditt konto och all tillhörande data via Inställningar i appen. Vi kan stänga av konton som missbrukar tjänsten.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">6. Tillämplig lag</h2>
          <p className="text-slate-400">Dessa villkor styrs av svensk lag. Eventuella tvister ska lösas i svensk domstol.</p>
        </section>

        <section>
          <h2 className="text-white font-semibold text-base mb-2">7. Kontakt</h2>
          <p className="text-slate-400">Frågor om användarvillkoren skickas till: <a href="mailto:hello@anchormyfinances.com" className="text-indigo-400 hover:underline">hello@anchormyfinances.com</a></p>
        </section>
      </div>
    </div>
  );
}