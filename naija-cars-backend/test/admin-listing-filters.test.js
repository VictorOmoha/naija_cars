const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');
const prisma = require('../src/lib/prisma');
process.env.JWT_SECRET = 'admin-filter-test-secret';
let server, base, captured;
prisma.user.findUnique = async () => ({ id: 'admin-1', userType: 'ADMIN', isActive: true });
prisma.carListing.findMany = async ({ where }) => { captured = where; return []; };
prisma.carListing.count = async () => 0;
before(async () => {
  const app = express(); app.use('/admin', require('../src/routes/admin'));
  await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); });
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));
async function list(query) {
  const token = jwt.sign({ userId: 'admin-1' }, process.env.JWT_SECRET);
  const response = await fetch(`${base}/admin/listings${query}`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(response.status, 200); return captured;
}
test('featured listings filter applies before pagination', async () => {
  assert.equal((await list('?featured=true')).isFeatured, true);
  assert.equal((await list('')).isFeatured, undefined);
});
test('pending listings status combines with other filters', async () => {
  assert.deepEqual(await list('?status=PENDING&listingType=SALE&featured=true'), { status: 'PENDING', listingType: 'SALE', isFeatured: true });
});
