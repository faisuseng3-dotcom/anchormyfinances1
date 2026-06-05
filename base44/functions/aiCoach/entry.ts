import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import { invokeLlmForTask } from '../_shared/aiModelRouter.ts';

const ADVISOR_RULES = `Du är Anchors personliga ekonomicoach. Svara på SVENSKA, kort, varmt och empatiskt.
Referera alltid användarens egna siffror — generiska råd är förbjudna.
ALDRIG ansvarsfriskrivningar. Fira framsteg när det finns.`;

async function invokeAdvisor(base44, prompt) {
  const { result, model } = await invokeLlmForTask(base44, {
    prompt,
    task: 'coaching',
  });
  return { message: result, model };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scenarioType, profile, transaction } = await req.json();

    const profiles = await base44.asServiceRole.entities.FinancialProfile.filter({
      created_by: user.email,
    });
    const fullProfile = profiles[0] || profile;

    let prompt = '';

    if (scenarioType === 'expense_registered') {
      const { name, amount, category, remaining, monthlyMargin, totalSpent } = transaction;
      const percentUsed = monthlyMargin > 0 ? Math.round((totalSpent / monthlyMargin) * 100) : 0;

      prompt = `${ADVISOR_RULES}

Användaren registrerade: ${name} (${amount} kr, ${category}).
Marginal: ${monthlyMargin} kr/mån. Spenderat denna månad: ${totalSpent} kr (${percentUsed}% av marginal).
Kvar: ${remaining} kr.

Skriv max 2 meningar — erkänn, stöd, ett konkret nästa steg med deras siffror.`;
    } else if (scenarioType === 'low_buffer') {
      const { buffer, income } = profile;
      const months = income > 0 ? (buffer / income).toFixed(1) : '?';

      prompt = `${ADVISOR_RULES}

Buffert: ${buffer} kr (ca ${months} månaders inkomst som referens).
Skriv max 2 empatiska meningar med ett konkret steg.`;
    } else if (scenarioType === 'savings_milestone') {
      const { savedAmount, goalAmount, milestone } = transaction;
      prompt = `${ADVISOR_RULES}

Milstolpe: ${milestone}% av sparmål (${savedAmount} kr av ${goalAmount} kr).
Skriv max 2 glada meningar med deras siffror.`;
    } else if (scenarioType === 'streak') {
      const { dayCount } = transaction;
      prompt = `${ADVISOR_RULES}

Inloggningsstreak: ${dayCount} dagar. Max 2 energifyllda meningar.`;
    } else {
      prompt = `${ADVISOR_RULES}\nSkriv ett kort personligt meddelande baserat på: ${JSON.stringify({ scenarioType, transaction })}`;
    }

    if (fullProfile?.income) {
      prompt += `\n\nProfil: inkomst ${fullProfile.income} kr, buffert ${fullProfile.buffer || 0} kr, sparmål ${fullProfile.savingsGoalName || ''} ${fullProfile.savingsGoal || 0} kr.`;
    }

    const { message, model } = await invokeAdvisor(base44, prompt);

    return Response.json({ message, model });
  } catch (error) {
    console.error('AI Coach error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
