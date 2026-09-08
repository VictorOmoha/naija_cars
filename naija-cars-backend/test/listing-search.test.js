const { test, before, after, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const prisma = require('../src/lib/prisma');

let server, baseUrl, query, countQuery;
prisma.carListing.findMany = async (args) => { query = args; return []; };
prisma.carListing.count = async (args) => { countQuery = args; return 27; };
before(async () => {
  const app = express();
  app.use('/listings', require('../src/routes/listings'));
  app.use((err, req, res, next) => res.status(500).json({ error: err.message }));
  await new Promise((resolve) => { server = app.listen(0, '127.0.0.1', resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}/listings`;
});
after(() => new Promise((resolve) => server.close(resolve)));
beforeEach(() => { query = undefined; countQuery = undefined; });

test('marketplace filters and sorting reach the database before pagination', async () => {
  const response = await fetch(baseUrl + '?type=SALE&bodyType=SUV&state=Lagos&minPrice=5000000&maxPrice=20000000&sort=price-low&page=2');
  assert.equal(response.status, 200);
  assert.equal(query.skip, 12);
  assert.equal(query.take, 12);
  assert.deepEqual(query.orderBy, [{ price: 'asc' }, { id: 'asc' }]);
  assert.deepEqual(query.where.bodyType, { equals: 'SUV', mode: 'insensitive' });
  assert.deepEqual(query.where.price, { gte: 5000000, lte: 20000000 });
  assert.equal(query.where.locationState, 'Lagos');
  assert.equal(query.where.listingType, 'SALE');
  assert.equal(query.where.status, 'ACTIVE');
  assert.deepEqual(query.where.seller, { isActive: true });
  assert.deepEqual(countQuery.where, query.where);
  assert.deepEqual((await response.json()).data.pagination, { total: 27, page: 2, limit: 12, pages: 3 });
});

test('a make and model search requires each word across searchable fields', async () => {
  const response = await fetch(baseUrl + '?search=%20Toyota%20%20Camry%20&verified=true');
  assert.equal(response.status, 200);
  assert.deepEqual(query.where.AND.map(({ OR }) => OR[0].make.contains), ['Toyota', 'Camry']);
  for (const { OR } of query.where.AND) assert.deepEqual(OR.map(Object.keys).flat(), ['make', 'model', 'description']);
  assert.deepEqual(query.where.seller.profile, { verificationBadge: true });
});

test('each supported sort is stable across pages', async () => {
  for (const [sort, field, direction] of [['newest', 'createdAt', 'desc'], ['price-high', 'price', 'desc'], ['year-new', 'year', 'desc'], ['mileage', 'mileage', 'asc']]) {
    assert.equal((await fetch(baseUrl + '?sort=' + sort)).status, 200);
    assert.deepEqual(query.orderBy, [{ [field]: direction }, { id: 'asc' }]);
  }
});

test('invalid sorting and repeated or nested filters are rejected without querying inventory', async () => {
  for (const suffix of ['?sort=unknown', '?sort=constructor', '?search=Toyota&search=Honda', '?state[equals]=Lagos']) {
    assert.equal((await fetch(baseUrl + suffix)).status, 400);
    assert.equal(query, undefined);
  }
});

test('existing multi-make links and the rental daily budget remain supported', async () => {
  assert.equal((await fetch(baseUrl + '?type=RENT&make=Toyota,Honda&maxPrice=100000')).status, 200);
  assert.deepEqual(query.where.make, { in: ['Toyota', 'Honda'], mode: 'insensitive' });
  assert.equal(query.where.listingType, 'RENT');
  assert.deepEqual(query.where.price, { lte: 100000 });
});

test('Abuja search includes inventory saved under FCT', async () => {
  assert.equal((await fetch(baseUrl + '?state=Abuja')).status, 200);
  assert.deepEqual(query.where.locationState, { in: ['Abuja', 'FCT'] });
});
