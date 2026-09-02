# RecoveryOS

> Find revenue that is slipping away and win it back - safely, visibly, and with evidence.

RecoveryOS is a judge-ready AI Revenue Recovery command center for the Razorpay AI Buildathon. It converts revenue-risk signals into bounded recovery actions across a synthetic 120-case batch, while showing the policy decision, audit trail, and recovered-value attribution for every case.

## Why it stands out

- **Every requested workflow is covered:** payment degradation, checkout abandonment, failed subscriptions, B2B receivables, mandate retries, Hinglish voice recovery, and promise-to-pay tracking.
- **Zero-config judge demo:** the application is immediately usable with deterministic synthetic data and never needs payment, email, voice, or database credentials.
- **Real recovery evidence:** recovered value is counted only after a simulated captured-payment event and is attributed once to a specific recovery case.
- **Bounded agent behavior:** an LLM-shaped recommendation layer proposes the right action, but deterministic policy controls enforce consent, opt-out, contact caps, quiet hours, promise-to-pay, and settlement stop rules.
- **Explainable AI (XAI):** The system reveals its inference reasoning, showing exactly how risk scores, confidence levels, and playbooks resulted in a decision.
- **ROI Analytics:** The dashboard tracks the cost of AI actions vs recovered revenue, proving economic viability.

## Demo flow for judges

1. Open the deployed Vercel URL and select **Launch workspace**.
2. Browse the 120-case recovery batch or filter it by any of the seven playbooks.
3. Select a case to inspect its AI recommendation, XAI reasoning trace, policy decision, communication draft, and audit events.
4. Execute an allowed bounded action to observe a recovered-payment, promise-to-pay, or awaiting-confirmation outcome.
5. Select a protected case to see the contact cap, opt-out, consent, quiet-hours, or promise-to-pay stopping rules block an unsafe action.
6. Use the Hinglish voice scenario to preview the reviewed script in the browser.

## Architecture

```text
Synthetic / Razorpay Test Mode event
              |
              v
      Recovery case + risk score
              |
              v
  AI recommendation (structured, explainable)
              |
              v
Policy gate: consent | caps | quiet hours | settlement | promise
              |
              v
Simulator / Razorpay / Resend adapter
              |
              v
Payment or promise reconciliation -> immutable audit evidence -> batch metrics
```

## Technology

- Next.js App Router (Parallel Routes), React, TypeScript, Tailwind CSS
- PWA manifest for installable app polish
- Recharts for recovery analytics; Lucide for the interface
- Zod-ready adapter boundary and deterministic recovery-policy engine
- Vitest policy tests
- Optional Supabase Postgres audit store and Resend email adapter
- Optional Razorpay Test Mode Payment Links and signature-verified webhooks

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000). The default experience is complete without an `.env.local` file.

### Quality checks

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
```

## Optional integrations

Copy `.env.example` to `.env.local` and add only the providers you want to test.

- **Razorpay Test Mode:** configure `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. The webhook route is `POST /api/webhooks/razorpay`; it verifies HMAC signatures.
- **Supabase:** run `supabase/schema.sql` in the SQL editor, then add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. 
- **Resend:** add `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and importantly `DEMO_EMAIL_RECIPIENT`. To prevent abuse, emails will ONLY be sent to the demo recipient.

## Vercel deployment

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add optional environment variables from `.env.example` only if testing integrations.
4. Deploy. The default demo requires no secrets and can be evaluated immediately.

## Safety boundary & Zero-Cost Promise

RecoveryOS is a buildathon demonstration, not a live collections system. It uses synthetic data and does not initiate real customer communications, mandate debits, or payment collection by default. The agent recommends within structured rules; it never has autonomous authority to move money. Furthermore, it operates purely within free tiers and simulated fallbacks to remain 100% zero-cost.
