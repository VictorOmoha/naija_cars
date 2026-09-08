import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = new EventTarget();
const { default: api } = await import('../src/services/api.js');
const unauthorized = (config) => Promise.reject(new axios.AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
  status: 401, data: { error: { message: 'Invalid credentials' } }, config,
}));
beforeEach(() => { storage.clear(); storage.set('accessToken', 'old-token'); });

test('parallel unauthorized requests refresh once and retry each request at most once', async () => {
  let refreshes = 0;
  let attempts = 0;
  let releaseRefresh;
  const refreshed = new Promise(resolve => { releaseRefresh = resolve; });
  axios.defaults.adapter = async (config) => {
    refreshes++;
    await refreshed;
    return { status: 200, config, data: { data: { accessToken: 'new-token' } } };
  };
  api.defaults.adapter = (config) => {
    attempts++;
    if (attempts === 2) setTimeout(releaseRefresh, 0);
    return unauthorized(config);
  };
  const results = await Promise.allSettled([api.get('/messages'), api.get('/favorites')]);
  assert.equal(refreshes, 1);
  assert.equal(attempts, 4);
  assert.ok(results.every(result => result.status === 'rejected'));
});
test('incorrect login and current-password responses never trigger a refresh', async () => {
  let refreshes = 0;
  axios.defaults.adapter = () => { refreshes++; throw new Error('unexpected refresh'); };
  api.defaults.adapter = unauthorized;
  await assert.rejects(api.post('/auth/login'));
  await assert.rejects(api.post('/auth/change-password'));
  assert.equal(refreshes, 0);
  assert.equal(storage.get('accessToken'), 'old-token');
});
test('successful refresh updates the token and notifies the auth store', async () => {
  let notifiedToken;
  window.addEventListener('auth:token-refreshed', (event) => { notifiedToken = event.detail; }, { once: true });
  axios.defaults.adapter = async (config) => ({ status: 200, config, data: { data: { accessToken: 'fresh-token' } } });
  api.defaults.adapter = (config) => config._retry
    ? Promise.resolve({ status: 200, config, data: 'ok' }) : unauthorized(config);
  assert.equal((await api.get('/messages')).data, 'ok');
  assert.equal(storage.get('accessToken'), 'fresh-token');
  assert.equal(notifiedToken, 'fresh-token');
});
