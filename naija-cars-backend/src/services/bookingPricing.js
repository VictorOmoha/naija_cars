function calculateBookingTotal(listing, { bookingType, rentalDays, addons = {}, promoCode }) {
  const invalid = (message) => Object.assign(new Error(message), { status: 400 });
  if (!['purchase', 'rental'].includes(bookingType)
    || listing.listingType !== (bookingType === 'rental' ? 'RENT' : 'SALE')) {
    throw invalid('Booking type does not match this listing');
  }
  if (!Number.isFinite(listing.price) || listing.price <= 0) {
    throw invalid('This listing has an invalid price');
  }
  if (promoCode) throw invalid('Promotional discounts are not currently available');
  const days = bookingType === 'rental' ? Number(rentalDays) : 1;
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw invalid('Rental duration must be between 1 and 365 days');
  }
  if (bookingType === 'rental' && addons.inspection) {
    throw invalid('Pre-purchase inspection is only available for purchases');
  }
  // RENT listing prices are daily rates. Keep fees consistent with the checkout estimate.
  const basePrice = listing.price * days;
  const insurance = addons.insurance ? (bookingType === 'rental' ? 15000 * days : 500000) : 0;
  const delivery = addons.delivery ? 50000 : 0;
  const inspection = addons.inspection ? 75000 : 0;
  const serviceFee = bookingType === 'rental' ? 5000 : basePrice * 0.01;
  const total = Math.round((basePrice + insurance + delivery + inspection + serviceFee) * 100) / 100;
  if (!Number.isSafeInteger(Math.round(total * 100))) throw invalid('Booking amount is too large');
  return total;
}

module.exports = { calculateBookingTotal };
