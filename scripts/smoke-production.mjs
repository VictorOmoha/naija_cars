const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.naijacars.online';
const API_URL = process.env.API_URL || 'https://naija-cars-api.onrender.com/api';

async function assertOk(name, url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${name} failed: ${response.status} ${response.statusText}`);
  }
  return response;
}

async function main() {
  const checks = [];

  const frontend = await assertOk('frontend', FRONTEND_URL, { method: 'HEAD' });
  checks.push(`frontend ${frontend.status}`);

  const health = await assertOk('api health', `${API_URL}/health`);
  const payload = await health.json();
  if (payload.status !== 'ok' || payload.database !== 'ok') {
    throw new Error(`api health unhealthy: ${JSON.stringify(payload)}`);
  }
  checks.push(`api ${payload.status}, database ${payload.database}`);

  console.log(`Smoke checks passed: ${checks.join('; ')}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
