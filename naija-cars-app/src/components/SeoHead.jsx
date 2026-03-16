import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://naijacars.online';
const DEFAULT_IMAGE = `${SITE_URL}/og-default.png`;

/**
 * Drop-in component for setting per-page SEO + Open Graph + Twitter Card meta tags.
 * Wrap in any page to override the defaults in index.html.
 *
 * Usage:
 *   <SeoHead
 *     title="2022 Toyota Camry – ₦18.5M | Naija Cars"
 *     description="Buy this 2022 Toyota Camry in Lagos. Automatic, petrol, foreign used."
 *     image="https://cdn.example.com/car.jpg"
 *     url="/car/abc123"
 *     type="article"
 *   />
 */
export default function SeoHead({
  title,
  description,
  image,
  url,
  type = 'website',
}) {
  const fullTitle = title
    ? `${title} | Naija Cars`
    : "Naija Cars - Nigeria's #1 Automotive Marketplace";

  const metaDescription =
    description ||
    "Buy, sell, or rent verified vehicles across all 36 states. Nigeria's most trusted car marketplace.";

  const metaImage = image || DEFAULT_IMAGE;
  const metaUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Naija Cars" />
      <meta property="og:locale" content="en_NG" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@naijacars" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
    </Helmet>
  );
}
