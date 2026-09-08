// Full local preview. Uses only its isolated workspace database, never .env.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const previewRoot = path.resolve(__dirname, '../../.preview');
const password = fs.readFileSync(path.join(previewRoot, 'db-password.txt'), 'utf8').trim();
process.env.DATABASE_URL = `postgresql://naijacars_preview:${password}@127.0.0.1:5432/naijacars_preview`;
process.env.NODE_ENV = 'development';
process.env.PORT = '5056';
process.env.CLIENT_URL = 'http://127.0.0.1:5173';
process.env.SERVER_URL = 'http://127.0.0.1:5056';
process.env.JWT_SECRET = crypto.createHash('sha256').update(password + '-access').digest('hex');
process.env.JWT_REFRESH_SECRET = crypto.createHash('sha256').update(password + '-refresh').digest('hex');
for (const key of ['SMTP_HOST','SMTP_USER','SMTP_PASS','SENDGRID_API_KEY','PAYSTACK_SECRET_KEY','PAYSTACK_PUBLIC_KEY','CLOUDINARY_CLOUD_NAME','CLOUDINARY_API_KEY','CLOUDINARY_API_SECRET']) process.env[key] = '';
const prisma = require('../src/lib/prisma');
const bcrypt = require('bcryptjs');
async function seed() {
  const passwordHash = await bcrypt.hash('PreviewCars2026!', 10);
  for (const [id, email, firstName, userType, phoneNumber] of [
    ['preview-buyer', 'buyer@naijacars.test', 'Alex', 'BUYER', '+2348012345101'],
    ['preview-seller', 'seller@naijacars.test', 'Ada', 'DEALER', '+2348012345102'],
    ['preview-admin', 'admin@naijacars.test', 'Jordan', 'ADMIN', '+2348012345103'],
  ]) {
    await prisma.user.upsert({ where: { id }, update: {}, create: { id, email, phoneNumber, passwordHash, userType, isVerified: true, profile: { create: { firstName, lastName: 'Preview', city: 'Lagos', state: 'Lagos', ...(userType === 'DEALER' ? { businessName: 'NaijaCars Preview Motors', verificationBadge: true } : {}) } } } });
  }
  await prisma.subscription.upsert({ where: { paymentReference: 'local-preview-plan' }, update: {}, create: { userId: 'preview-seller', planType: 'PREMIUM', endDate: new Date('2027-09-08'), listingsLimit: -1, amountPaid: 0, paymentReference: 'local-preview-plan', autoRenew: false } });
  if (await prisma.carListing.count() === 0) {
    const response = await fetch('https://naija-cars-api.onrender.com/api/listings?limit=50');
    if (!response.ok) throw new Error('Cannot load public preview inventory');
    const { data } = await response.json();
    for (const car of data.listings) {
      const fields = ['id','listingType','make','model','year','trim','title','mileage','transmission','fuelType','bodyType','color','engineSize','condition','price','negotiable','locationState','locationCity','description','isFeatured','createdAt'];
      const record = Object.fromEntries(fields.filter(key => car[key] !== undefined).map(key => [key, car[key]]));
      await prisma.carListing.create({ data: { ...record, sellerId: 'preview-seller', status: 'ACTIVE', phone: null, whatsapp: null, media: { create: (car.media || []).filter(m => m.url).map((m, index) => ({ url: m.url, mediaType: 'PHOTO', displayOrder: index, thumbnailUrl: m.thumbnailUrl || null })) } } });
    }
  }
}
async function start() {
  await seed();
  const http = require('node:http');
  const { Server } = require('socket.io');
  const app = require('../src/app');
  const { authenticateSocket, registerSocketHandlers } = require('../src/services/socketHandlers');
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: ['http://127.0.0.1:5173','http://localhost:5173'], credentials: true } });
  io.use(authenticateSocket);
  io.on('connection', registerSocketHandlers);
  app.set('io', io);
  server.listen(5056, '127.0.0.1', () => console.log('Full NaijaCars local preview ready: http://127.0.0.1:5056'));
}
start().catch(error => { console.error(error.message); process.exitCode = 1; });
