const scriptLoads = new WeakMap();

export function getAdSenseConfig(env) {
  const client = env.VITE_ADSENSE_CLIENT_ID?.trim();
  const slot = env.VITE_ADSENSE_HOME_SIDEBAR_SLOT?.trim();
  if (env.VITE_ADSENSE_ENABLED !== 'true' || !/^ca-pub-\d{16}$/.test(client || '') || !/^\d+$/.test(slot || '')) return null;
  return { client, slot };
}

// Share one asynchronous script load across route remounts and Strict Mode effects.
export function loadAdSense(client, doc = document) {
  if (scriptLoads.has(doc)) return scriptLoads.get(doc);
  const pending = new Promise((resolve, reject) => {
    const script = doc.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`;
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', () => reject(new Error('Advertising is unavailable')), { once: true });
    doc.head.appendChild(script);
  });
  scriptLoads.set(doc, pending);
  return pending;
}

export function requestAd(element, target = window) {
  if (!element.isConnected || element.getBoundingClientRect().width === 0 || element.hasAttribute('data-adsbygoogle-status') || element.dataset.requested) return false;
  // Mark before push: Google can process the queue synchronously.
  element.dataset.requested = 'true';
  (target.adsbygoogle = target.adsbygoogle || []).push({});
  return true;
}
