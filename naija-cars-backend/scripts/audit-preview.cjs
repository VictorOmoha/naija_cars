// Isolated browser-test fixture. Does not load .env or connect to external services.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'local-audit-fixture-only';
const express = require('express');
const cors = require('cors');
const http = require('node:http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const prisma = require('../src/lib/prisma');
const user = { id: 'audit-buyer', email: 'audit@example.com', phoneNumber: '+2348012345678', userType: 'BUYER', isActive: true, isVerified: true, profile: { firstName: 'Audit', lastName: 'Buyer' } };
const listing = { id: 'audit-rental', sellerId: 'audit-seller', listingType: 'RENT', make: 'Toyota', model: 'Camry', year: 2024, price: 100000, condition: 'FOREIGN_USED', transmission: 'Automatic', fuelType: 'Petrol', locationCity: 'Ikeja', locationState: 'Lagos', media: [], seller: { id: 'audit-seller', profile: { businessName: 'Audit Cars' } } };
prisma.user.findUnique = async () => user;
prisma.carListing.findFirst = async ({ where }) => where.id === listing.id ? listing : null;
prisma.booking.create = async ({ data }) => ({ id: 'audit-booking', ...data });

const app = express();
app.use(cors({ origin: ['http://127.0.0.1:5173', 'http://localhost:5173'], credentials: true }));
app.use(express.json());
app.post('/api/auth/login', (req, res) => res.json({ success: true, data: { user, accessToken: jwt.sign({ id: user.id }, process.env.JWT_SECRET) } }));
app.get('/api/auth/me', (req, res) => res.json({ success: true, data: { user } }));
app.post('/api/auth/logout', (req, res) => res.json({ success: true }));
app.get('/api/listings/:id', (req, res) => req.params.id === listing.id
  ? res.json({ success: true, data: { listing } })
  : res.status(404).json({ success: false, error: { message: 'Listing not found' } }));
app.get('/api/listings', (req, res) => res.json({ success: true, data: { listings: [listing], pagination: { total: 1, pages: 1, page: 1 } } }));
app.get('/api/users/dealers', (req, res) => res.json({ success: true, data: { dealers: [] } }));
app.get('/api/messages/conversations', (req, res) => res.json({ success: true, data: { conversations: [] } }));
app.use('/api/bookings', require('../src/routes/bookings'));
app.use((err, req, res, next) => res.status(err.status || 500).json({ success: false, error: { message: err.message } }));
const server = http.createServer(app);
new Server(server, { cors: { origin: ['http://127.0.0.1:5173', 'http://localhost:5173'] } });
server.listen(5055, '127.0.0.1', () => console.log('Isolated audit fixture ready on port 5055'));
