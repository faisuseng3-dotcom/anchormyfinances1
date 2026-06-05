/**
 * Kompletta meta-titlar och beskrivningar per route — inga trunkerade mallar.
 * Används av PageSeo och kan exporteras per sida för Base44 SEO-scan.
 */

/** Delas av alla sidor — viewport (notch), locale och OG-typ. */
export const GLOBAL_PAGE_META = {
  viewport: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
  language: 'sv',
  ogLocale: 'sv_SE',
  'og:locale': 'sv_SE',
  ogType: 'website',
  'og:type': 'website',
};

const DEFAULT = {
  title: 'Anchor — personlig ekonomi',
  description:
    'Anchor ger dig koll på inkomst, utgifter och vad du har kvar varje månad. Planera, spara och fatta beslut utifrån din egen svenska vardagsekonomi.',
};

/** Komplett pageSeo-export per sida (inkl. global meta för SEO-scan). */
export function pageSeoFor(keyOrEntry) {
  const entry =
    typeof keyOrEntry === 'string' ? PAGE_SEO[keyOrEntry] || DEFAULT : keyOrEntry;
  return {
    ...GLOBAL_PAGE_META,
    ...entry,
    title: sanitizePageTitle(entry.title),
  };
}

export const PAGE_SEO = {
  Landing: {
    title: 'Anchor — kom igång',
    description:
      'Välj privat eller företagsekonomi och logga in säkert. Anchor hjälper dig se marginal, utgifter och sparmål i kronor — anpassat för Sverige.',
  },
  Login: {
    title: 'Logga in — Anchor',
    description:
      'Logga in på ditt Anchor-konto. Befintliga användare når dashboard, budget och sparverktyg direkt efter säker inloggning.',
  },
  SignIn: {
    title: 'Logga in — Anchor',
    description:
      'Logga in på ditt Anchor-konto. Befintliga användare når dashboard, budget och sparverktyg direkt efter säker inloggning.',
  },
  CreateAccount: {
    title: 'Skapa konto — Anchor',
    description:
      'Skapa ett Anchor-konto och spara din ekonomiprofil. Kom igång med budget, sparmål och personliga insikter på några minuter.',
  },
  Onboarding: {
    title: 'Kom igång — Anchor',
    description:
      'Sätt upp din ekonomiprofil: mål, inkomst, fasta kostnader och grundkurs i svensk privatekonomi. Anchor anpassar verktygen efter dig.',
  },
  Dashboard: {
    title: 'Översikt — Anchor',
    description:
      'Din ekonomiska översikt: pengometer, marginal, kommande utgifter och snabbåtgärder. Se vad du har kvar att leva på den här månaden.',
  },
  Expenses: {
    title: 'Utgifter — Anchor',
    description:
      'Följ utgifter per kategori, hitta sparpotential och jämför mot budget. Anchor visar var pengarna tar vägen i svenska kronor.',
  },
  Loans: {
    title: 'Lån & skulder — Anchor',
    description:
      'Överblick över lån, räntor och månadskostnader. Planera amortering och se hur skulder påverkar din marginal.',
  },
  Optimize: {
    title: 'Optimera — Anchor',
    description:
      'Jämför abonnemang och fasta kostnader. Hitta billigare alternativ och se hur mycket du kan spara varje månad.',
  },
  ProTools: {
    title: 'Verktyg — Anchor',
    description:
      'Avancerade verktyg: marginal, framtidsimulator, extra sparande och gemensam planering. För dig som vill gå djupare.',
  },
  PurchaseSimulator: {
    title: 'Köpsimulator — Anchor',
    description:
      'Testa ett köp innan du betalar. Se hur det påverkar budget, buffert och sparmål — i kronor och i tid.',
  },
  Settings: {
    title: 'Inställningar — Anchor',
    description:
      'Hantera profil, inkomst, abonnemang, kommunikationsstil och integritet. Uppdatera det som styr dina ekonomiska beräkningar.',
  },
  TravelPlanner: {
    title: 'Resplanering — Anchor',
    description:
      'Planera resa inom budget. Räkna kostnad per dag, jämför alternativ och få reseinsikter kopplade till din ekonomi.',
  },
  WhatIf: {
    title: 'Planera — Anchor',
    description:
      'Kalender, läget nu och scenarier på en plats. Se vad som väntar och testa t.ex. lägre lön eller pausade utgifter.',
  },
  TransactionHistory: {
    title: 'Historik — Anchor',
    description:
      'Transaktioner, insikter och trender på en plats. Sök, filtrera och följ hur din ekonomi utvecklas över tid.',
  },
  Pricing: {
    title: 'Priser — Anchor',
    description:
      'Anchor Gratis, Plus och Business — tydliga priser i kronor. Börja gratis och uppgradera när du vill.',
  },
  Pulse: {
    title: 'Planera — Anchor',
    description:
      'Kalender, läget nu och scenarier på en plats. Se marginal, kommande risker och vad som händer framåt.',
  },
  FinancialHistory: {
    title: 'Historik — Anchor',
    description:
      'Transaktioner, insikter och trender på en plats. Följ buffert och skuld över senaste halvåret.',
  },
  SecurityInfo: {
    title: 'Säkerhet — Anchor',
    description:
      'Så skyddar Anchor dina uppgifter: GDPR, EU-lagring och tydlig hantering av data. Läs hur vi arbetar med säkerhet.',
  },
  FuturePulse: {
    title: 'Din Framtid — Anchor',
    description:
      'Optimistisk, realistisk eller pessimistisk — justera inkomst och utgifter med sliders och se 60-dagarsprognosen. Dela scenariot med vänner.',
  },
  PrivacyPolicy: {
    title: 'Integritetspolicy — Anchor',
    description:
      'Läs hur Anchor samlar in, lagrar och använder dina uppgifter enligt GDPR. Tydlig information om dina rättigheter.',
  },
  TermsOfService: {
    title: 'Användarvillkor — Anchor',
    description:
      'Villkor för användning av Anchor. Tjänstens omfattning, ansvar och dina rättigheter som användare i Sverige.',
  },
  BusinessDashboard: {
    title: 'Företag — Anchor Business',
    description:
      'Översikt för enskild firma och AB: kassa, moms, kvitton och bokföring. Anchor Business på svenska villkor.',
  },
  BusinessOnboarding: {
    title: 'Företagsstart — Anchor Business',
    description:
      'Kom igång med Anchor Business. Välj bransch, verktyg och få en profil anpassad för svensk småföretagsekonomi.',
  },
  LedgerVault: {
    title: 'Historik — Anchor Business',
    description:
      'Verifikat och transaktioner för företaget — sök, granska och exportera bokföringsunderlag.',
  },
  Import: {
    title: 'Importera — Anchor Business',
    description:
      'Importera banktransaktioner från CSV, PDF eller inklistrad text. Kategorisera och spara i företagets ekonomi.',
  },
  Budget: {
    title: 'Budget — Anchor',
    description:
      'Månadsbudget per kategori med tydlig kvar-att-spendera-på-logik. Följ hur väl du håller planen i kronor.',
  },
  SavingsGoals: {
    title: 'Sparmål — Anchor',
    description:
      'Sätt sparmål, följ progress och få insikter om tempo och kontotyp. Anchor hjälper dig nå målen steg för steg.',
  },
  Social: {
    title: 'Vänner — Anchor',
    description:
      'Profil, vänner och integritet. Hantera @användarnamn och vem som kan se din publicerade ekonomi i Jämför.',
  },
  Galaxy: {
    title: 'Jämför — Anchor',
    description:
      'Jämför anonymt hur du fördelar lönen mot andra i din stad eller ålder. Inspiration utan att visa känsliga detaljer.',
  },
  Squads: {
    title: 'Squads — Anchor',
    description:
      'Spara tillsammans i grupp. Skapa squad, bjud in vänner och följ gemensamma sparmål.',
  },
  YearEndClosing: {
    title: 'Bokslut — Anchor Business',
    description:
      'Årsbokslut och verifikat för svenska företag. Gå igenom underlag och stäng året strukturerat.',
  },
  AnchorAnalysis: {
    title: 'Analys — Anchor',
    description:
      'Djupanalys av din ekonomi: scenarier, prognoser och handlingsbara insikter baserade på din profil.',
  },
  Insights: {
    title: 'Insikter — Anchor',
    description:
      'Personliga insikter om utgifter, marginal och risker. Korta rekommendationer du kan agera på direkt.',
  },
  AnchorAcademy: {
    title: 'Lektioner — Anchor',
    description:
      'Korta lektioner om svensk inflation, ränta, buffert och osynliga utgifter — kopplat till din egen ekonomi.',
  },
};

const PATH_ALIASES = {
  budgetdashboard: 'Budget',
  importpage: 'Import',
  insightspage: 'Insights',
  futurepulsepage: 'FuturePulse',
  pulse: 'FuturePulse',
  whatif: 'FuturePulse',
  jamfor: 'Galaxy',
  compare: 'Galaxy',
  financialhistory: 'TransactionHistory',
  ledgervault: 'TransactionHistory',
};

/** Ta bort tekniska "Page"-suffix från titlar (t.ex. Base44-autoformat). */
export function sanitizePageTitle(title) {
  if (!title) return title;
  return title
    .replace(/\s+Page(\s*[|—–-]\s*)/gi, '$1')
    .replace(/\s+Page$/i, '');
}

function matchPageKey(segment) {
  const lower = segment.toLowerCase();
  if (PATH_ALIASES[lower]) return PATH_ALIASES[lower];
  const keys = Object.keys(PAGE_SEO);
  const direct = keys.find((k) => k.toLowerCase() === lower);
  if (direct) return direct;
  if (lower.endsWith('page')) {
    const stripped = lower.slice(0, -4);
    if (PATH_ALIASES[stripped]) return PATH_ALIASES[stripped];
    return keys.find((k) => k.toLowerCase() === stripped) || null;
  }
  return null;
}

/** Normalisera pathname → PAGE_SEO-nyckel */
export function pathToPageKey(pathname) {
  const segment = (pathname || '/').replace(/^\//, '').split('/')[0];
  if (!segment) return 'Landing';
  return matchPageKey(segment);
}

export function getPageSeo(pathname) {
  const key = pathToPageKey(pathname);
  if (key && PAGE_SEO[key]) {
    return {
      ...PAGE_SEO[key],
      title: sanitizePageTitle(PAGE_SEO[key].title),
    };
  }
  return DEFAULT;
}

export function getPageSeoByKey(pageKey) {
  return PAGE_SEO[pageKey] || DEFAULT;
}

export { DEFAULT as DEFAULT_PAGE_SEO };
