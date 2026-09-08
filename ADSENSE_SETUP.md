# Homepage AdSense placement

The homepage has one responsive display-ad placement underneath the complete
"Find a car" panel. It stays outside the form and does not appear on other pages
or in the mobile filter dialog. Local development shows a clearly labeled
preview without loading Google scripts. Production renders no ad space until
all three environment variables below are configured.

## Account status checked on 8 September 2026

The signed-in Google account has publisher ID `pub-8524023842400140`:
https://adsense.google.com/adsense/u/0/pub-8524023842400140/home

Google initially reported that the account was deactivated for inactivity.
With the owner's approval, reactivation was started and `naijacars.online` was
added to the account. Google requested ownership verification and site review.
The account-provided verification meta tag and `public/ads.txt` are included.
A responsive Display unit named "NaijaCars — Homepage sidebar" was created with
slot ID `1755987643`. Auto ads is off for NaijaCars.
Payment information and the unrelated existing site were not changed.

Google subsequently verified ownership using the deployed meta tag and accepted
the review request. The site status is **Getting ready** / **Review requested**.
Both the root domain and www serve the correct `ads.txt` as plain text (HTTP 200).
The publisher and slot IDs are saved on the Render frontend, with
`VITE_ADSENSE_ENABLED=false`; serving remains disabled pending site approval.

The Google CMP message **NaijaCars advertising consent** is **Published**, scoped
only to `naijacars.online`, in English. It provides Consent, Do not consent, and
Manage options throughout its supported European regions. Consent-message
optimization is off. It uses NaijaCars green and links to
`https://www.naijacars.online/privacy`. The site's advertising disclosure includes
cookie use, personalization, and preference/revocation guidance. Google's
AdSense tag delivers the CMP message and automatic revocation link once eligible;
this cannot be verified against real serving until site approval and activation.

## Activation

1. Wait for the submitted site review to finish and confirm that NaijaCars is
   approved for serving ads. Ownership verification is already complete.
2. Use the existing responsive **Display ad** unit "NaijaCars — Homepage sidebar".
3. Set these build-time variables on the Render **frontend** static service:

   ```dotenv
   VITE_ADSENSE_ENABLED=true
   VITE_ADSENSE_CLIENT_ID=ca-pub-8524023842400140
   VITE_ADSENSE_HOME_SIDEBAR_SLOT=1755987643
   ```

4. Verify `https://www.naijacars.online/ads.txt` serves the account-provided line
   as plain text. Do not use example publisher IDs.
5. Confirm the published consent message and privacy disclosure still match the
   advertising configuration. The European message is already published.
6. Rebuild and deploy the frontend, then verify the unit without clicking ads.
   Ad serving still depends on Google's approval and available inventory.

Keep Auto ads disabled if only this one placement is wanted. The integration
does not configure Auto ads or any account settings.

The script loads asynchronously near the visible unit, once per document. Each
unit is requested once per mount, including in React Strict Mode; changing search
filters does not refresh it. Hidden mobile units do not request ads. Script
failures remove the placement; unfilled ads remain invisible with reserved space
to avoid shifting the page.

To disable the integration, set `VITE_ADSENSE_ENABLED=false` and redeploy.

References: [responsive ad parameters](https://support.google.com/adsense/answer/9183460),
[responsive ad behavior](https://support.google.com/adsense/answer/9183362),
[advertising disclosure](https://support.google.com/adsense/answer/1348695),
[automatic consent revocation link](https://support.google.com/adsense/answer/10959060).
