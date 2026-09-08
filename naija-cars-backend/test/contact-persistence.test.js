const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const prisma = require('../src/lib/prisma');
let server, base, stored, rejectStorage = false;
prisma.contactInquiry.create = async ({ data }) => {
  if (rejectStorage) throw new Error('Database unavailable');
  stored = data; return { id: 'inquiry-1', ...data };
};
before(async () => {
 const app = express(); app.use(express.json()); app.use('/contact', require('../src/routes/contact'));
 app.use((err, req, res, next) => res.status(503).json({ error: { message: err.message } }));
 await new Promise(resolve => { server = app.listen(0, '127.0.0.1', resolve); }); base = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise(resolve => server.close(resolve)));
const submit = (body = {}) => fetch(base + '/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ firstName: 'Test', lastName: 'Member', email: 'test@example.com', subject: 'Listing enquiry', message: 'Please help me update the photos in my listing.', ...body }) });
test('contact success requires a persisted enquiry and returns its reference', async () => {
 const response = await submit(); assert.equal(response.status, 201); assert.equal((await response.json()).data.reference, 'inquiry-1'); assert.equal(stored.subject, 'Listing enquiry');
});
test('contact rejects invalid and oversized messages', async () => {
 for (const message of ['short', 'a'.repeat(5001)]) assert.equal((await submit({ message })).status, 400);
});
test('storage failure never reports contact success', async () => {
 rejectStorage = true; const response = await submit(); assert.equal(response.status, 503); assert.equal((await response.json()).data, undefined); rejectStorage = false;
});
