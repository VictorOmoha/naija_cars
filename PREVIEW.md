# Local application preview

Open http://127.0.0.1:5173/ on this computer. If it is unavailable, run `./start-preview.ps1` from the project folder in PowerShell. The script starts the database, API and frontend in hidden windows and leaves existing services running.

This preview uses an isolated PostgreSQL database on port 5432 and the real application API on port 5056. It does not load production environment credentials. Public inventory was copied for display; account changes, messages, requests and support enquiries stay in the local database.

| Role | Email | Password |
| --- | --- | --- |
| Buyer | buyer@naijacars.test | PreviewCars2026! |
| Seller | seller@naijacars.test | PreviewCars2026! |
| Administrator | admin@naijacars.test | PreviewCars2026! |

These are local test accounts only. The seller has a test plan for checking listing creation. External email, subscription payments and cloud image storage are intentionally unconfigured locally. No actual vehicle payment is collected by a purchase/rental request. Telephone and WhatsApp links are not part of the automated preview tests.

The portable PostgreSQL runtime, database files and random database password are in the ignored `.preview` directory on this computer. They are not committed. On a fresh computer, provision a separate PostgreSQL database, install dependencies in both app directories, generate the Prisma client and apply `prisma db push`, then run the normal backend and frontend with matching local environment settings. Do not point test scripts at production.

Backend schema additions in this update are `CarListing.features` and `ContactInquiry`. The existing Render pre-deploy `prisma db push` applies them during deployment.

Run `npm run check` from the repository root for lint, automated tests and production build. To exercise the complete isolated API locally, run `node scripts/verify-preview.cjs` from `naija-cars-backend`. This creates test requests/messages/enquiries, verifies permissions and persistence, and removes its temporary listing.

See `design-qa.md` for design coverage, verification and external-service limits. The local preview is separate from the deployed application.

## Password recovery

Select **Sign in → Forgot your password?**, enter the account email, then enter the six-digit recovery code and confirm a new password. Codes expire after 30 minutes and can only be used once. Resending replaces the previous code; the form waits 60 seconds between email requests. The API also rate-limits recovery requests and attempts. After a successful reset, the sign-in form keeps the email and clears the old password.

In the isolated preview, reset emails are captured in `design-qa/preview-api.log`; no email is delivered. Use a temporary local test account when testing password changes. Production requires valid SMTP settings (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, port/security settings) or `SENDGRID_API_KEY`, plus an authorized `FROM_EMAIL` sender. These settings are declared in `render.yaml`; local verification does not prove live inbox delivery.

For the Render free plan in `render.yaml`, configure `SENDGRID_API_KEY` and a verified `FROM_EMAIL`. SendGrid uses its HTTPS Mail Send API and takes priority over SMTP when both are configured. Render free services block SMTP ports 25, 465 and 587 ([Render documentation](https://render.com/docs/free)).

The automated auth and password-reset tests cover request validation, recovery email contents, unknown addresses, expired/used codes, replacement codes, concurrent attempts, password hashing, rate limits, and safe delivery errors. Run them with `npm --prefix naija-cars-backend test`.
