import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getAdSenseConfig, loadAdSense, requestAd } from '../src/services/adsense.js';

const validEnv = {
  VITE_ADSENSE_ENABLED: 'true',
  VITE_ADSENSE_CLIENT_ID: 'ca-pub-1234567890123456',
  VITE_ADSENSE_HOME_SIDEBAR_SLOT: '1234567890',
};

test('ads require explicit activation and both valid identifiers', () => {
  assert.deepEqual(getAdSenseConfig(validEnv), { client: validEnv.VITE_ADSENSE_CLIENT_ID, slot: '1234567890' });
  for (const env of [{}, { ...validEnv, VITE_ADSENSE_ENABLED: 'false' }, { ...validEnv, VITE_ADSENSE_CLIENT_ID: 'pub-1234567890123456' }, { ...validEnv, VITE_ADSENSE_HOME_SIDEBAR_SLOT: '' }, { ...validEnv, VITE_ADSENSE_HOME_SIDEBAR_SLOT: 'not-a-slot' }]) {
    assert.equal(getAdSenseConfig(env), null);
  }
});

function documentFixture() {
  const scripts = [];
  const handlers = {};
  return {
    scripts, handlers,
    doc: {
      createElement: () => ({ addEventListener: (event, handler) => { handlers[event] = handler; } }),
      head: { appendChild: script => scripts.push(script) },
    },
  };
}

test('route remounts share a single script, including concurrent loads', async () => {
  const { doc, scripts, handlers } = documentFixture();
  const first = loadAdSense(validEnv.VITE_ADSENSE_CLIENT_ID, doc);
  const second = loadAdSense(validEnv.VITE_ADSENSE_CLIENT_ID, doc);
  assert.equal(first, second);
  assert.equal(scripts.length, 1);
  assert.equal(scripts[0].async, true);
  assert.equal(scripts[0].crossOrigin, 'anonymous');
  assert.equal(new URL(scripts[0].src).searchParams.get('client'), validEnv.VITE_ADSENSE_CLIENT_ID);
  handlers.load();
  await first;
  await loadAdSense(validEnv.VITE_ADSENSE_CLIENT_ID, doc);
  assert.equal(scripts.length, 1);
});

test('an ad blocker fails quietly without injecting repeated scripts', async () => {
  const { doc, scripts, handlers } = documentFixture();
  const pending = loadAdSense(validEnv.VITE_ADSENSE_CLIENT_ID, doc);
  const rejected = assert.rejects(pending, /Advertising is unavailable/);
  handlers.error();
  await rejected;
  await assert.rejects(loadAdSense(validEnv.VITE_ADSENSE_CLIENT_ID, doc));
  assert.equal(scripts.length, 1);
});

test('hidden or detached units wait; visible units enqueue only once', () => {
  const target = {};
  let width = 0;
  const element = { isConnected: true, dataset: {}, hasAttribute: () => false, getBoundingClientRect: () => ({ width }) };
  assert.equal(requestAd(element, target), false);
  assert.equal(target.adsbygoogle, undefined);
  width = 300;
  element.isConnected = false;
  assert.equal(requestAd(element, target), false);
  element.isConnected = true;
  assert.equal(requestAd(element, target), true);
  assert.equal(requestAd(element, target), false);
  assert.equal(target.adsbygoogle.length, 1);
  const alreadyProcessed = { ...element, dataset: {}, hasAttribute: () => true };
  assert.equal(requestAd(alreadyProcessed, target), false);
});
