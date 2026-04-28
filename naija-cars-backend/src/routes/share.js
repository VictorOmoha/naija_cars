/**
 * Social share / Open Graph proxy route
 *
 * GET /share/car/:id
 *
 * Social media crawlers (WhatsApp, Facebook, Twitter, Telegram, etc.) scrape
 * this URL to generate link previews. They don't execute JavaScript, so a
 * normal React SPA would show empty OG tags. This route detects bots by
 * User-Agent, fetches the listing from the DB, and returns a minimal HTML
 * page that contains proper og:* and twitter:* meta tags.
 *
 * Regular browsers are redirected immediately to the SPA frontend page.
 */

const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

const SPA_URL = process.env.CLIENT_URL || 'https://naijacars.online';

// Known social-media / link-preview bot User-Agent substrings
const BOT_UA_PATTERNS = [
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'whatsapp',
  'telegrambot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'googlebot',
  'bingbot',
  'applebot',
  'rogerbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'vkshare',
  'w3c_validator',
  'ia_archiver',
  'prerender',
];

function isBot(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return BOT_UA_PATTERNS.some(pattern => ua.includes(pattern));
}

function formatPrice(price) {
  const num = parseFloat(price);
  if (num >= 1_000_000) return `₦${(num / 1_000_000).toFixed(1)}M`;
  return `₦${num.toLocaleString()}`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildOgHtml({ title, description, image, url, price, condition, location }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} | Naija Cars</title>
  <meta name="description" content="${escapeHtml(description)}" />

  <!-- Open Graph -->
  <meta property="og:site_name" content="Naija Cars" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:locale" content="en_NG" />
  ${price ? `<meta property="product:price:amount" content="${escapeHtml(price)}" />
  <meta property="product:price:currency" content="NGN" />` : ''}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@naijacars" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <meta name="twitter:label1" content="Price" />
  <meta name="twitter:data1" content="${escapeHtml(price || '')}" />
  ${condition ? `<meta name="twitter:label2" content="Condition" />
  <meta name="twitter:data2" content="${escapeHtml(condition)}" />` : ''}

  <!-- Redirect browsers to the SPA immediately -->
  <meta http-equiv="refresh" content="0; url=${escapeHtml(url)}" />
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(url)}">Naija Cars</a>…</p>
  <script>window.location.replace("${escapeHtml(url)}");</script>
</body>
</html>`;
}

// GET /share/car/:id
router.get('/car/:id', async (req, res) => {
  const { id } = req.params;
  const userAgent = req.headers['user-agent'] || '';
  const spaUrl = `${SPA_URL}/car/${id}`;

  // Regular browsers: redirect immediately to the SPA
  if (!isBot(userAgent)) {
    return res.redirect(302, spaUrl);
  }

  // Social bot: fetch listing data and serve OG HTML
  try {
    const listing = await prisma.carListing.findFirst({
      where: {
        id,
        status: 'ACTIVE'
      },
      include: {
        media: { orderBy: { displayOrder: 'asc' }, take: 1 },
        seller: { include: { profile: true } },
      },
    });

    if (!listing) {
      // Fallback OG for missing listings
      return res.send(buildOgHtml({
        title: 'Car Listing | Naija Cars',
        description: "Nigeria's most trusted automotive marketplace.",
        image: `${SPA_URL}/og-default.png`,
        url: spaUrl,
      }));
    }

    const carTitle = [listing.year, listing.make, listing.model, listing.trim]
      .filter(Boolean).join(' ');

    const conditionLabel = {
      FOREIGN_USED: 'Foreign Used (Tokunbo)',
      NIGERIAN_USED: 'Nigerian Used',
      BRAND_NEW: 'Brand New',
    }[listing.condition] || listing.condition?.replace(/_/g, ' ');

    const price = formatPrice(listing.price);
    const locationStr = [listing.locationCity, listing.locationState]
      .filter(Boolean).join(', ') || 'Nigeria';

    const description = [
      `${conditionLabel} ${carTitle}`,
      `for ${price}`,
      locationStr !== 'Nigeria' ? `in ${locationStr}` : 'in Nigeria',
      listing.mileage ? `• ${listing.mileage.toLocaleString()} km` : '',
      listing.transmission ? `• ${listing.transmission}` : '',
      '— Listed on Naija Cars.',
    ].filter(Boolean).join(' ');

    const image = listing.media?.[0]?.url || `${SPA_URL}/og-default.png`;

    const html = buildOgHtml({
      title: `${carTitle} – ${price}`,
      description,
      image,
      url: spaUrl,
      price,
      condition: conditionLabel,
      location: locationStr,
    });

    // Cache for 5 minutes so repeated bot scrapes are fast
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);

  } catch (error) {
    console.error('Share route error:', error);
    return res.redirect(302, spaUrl);
  }
});

module.exports = router;
