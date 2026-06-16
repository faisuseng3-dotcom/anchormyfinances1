import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.7.0';

// ── inlined from _shared/stripeConfig.ts ───────────────────────────────────
type PlanId = 'free' | 'basic' | 'pro' | 'business';
const PLAN_TO_PRICE_ENV: Record<string, string> = { basic: 'STRIPE_PRICE_BASIC', pro: 'STRIPE_PRICE_PRO', business: 'STRIPE_PRICE_BUSINESS' };
function getStripe() { const k = Deno.env.get('STRIPE_SECRET_KEY'); if (!k) throw new Error('STRIPE_SECRET_KEY saknas'); return new Stripe(k, { apiVersion: '2024-11-20.acacia' }); }
function getPriceIdForPlan(plan: PlanId) { if (plan === 'free') throw new Error('Gratisplan har inget pris'); const id = Deno.env.get(PLAN_TO_PRICE_ENV[plan]); if (!id) throw new Error(`${PLAN_TO_PRICE_ENV[plan]} saknas`); return id; }
// ───────────────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Logga in för att uppgradera' }, { status: 401 });

    const { plan, successUrl, cancelUrl } = await req.json();
    const validPlans: PlanId[] = ['basic', 'pro', 'business'];
    if (!validPlans.includes(plan)) {
      return Response.json({ error: 'Ogiltig plan' }, { status: 400 });
    }

    const stripe = getStripe();
    const priceId = getPriceIdForPlan(plan);

    const profiles = await base44.entities.FinancialProfile.list('-updated_date', 1);
    const profile = profiles[0];
    let customerId = profile?.stripeCustomerId as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.full_name || undefined,
        metadata: { base44_user_id: user.id, plan },
      });
      customerId = customer.id;
      if (profile?.id) {
        await base44.entities.FinancialProfile.update(profile.id, { stripeCustomerId: customerId });
      }
    }

    const origin = successUrl?.split('/Pricing')[0] || cancelUrl?.split('/Pricing')[0] || '';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${origin}/Pricing?checkout=success`,
      cancel_url: cancelUrl || `${origin}/Pricing?checkout=canceled`,
      locale: 'sv',
      metadata: {
        plan,
        user_email: user.email,
        user_id: user.id,
      },
      subscription_data: {
        metadata: { plan, user_email: user.email, user_id: user.id },
      },
      allow_promotion_codes: true,
    });

    return Response.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('[createCheckoutSession]', error);
    return Response.json({ error: error.message || 'Kunde inte skapa checkout' }, { status: 500 });
  }
});
