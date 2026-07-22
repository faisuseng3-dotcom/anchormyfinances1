**Welcome to your Base44 project** 

**About**

View and Edit  your app on [Base44.com](http://Base44.com) 

This project contains everything you need to run your app locally.

**Edit the code in your local development environment**

Any change pushed to the repo will also be reflected in the Base44 Builder.

**Prerequisites:** 

1. Clone the repository using the project's Git URL 
2. Navigate to the project directory
3. Install dependencies: `npm install`
4. Create an `.env.local` file and set the right environment variables

```
VITE_BASE44_APP_ID=your_app_id
VITE_BASE44_APP_BASE_URL=your_backend_url

e.g.
VITE_BASE44_APP_ID=cbef744a8545c389ef439ea6
VITE_BASE44_APP_BASE_URL=https://my-to-do-list-81bfaad7.base44.app
```

Run the app: `npm run dev`

**Stripe billing (test mode)**

Set these secrets on your Base44 functions (not in the frontend `.env`):

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_BASIC=price_...    # 99 kr/mån SEK
STRIPE_PRICE_PRO=price_...      # 149 kr/mån SEK
STRIPE_PRICE_BUSINESS=price_... # 299 kr/mån SEK
RESEND_API_KEY=re_...           # valfritt — e-post vid misslyckad betalning
BILLING_EMAIL_FROM=Lago <billing@dindomän.se>
```

Webhook endpoint: deploy `stripeWebhook` and register the URL in Stripe Dashboard
(events: `checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`).

**Live mode:** replace `sk_test_` / test price IDs with `sk_live_` and live price IDs in Base44 secrets.

**Publish your changes**

Open [Base44.com](http://Base44.com) and click on Publish.

**Docs & Support**

Documentation: [https://docs.base44.com/Integrations/Using-GitHub](https://docs.base44.com/Integrations/Using-GitHub)

Support: [https://app.base44.com/support](https://app.base44.com/support)
