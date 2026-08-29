# RecoveryOS

> Find revenue that is slipping away and win it back - safely, visibly, and with evidence.

RecoveryOS is a judge-ready AI Revenue Recovery command center for the Razorpay AI Buildathon. It converts revenue-risk signals into bounded recovery actions across a synthetic 120-case batch, while showing the policy decision, audit trail, and recovered-value attribution for every case.

## Why it stands out

- **Every requested workflow is covered:** payment degradation, checkout abandonment, failed subscriptions, B2B receivables, mandate retries, Hinglish voice recovery, and promise-to-pay tracking.
- **Zero-config judge demo:** the application is immediately usable with deterministic synthetic data and never needs payment, email, voice, or database credentials.
- **Real recovery evidence:** recovered value is counted only after a simulated captured-payment event and is attributed once to a specific recovery case.
- **Bounded agent behavior:** an LLM-shaped recommendation layer proposes the right action, but deterministic policy controls enforce consent, opt-out, contact caps, quiet hours, promise-to-pay, and settlement stop rules.
- **Optional real adapters:** Razorpay Test Mode, Resend, and Supabase activate only when their environment variables are configured.

## Demo flow for judges

1. Open the deployed Vercel URL and select **Start demo**.
2. Browse the 120-case recovery batch or filter it by any of the seven playbooks.
3. Select a case to inspect its AI recommendation, policy decision, communication draft, and audit events.
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

- Next.js App Router, React, TypeScript, Tailwind CSS
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
npm test
npx tsc --noEmit
npm run build
```

## Optional integrations

Copy `.env.example` to `.env.local` and add only the providers you want to test.

- **Razorpay Test Mode:** configure webhook secret plus test keys. The webhook route is `POST /api/webhooks/razorpay`; it verifies HMAC signatures and returns quickly. Live calls remain disabled unless `ENABLE_LIVE_OUTREACH=true`.
- **Supabase:** run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor, then add the project URL and service-role key. The demo does not expose service-role credentials to the browser.
- **Resend:** add an API key and verified `RESEND_FROM_EMAIL`; outbound mail remains simulated unless explicitly enabled.

> Do not enable live outreach for the buildathon demo. Use test credentials and synthetic identities only.

## Vercel deployment

1. Push this repository to GitHub.
2. Import the repository into Vercel.
3. Add optional environment variables from `.env.example` only if testing integrations.
4. Deploy. The default demo requires no secrets and can be evaluated immediately.

## Five-minute pitch outline

| Time | Story beat |
| --- | --- |
| 0:00-0:35 | Revenue does not disappear in one clean step; show the problem and RecoveryOS promise. |
| 0:35-1:10 | Explain event → diagnosis → policy → action → recovery attribution. |
| 1:10-2:10 | Run payment degradation and checkout drop-off recovery. |
| 2:10-3:10 | Show failed subscription, B2B receivables, and mandate retry safety. |
| 3:10-4:00 | Demonstrate Hinglish voice and promise-to-pay pause behavior. |
| 4:00-4:40 | Show a policy-blocked case, audit evidence, and batch recovery metrics. |
| 4:40-5:00 | Show the public repository, architecture, tests, and Vercel URL. |

## Safety boundary

RecoveryOS is a buildathon demonstration, not a live collections system. It uses synthetic data and does not initiate real customer communications, mandate debits, or payment collection by default. The agent recommends within structured rules; it never has autonomous authority to move money.
