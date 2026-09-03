const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');

process.env.NODE_ENV = 'production';

const authService = require('../src/services/authService');

authService.register = async () => ({
  user: {
    id: 'user-1',
    email: 'new-user@example.com',
    phoneNumber: '+2348012345678',
    userType: 'BUYER',
    isVerified: false,
    profile: null
  },
  accessToken: 'access-token',
  refreshToken: 'refresh-token'
});

authService.login = async () => ({
  user: { id: 'user-1', email: 'user@example.com' },
  accessToken: 'access-token',
  refreshToken: 'refresh-token'
});

let receivedRefreshToken;
authService.refreshAccessToken = async (refreshToken) => {
  receivedRefreshToken = refreshToken;
  return { accessToken: 'new-access-token' };
};

const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

const postJson = (path, body = {}, headers = {}) => fetch(`${baseUrl}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', ...headers },
  body: JSON.stringify(body)
});

test('production trusts exactly one Render proxy hop', () => {
  assert.equal(app.get('trust proxy'), 1);
});

test('login sets an HTTP-only refresh cookie without exposing it in JSON', async () => {
  const response = await postJson('/api/auth/login', {
    email: 'user@example.com',
    password: 'Password1'
  });
  const body = await response.json();
  const cookie = response.headers.get('set-cookie');

  assert.equal(response.status, 200);
  assert.equal(body.data.accessToken, 'access-token');
  assert.equal(Object.hasOwn(body.data, 'refreshToken'), false);
  assert.match(cookie, /^refreshToken=refresh-token;/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /Secure/);
  assert.match(cookie, /SameSite=None/);
});

test('registration does not expose the refresh token in JSON', async () => {
  const response = await postJson('/api/auth/register', {
    email: 'new-user@example.com',
    phoneNumber: '+2348012345678',
    password: 'Password1',
    userType: 'BUYER'
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.accessToken, 'access-token');
  assert.equal(Object.hasOwn(body.data, 'refreshToken'), false);
});

test('refresh rejects a token supplied in JSON instead of a cookie', async () => {
  const response = await postJson('/api/auth/refresh', {
    refreshToken: 'body-refresh-token'
  });

  assert.equal(response.status, 401);
});

test('refresh accepts the HTTP-only cookie and returns only an access token', async () => {
  const response = await postJson('/api/auth/refresh', {}, {
    Cookie: 'refreshToken=cookie-refresh-token'
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(receivedRefreshToken, 'cookie-refresh-token');
  assert.deepEqual(body.data, { accessToken: 'new-access-token' });
});
