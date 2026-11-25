# Tallio’s kiosk

Run `npm install` and `npm run dev`. Open the local address printed by Vite. Run `npm run build` for a production bundle in `dist`.

## Implementation plan

1. Build the welcome screen and order-type controls using React, Tailwind CSS, shadcn/ui component patterns, and React Icons.
2. Add a category-filtered café menu, item customization, and a side cart. Keep demo prices in integer cents and calculate totals from line quantities.
3. Capture the submitted cart in an itemized demo receipt, then show a pickup estimate and reset for the next customer.
4. Build the production bundle and check the ordering flow at an iPad-sized viewport.

The kiosk uses a sample menu with USD prices. Checkout is local to the browser and simulates an order with a fixed 8–12 minute estimate.

## Stripe test checkout

Rotate any secret key shared in chat. Set the replacement test secret in the ignored local .env file, set VITE_PAYMENT_MODE to stripe, and set STRIPE_RETURN_ORIGIN to the exact kiosk origin. Restart Vite after changing these settings. Hosted Checkout opens via a server-created session URL, so a publishable key is unnecessary for this integration.

The local Vite dev and preview servers include the test API. A static dist deployment only supports demo mode. The Stripe return handler verifies payment and saves the paid order before showing the receipt.

In Stripe mode, Get payment QR opens a scannable Checkout Session link. The kiosk checks Stripe for payment, shows the receipt after confirmation, and expires an open session when the QR is closed. Use a kiosk origin reachable from the phone for the Stripe return page.

## Supabase

Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the ignored .env file and restart Vite. Import the shared client from src/lib/supabase.js. The client is null when either variable is missing. Use a browser-safe anon or publishable key with Row Level Security on any exposed tables. Demo orders stay in the browser. Confirmed Stripe test orders are stored in the server-only kiosk_paid_orders table.

## Saving Stripe test orders

Apply the SQL migration in supabase/migrations to the Supabase project. Set SUPABASE_SERVICE_ROLE_KEY and STRIPE_WEBHOOK_SECRET in the server environment or ignored .env. Keep both out of VITE-prefixed variables. Configure the Stripe test checkout.session.completed event for /api/stripe-webhook, or forward that event with the Stripe CLI for local development.

The webhook and checkout status verification both save through the same endpoint logic. The Stripe session ID is the primary key, so retries preserve one record per paid session. Deploy the server routes to a server-capable host for remote payment and webhook delivery.
