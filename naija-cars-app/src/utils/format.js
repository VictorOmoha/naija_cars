// Shared formatters + financing math for the "Bold Market Energy" redesign.

// Reducing-balance amortization at 15%/yr — matches the design sample:
// ₦412k/mo at 20% down / 48 months on ₦18,500,000.
export const ANNUAL_RATE = 0.15;

export const monthlyPayment = (price, downPct = 20, months = 48, annualRate = ANNUAL_RATE) => {
  const value = parseFloat(price);
  if (!value || value <= 0) return 0;
  const principal = value * (1 - downPct / 100);
  const i = annualRate / 12;
  return (principal * i) / (1 - Math.pow(1 + i, -months));
};

// Compact naira: ₦18.5M · ₦412k · ₦850
export const formatNaira = (amount) => {
  const value = Math.round(parseFloat(amount) || 0);
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `₦${m >= 100 ? Math.round(m) : parseFloat(m.toFixed(1))}M`;
  }
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
  return `₦${value.toLocaleString()}`;
};

export const formatNairaFull = (amount) =>
  `₦${Math.round(parseFloat(amount) || 0).toLocaleString()}`;

export const formatKm = (km) => {
  const value = parseInt(km, 10) || 0;
  return value >= 1_000 ? `${Math.round(value / 1_000)}k km` : `${value.toLocaleString()} km`;
};

// Naija-flavored condition labels used across the redesign
export const conditionLabel = (condition) => ({
  FOREIGN_USED: 'Tokunbo',
  NIGERIAN_USED: 'Naija-used',
  BRAND_NEW: 'Brand new',
  'Foreign Used': 'Tokunbo',
  'Nigerian Used': 'Naija-used',
  'Brand New': 'Brand new',
}[condition] || condition || '');

export const getDialablePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return `234${digits.slice(1)}`;
  return digits;
};

export const waLink = (phone, message) =>
  `https://wa.me/${getDialablePhone(phone)}?text=${encodeURIComponent(message)}`;
