# Messaging verification — 8 September 2026

The messaging release fixes conversation navigation, reconnect recovery, earlier history, read receipts, account-scoped caches and recoverable send failures. Existing conversations can continue after a vehicle is sold.

## Automated checks

- Backend: 53 tests passed, including message permissions, private-field filtering, input validation, read-state scoping and sold-listing replies.
- Frontend: 8 tests passed, including socket subscriptions before connection, reconnect room restoration, refreshed authentication, account switching and overlapping history pages.
- Full frontend ESLint and production build passed.
- `node naija-cars-backend/scripts/verify-messaging.cjs` tests real HTTP, Socket.IO and PostgreSQL against the isolated preview on port 5056. It creates temporary accounts and a listing, then removes those fixtures. It verifies first messages, replies, unread counts, read receipts, typing, offline persistence, resumed live delivery, pagination and access controls.

## Browser checks

Using the isolated buyer, seller and admin preview accounts:

- Sent a message through the chat UI; the seller received it live and replied. The reply appeared without refreshing, and the browser sent its read receipt.
- Received a separate conversation with one unread message; opening it cleared the unread state.
- Loaded all 60 history fixtures through “Load earlier messages”.
- Checked mobile chat layout, inbox navigation and switching conversations.
- Temporarily disabled the isolated recipient to force a send failure. The UI displayed the server error and retained the draft. Restoring the recipient and retrying saved exactly one message and cleared the draft.

No production members were contacted or production test accounts created. Production deployment and health checks are reported separately from these isolated functional tests.
