import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenarioType, profile, transaction } = await req.json();

    // Different coaching prompts based on user state
    let prompt = '';

    if (scenarioType === 'expense_registered') {
      const { name, amount, category, remaining, monthlyMargin, totalSpent } = transaction;
      const percentUsed = Math.round((totalSpent / monthlyMargin) * 100);

      if (percentUsed > 80) {
        prompt = `Du är en ekonomicoach med empati och styrka. Användaren registrerade ett köp och är nu på ${percentUsed}% av sin månadsmarginal.
        
INTE varning eller sträng ton. Istället: erkenning, stöd och vägen framåt.

Köp: ${name} (${amount} kr)
Kategori: ${category}
Status: ${percentUsed}% av marginalen använd

Skriv ett kort meddelande (max 2 meningar) på SVENSKA som:
1. Erkänner situationen utan att döma
2. Visar att du är där för att stödja
3. Ger ett konkret nästa steg

Exempel ton: "Tuff vecka ekonomiskt! Det är helt okej - vi tar oss igenom detta tillsammans."`;
      } else if (percentUsed > 50) {
        prompt = `Du är en ekonomicoach. Användaren registrerade ett köp och är nu på ${percentUsed}% av sin månadsmarginal.

Köp: ${name} (${amount} kr)
Kategori: ${category}
Kvar: ${remaining} kr

Skriv ett uppmuntrande meddelande (max 2 meningar) på SVENSKA som både validerar och motiverar.`;
      } else {
        prompt = `Du är en ekonomicoach. Användaren registrerade ett köp.

Köp: ${name} (${amount} kr)
Du har ${remaining} kr kvar att spendera säkert denna månad.

Ge ett kort, uppmuntrande meddelande (max 2 meningar) på SVENSKA. Fokus på: du har kontroll och gör bra val.`;
      }
    } else if (scenarioType === 'low_buffer') {
      const { buffer, income } = profile;
      const months = (buffer / income).toFixed(1);

      prompt = `Du är en empatkonomisk coach. Användarens buffert räcker för ${months} månader av utgifter.

Din roll: INTE att skrämma utan att guida mot bättre dagar.

Skriv ett kort, empatiskt meddelande (max 2 meningar) på SVENSKA som:
1. Erkänner utmaningen
2. Visar vägen framåt utan att döma
3. Motiverar nästa steg`;
    } else if (scenarioType === 'savings_milestone') {
      const { savedAmount, goalAmount, milestone } = transaction;
      const percent = Math.round((savedAmount / goalAmount) * 100);

      prompt = `Du är en ekonomicoach som firar framsteg. Användaren just sparade till milstolpe: ${milestone}% av sitt sparmål (${savedAmount} kr av ${goalAmount} kr).

Skriv ett kort, verkligt glada gratismeddelande (max 2 meningar) på SVENSKA.
Tone: "Boom!", "Yesss!", "Du är awesome!"`;
    } else if (scenarioType === 'streak') {
      const { dayCount } = transaction;

      prompt = `Du är en ekonomicoach som motiverar. Användaren har logga in på ${dayCount} dagar i rad.

Skriv ett kort, energifullt meddelande (max 2 meningar) på SVENSKA som firar detta.
Fokus: konsistens är nyckeln, de ser förändringen redan.`;
    }

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: 'automatic'
    });

    return Response.json({ message: aiResponse });
  } catch (error) {
    console.error('AI Coach error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});