import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { getStripe } from '../_shared/stripeConfig.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await base44.entities.FinancialProfile.list('-updated_date', 1);
    const profile = profiles[0];
    const customerId = profile?.stripeCustomerId;

    if (!customerId) {
      return Response.json({ error: 'Ingen aktiv Stripe-kund — välj en plan först' }, { status: 400 });
    }

    const { returnUrl } = await req.json();
    const stripe = getStripe();
    const origin = returnUrl?.split('/Settings')[0] || '';

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${origin}/Settings`,
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('[createPortalSession]', error);
    return Response.json({ error: error.message || 'Kunde inte öppna portal' }, { status: 500 });
  }
});
