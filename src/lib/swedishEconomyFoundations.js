/**
 * Lago Foundations — modul 2: svensk privatekonomi (skolan lär inte ut detta).
 * Statiskt innehåll + quiz — ingen amerikansk “stock market first”-logik.
 */

export const MODULE_SCHOOL_GAP = {
  id: 'school_gap',
  stepLabel: 'Grundkurs',
  title: 'Sverige — så funkar din ekonomi',
  subtitle:
    'Forskning från Lund visar att många unga missar grundfrågor om inflation, ränta och risk — här får du det på svenska, kopplat till vardagen.',
  sourceNote:
    'Bakgrund: studier visar att en minoritet av unga vuxna klarar alla grundfrågor om inflation, ränta och riskspridning — samtidigt ökar skulderna. Det handlar sällan om “lathet”, oftare om att ingen lärt ut det i skolan.',
  readCards: [
    {
      id: 'why_sweden',
      title: 'Varför inte amerikansk ekonomi-tänk?',
      body:
        'I USA pratar många om aktier, kreditscore och 401k först. I Sverige styrs vardagen mer av bolån/Riksbanken, CSN, ISK, pension (tjänstepension/allmän), moms och ett kontantlöst samhälle. Lago utgår från svensk marginal — vad som är kvar efter hyra, lån och fasta utgifter.',
      benefit:
        'Du slipper råd som inte passar din verklighet — appen räknar i kronor efter svenska vanor.',
    },
    {
      id: 'inflation',
      title: 'Inflation — köpkraft, inte bara nyheter',
      body:
        'När priserna stiger (KPI) räcker samma lön till färre varor. Det påverkar mat, hyra och abonnemang. Det är inte “du shoppar fel” — det är att kronan blir mindre värd över tid om inkomsten inte hänger med.',
      benefit:
        'När du förstår inflation planerar du buffert och sparande realistiskt — inte bara “jag ska spendera mindre”.',
    },
    {
      id: 'interest',
      title: 'Ränta — vad det kostar att låna i Sverige',
      body:
        'Riksbankens styrränta påverkar ofta rörliga bolån och vissa privatlån. CSN har egen räntelogik. Högre ränta = dyrare skuld varje månad om du inte amorterar. Sparkonto ger dig ränta åt andra hållet — långsamt men positivt.',
      benefit:
        'Du ser varför skuldminskning och marginal före nya lån ofta slår “hopp på aktier” när räntan är hög.',
    },
    {
      id: 'risk',
      title: 'Risk i Sverige — buffert före börs',
      body:
        'Riskspridning betyder inte “köp 10 aktier direkt”. För de flesta svenskar är första steget buffert på sparkonto, sedan pension/ISK om det passar. En buffert skyddar mot oförutsedda utgifter utan nya SMS-lån.',
      benefit:
        'Lago prioriterar kvar-att-leva-på och buffert — samma logik som svenska rådgivare, inte TikTok-stocktips.',
    },
    {
      id: 'handle',
      title: 'Hur du hanterar — och varför det gynnar dig',
      body:
        'Hantera = veta marginal, se småutgifter i summa, amortera dyr skuld, spara automatiskt. Varför = mindre stress, färre överraskningar, mer valfrihet. Gynnar dig = mer pengar kvar till det du faktiskt vill, inte till ränta och glömda abonnemang.',
      benefit:
        'Pengometern och verktygen i Lago bygger på just detta — inte på skuld eller skam.',
    },
  ],
  quizIntro:
    'Svara på sex korta frågor om svensk vardagsekonomi. Minst fyra rätt för att gå vidare — vid fel visas förklaring direkt.',
  questions: [
    {
      id: 'inflation_kpi',
      prompt: 'Inflation (t.ex. mätt med KPI i Sverige) innebär i praktiken att …',
      options: [
        { id: 'a', text: 'samma pengar köper generellt mindre över tid', correct: true },
        { id: 'b', text: 'staten betalar automatiskt alla dina räkningar' },
        { id: 'c', text: 'det bara påverkar dig som äger aktier i USA' },
      ],
      explanation:
        'Inflation urholkar köpkraft. I Sverige märks det i mat, hyra, el och abonnemang — inte bara “på nyheterna”.',
    },
    {
      id: 'riksbank',
      prompt: 'När Riksbanken höjer styrräntan händer ofta att …',
      options: [
        { id: 'a', text: 'rörliga bolåneräntor kan bli dyrare', correct: true },
        { id: 'b', text: 'alla svenskar får lägre CSN-skuld automatiskt' },
        { id: 'c', text: 'ränta på ränta försvinner i Sverige' },
      ],
      explanation:
        'Styrräntan påverkar kreditmarknaden. Rörliga bolån och vissa lån kan bli dyrare — därför är marginal och skuldkoll viktigt.',
    },
    {
      id: 'buffer_first',
      prompt: 'Varför pratar svenska ekonomer ofta om buffert före aktieinvesteringar?',
      options: [
        { id: 'a', text: 'oförutsedda utgifter och kontantlöst spenderande gör kassa viktig', correct: true },
        { id: 'b', text: 'det är olagligt att äga aktier utan buffert' },
        { id: 'c', text: 'buffert ersätter tjänstepension helt' },
      ],
      explanation:
        'Buffert minskar risken att ta nya dyra lån vid oförutsett. Det är svensk “riskspridning i vardagen”.',
    },
    {
      id: 'pension_vs_sparkonto',
      prompt: 'Tjänstepension/allmän pension jämfört med vanligt sparkonto — vad stämmer bäst?',
      options: [
        { id: 'a', text: 'pension är ofta låst till ålder medan sparkonto är mer tillgängligt', correct: true },
        { id: 'b', text: 'det är exakt samma produkt med samma regler' },
        { id: 'c', text: 'endast amerikaner har pensionssystem' },
      ],
      explanation:
        'I Sverige spar många både till pension och kort sikt. De ska inte bytas ut — de har olika syften.',
    },
    {
      id: 'isk',
      prompt: 'Vad är en vanlig anledning till att svenskar sparar i ISK?',
      options: [
        { id: 'a', text: 'schablonbeskattning i stället för deklarera varje affär', correct: true },
        { id: 'b', text: 'helt skattefritt sparande utan tak' },
        { id: 'c', text: 'endast för företag med momsregistrering' },
      ],
      explanation:
        'ISK förenklar skatten på kapital — det är en svensk struktur, inte “Robinhood-logik”.',
    },
    {
      id: 'csn',
      prompt: 'CSN-lån med ränta — varför spelar ränteläget roll för dig?',
      options: [
        { id: 'a', text: 'högre ränta kan göra skulden dyrare över tid', correct: true },
        { id: 'b', text: 'CSN har aldrig ränta i Sverige' },
        { id: 'c', text: 'ränta påverkar bara hyresgäster i Stockholm' },
      ],
      explanation:
        'Studielån är riktig skuld. Tillsammans med bolån och krediter påverkar räntor din månadsmarginal.',
    },
  ],
  passCount: 4,
};

export function gradeFoundationQuiz(module, answersByQuestionId) {
  const total = module.questions.length;
  let correct = 0;
  const results = module.questions.map((q) => {
    const chosen = answersByQuestionId[q.id];
    const option = q.options.find((o) => o.id === chosen);
    const ok = !!option?.correct;
    if (ok) correct += 1;
    return { questionId: q.id, correct: ok, explanation: q.explanation };
  });
  return {
    correct,
    total,
    passed: correct >= module.passCount,
    results,
  };
}

export const FOUNDATION_MODULES = [MODULE_SCHOOL_GAP];

export function getFoundationModule(id) {
  return FOUNDATION_MODULES.find((m) => m.id === id);
}
