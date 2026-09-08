# Code audit — 8 September 2026

Reviewed the React frontend and Express/Prisma backend, concentrating on account privacy, authentication, messaging, booking correctness, subscription payments, dependencies, and the changed checkout UI. Existing uncommitted redesign work was preserved. Changes are local; nothing was deployed.

## Findings fixed

| Area | Problem | Result |
| --- | --- | --- |
| Account privacy | Message queries returned complete users, including password hashes. Public profile queries included private addresses and verification documents. | Explicit field selections protect message history, conversation summaries, outgoing messages, public profiles, and listing seller responses. Admin listing responses also omit credentials. |
| Messaging | Sellers could not reply with their own listing attached. Malformed typing events could throw an uncaught exception. Suspended users could open sockets with an unexpired token. | Both listing participants may reply; unrelated users are rejected. Socket input is checked and new connections verify active account status. |
| Bookings | The API trusted client totals, accepted fabricated listing snapshots, and did not match booking type to listing type. | Bookings require an active listing and seller, reject self-booking, derive the snapshot and total on the server, and reject stale or altered totals. |
| Checkout | Real rental prices were reduced to 1% of the daily rate. Contact validation never ran. Arbitrary promo codes and an unimplemented weekly discount were advertised. Creating a record appeared to collect payment. | Correct daily pricing, validated contact details, bounded rental duration, and no unvalidated discounts. Confirmation clearly describes a booking request with payment not collected. |
| Subscriptions | The duplicate-reference path could disclose someone else's subscription. Amount and currency were unchecked. Webhook storage failures were acknowledged as successful. | Every return path checks ownership. Activation validates the plan amount and NGN currency. Failed storage returns an error so delivery can retry; completed duplicate events remain idempotent. Signature checking fails closed. |
| Password recovery | Reset endpoints lacked dedicated rate limits. Codes used Math.random and could be consumed concurrently. Account verification could match password-reset records. | Rate limits, cryptographic code generation, typed verification records, and transactional one-time reset consumption. |
| Client sessions | Queued requests could refresh repeatedly; refreshed tokens did not update the auth store; refresh lost the socket token; private query data survived account changes. | Bounded retries, token synchronization and restoration, socket reuse, and query-cache clearing on logout/account switch. Wrong-current-password responses retain their original error. |
| Listing allowances | Deleting an old listing could reduce the new subscription period's usage; concurrent decrements could fall below zero. | Slot returns are limited to the applicable period and guarded by a positive usage count. Listing creation also rejects nonpositive prices and negative mileage. |
| Error handling | Production 500 responses exposed internal error messages. | Generic production server errors; detailed diagnostics remain in server logs. |
| Mobile checkout | Fixed-width progress connectors clipped the fourth step at 375px. | Flexible progress connectors and readable wrapping for the booking reference. |
| Dependencies | npm reported 24 frontend and 27 backend vulnerabilities. | Both dependency trees report zero vulnerabilities after compatible fixes, Sharp 0.35.4, Nodemailer 9.1.1, and a scoped deepmerge-ts 8 override for Prisma configuration loading. |

## Verification

- **40 automated tests passed:** 37 backend and 3 frontend, including existing tests and regression coverage added during the audit.
- **Frontend lint and production build passed.** All backend source files passed syntax checks; `git diff --check` passed.
- **Prisma schema validation and client generation passed** with Prisma 6.19.3. No schema migration or database writes were performed.
- **Image and email compatibility tests passed:** real JPEG/thumbnail conversion and email rendering, without cloud uploads or outgoing email.
- **Browser flow passed against the isolated fixture:** sign-in, reload into protected checkout, invalid-contact rejection, seven-day rental with insurance and delivery, server-backed confirmation, mobile menu, and sign-out.
- Browser confirmation showed **₦860,000** and **Payment Status: Not Collected**. No browser warning/error logs were observed during that flow. At a 375px viewport, measured document width was 363px, with no horizontal overflow.

The webhook behavior follows Paystack's [event acknowledgement and retry documentation](https://paystack.com/docs/payments/webhooks/). Dependency compatibility was reviewed against the [Sharp 0.35 changelog](https://sharp.pixelplumbing.com/changelog/v0.35.0/), [Nodemailer release notes](https://github.com/nodemailer/nodemailer/releases/tag/v9.1.1), and [deepmerge-ts 8 release notes](https://github.com/RebeccaStevens/deepmerge-ts/releases/tag/v8.0.0). The Prisma override should be revisited when Prisma ships a compatible dependency update.

## Reproduce

From the repository root:

```powershell
npm run check
```

This runs frontend lint, both test suites, and the production frontend build. Dependency audits can be run separately in each application directory with `npm audit`.

For the same isolated browser fixture, in separate terminals:

```powershell
cd naija-cars-backend
node scripts/audit-preview.cjs
```

```powershell
cd naija-cars-app
$env:VITE_API_URL='http://127.0.0.1:5055/api'
npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open `http://127.0.0.1:5173`, sign in with synthetic test values, then open `/booking/audit-rental?type=rental`. The fixture accepts test credentials, uses in-memory records, and never loads `.env`. It is a test utility, not a production backend.

## Limits and remaining work

- The configured local PostgreSQL service at localhost:5432 was unavailable. Database constraints, migrations, and real concurrent transactions still require integration testing against a disposable database. Automated route tests use mocked Prisma operations.
- Live Paystack payments/webhooks, SMTP delivery, and Cloudinary uploads were not exercised. Vehicle checkout creates booking requests; it does not collect payment or implement escrow. Homepage promises about inspection, escrow, and payout timing require separate operational/product validation.
- The production build retains a nonblocking warning for its approximately 685 kB main JavaScript chunk. Prisma also warns that the package.json seed configuration will be deprecated in Prisma 7.
- This was a focused code and dependency audit, not a complete penetration test or a guarantee that all defects have been found.
