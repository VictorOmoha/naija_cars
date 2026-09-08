const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../src/lib/prisma');
const { calculateBookingTotal } = require('../src/services/bookingPricing');

process.env.JWT_SECRET = 'booking-test-secret';
const buyerId = 'buyer-1';
let listing;
let savedBooking;
let baseUrl;
let server;
prisma.user.findUnique = async () => ({ id: buyerId, isActive: true });
prisma.carListing.findFirst = async ({ where }) => {
  assert.equal(where.status, 'ACTIVE');
  return listing;
};
prisma.booking.create = async ({ data }) => {
  savedBooking = data;
  return data;
};

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/bookings', require('../src/routes/bookings'));
  app.use((err, req, res, next) => res.status(err.status || 500).json({ error: err.message }));
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));
beforeEach(() => {
  savedBooking = undefined;
  listing = { id: 'listing-1', sellerId: 'seller-1', price: 100000, listingType: 'RENT', make: 'Toyota', model: 'Camry', year: 2024 };
});
const book = (overrides = {}) => fetch(`${baseUrl}/bookings`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt.sign({ id: buyerId }, process.env.JWT_SECRET)}` },
  body: JSON.stringify({
    listingId: 'listing-1', bookingType: 'rental', rentalDays: 3, paymentMethod: 'arrange_with_seller',
    totalAmount: 305000, contactInfo: { firstName: 'Test', lastName: 'Buyer', email: 'buyer@example.com', phone: '+2348012345678' },
    ...overrides,
  }),
});

test('rental booking uses the listing daily rate and server snapshot', async () => {
  const response = await book({ listingSnapshot: { price: 1, sellerId: 'forged' } });
  assert.equal(response.status, 201);
  assert.equal(savedBooking.totalAmount, 305000);
  assert.equal(savedBooking.sellerId, 'seller-1');
  assert.equal(savedBooking.listingSnapshot.price, 100000);
  assert.match((await response.json()).message, /No payment/);
});
test('a forged snapshot cannot book a missing listing', async () => {
  listing = null;
  assert.equal((await book({ listingSnapshot: { sellerId: 'forged' } })).status, 404);
  assert.equal(savedBooking, undefined);
});
test('a client cannot substitute its own total', async () => {
  assert.equal((await book({ totalAmount: 1 })).status, 409);
  assert.equal(savedBooking, undefined);
});
test('a sale cannot be booked as a rental', async () => {
  listing.listingType = 'SALE';
  assert.equal((await book()).status, 400);
});
test('booking rejects self-purchases, invalid contact details, and fake promo codes', async () => {
  listing.sellerId = buyerId;
  assert.equal((await book()).status, 400);
  listing.sellerId = 'seller-1';
  assert.equal((await book({ contactInfo: {} })).status, 400);
  assert.equal((await book({ promoCode: 'FAKE' })).status, 400);
  assert.equal((await book({ addons: { insurance: 'false' } })).status, 400);
  assert.equal(savedBooking, undefined);
});
test('rental duration must be present and between 1 and 365 days', async () => {
  for (const rentalDays of [undefined, 0, 366, 1.5]) {
    assert.equal((await book({ rentalDays })).status, 400);
  }
});
test('purchase and rental add-ons are calculated without arbitrary discounts', () => {
  assert.equal(calculateBookingTotal({ price: 10000000, listingType: 'SALE' }, {
    bookingType: 'purchase', addons: { insurance: true, delivery: true, inspection: true },
  }), 10725000);
  assert.equal(calculateBookingTotal(listing, { bookingType: 'rental', rentalDays: 7, addons: { insurance: true, delivery: true } }), 860000);
});
