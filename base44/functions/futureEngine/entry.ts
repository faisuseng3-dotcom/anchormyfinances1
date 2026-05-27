import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const SYSTEM_PROMPT = `Persona: Du är "Framtidssjälv" – Anchors prediktiva AI-motor. Du är expert på att läsa ekonomiska trender och förutse finansiella händelser i Sverige 2026.

Uppgift: Analysera användarens historiska transaktioner och profil. En lokal motor har redan beräknat tidslinje och saldon — du ska ENRICHA med lugn coach-ton och konkreta råd.

Ton: Lugn coach, aldrig skuldbeläggande. Svenska.

STRIKT KORT — användaren ska förstå på 3 sekunder:
- coach_meddelande: MAX 90 tecken, EN mening, inga listor.
- händelse: MAX 45 tecken (t.ex. "3 abonnemang samma vecka").
- ai_losning: MAX 50 tecken, börja med verb (t.ex. "Buffra 2 000 kr nu").
- prognos_30_dagar: endast format "X kr om 30 dagar" — ingen förklaring.
- framtids_status: endast "Grönt (Stabil)", "Gult (Varning)" eller "Rött (Kritisk)".
- Max 2 framtida_handelser, inte 3.

Om data saknas: säg vad som behövs — gissa inte siffror som strider mot localBaseline.

Analys-krav:
- Fasta mönster: abonnemang, hyra, lån, inkomstdag
- Rörliga trender: ökade småköp → projicera konsekvens
- Personal: flagga abonnemangsdubletter och tighta perioder

Returnera STRIKT JSON enligt schema.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { profile, transactions, localBaseline, patterns, context = 'PERSONAL' } = await req.json();

    if (!profile) {
      return Response.json({
        coach_meddelande: 'Skapa din profil och ladda upp transaktioner för att se framtiden.',
        framtids_status: 'Grönt (Stabil)',
        prognos_30_dagar: '—',
        framtida_handelser: [],
      });
    }

    const prompt = `${SYSTEM_PROMPT}

Kontext: ${context}
Profil: ${JSON.stringify(profile)}
Mönster: ${JSON.stringify(patterns || {})}
Lokal baseline (matematisk prognos — respektera saldon): ${JSON.stringify({
      framtids_status: localBaseline?.framtids_status,
      prognos_30_dagar: localBaseline?.prognos_30_dagar,
      minBalance: localBaseline?._meta?.minBalance,
      events: localBaseline?.framtida_handelser,
    })}
Senaste transaktioner (urval): ${JSON.stringify((transactions || []).slice(0, 80))}

Skriv coach_meddelande (max 90 tecken), framtids_status, prognos_30_dagar (kort), och max 2 korta framtida_handelser.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_5',
      response_json_schema: {
        type: 'object',
        properties: {
          framtids_status: { type: 'string' },
          prognos_30_dagar: { type: 'string' },
          coach_meddelande: { type: 'string' },
          framtida_handelser: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                tidsfönster: { type: 'string' },
                händelse: { type: 'string' },
                ai_losning: { type: 'string' },
                dag_offset: { type: 'number' },
                typ: { type: 'string' },
              },
              required: ['tidsfönster', 'händelse', 'ai_losning'],
            },
          },
        },
        required: ['framtids_status', 'prognos_30_dagar', 'coach_meddelande', 'framtida_handelser'],
      },
    });

    return Response.json(result);
  } catch (error) {
    console.error('futureEngine error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
