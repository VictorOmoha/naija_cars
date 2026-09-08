const { test } = require('node:test');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const nodemailer = require('nodemailer');
const prisma = require('../src/lib/prisma');
const mediaService = require('../src/services/mediaService');

test('updated image library creates listing JPEGs and thumbnails', async () => {
  const input = await sharp({ create: { width: 20, height: 20, channels: 3, background: '#008751' } }).png().toBuffer();
  prisma.media.create = async ({ data }) => data;
  const result = await mediaService.uploadImageBuffer(input, 'listing-test', 0);
  assert.match(result.url, /^data:image\/jpeg;base64,/);
  const thumbnail = Buffer.from(result.thumbnailUrl.split(',')[1], 'base64');
  const metadata = await sharp(thumbnail).metadata();
  assert.equal(metadata.width, 400);
  assert.equal(metadata.height, 300);
});
test('updated email library renders messages without opening a network connection', async () => {
  const transport = nodemailer.createTransport({ jsonTransport: true });
  const result = await transport.sendMail({
    from: 'test@example.com', to: 'recipient@example.com', subject: 'Compatibility test',
    html: '<p>Test email</p>', text: 'Test email',
  });
  assert.equal(JSON.parse(result.message).subject, 'Compatibility test');
  transport.close();
});
