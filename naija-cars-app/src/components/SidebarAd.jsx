import { useEffect, useRef, useState } from 'react';
import { getAdSenseConfig, loadAdSense, requestAd } from '../services/adsense';

const config = getAdSenseConfig(import.meta.env);
const preview = import.meta.env.DEV;

export default function SidebarAd() {
  const adRef = useRef(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const element = adRef.current;
    if (preview || !config || !element) return;
    let cancelled = false;
    let loading = false;
    let nearViewport = false;
    const load = async () => {
      // The left sidebar is hidden on mobile; never request a zero-width ad.
      if (cancelled || loading || !nearViewport || !element.getBoundingClientRect().width) return;
      loading = true;
      try {
        await loadAdSense(config.client);
        if (!cancelled && requestAd(element)) {
          intersection.disconnect();
          resize.disconnect();
        }
      } catch {
        if (!cancelled) {
          intersection.disconnect();
          resize.disconnect();
          setUnavailable(true);
        }
      } finally {
        loading = false;
      }
    };
    const intersection = new IntersectionObserver(([entry]) => {
      nearViewport = entry.isIntersecting;
      void load();
    }, { rootMargin: '200px 0px' });
    const resize = new ResizeObserver(() => { void load(); });
    intersection.observe(element);
    resize.observe(element);
    return () => {
      cancelled = true;
      intersection.disconnect();
      resize.disconnect();
    };
  }, []);

  if ((!config && !preview) || unavailable) return null;

  return (
    <section className="market-sidebar-ad" aria-label="Advertisements">
      <p className="market-ad-label">Advertisements</p>
      {preview ? (
        <div className="market-ad-preview">
          <span className="market-ad-preview-mark" aria-hidden="true">Ad</span>
          <p>Ad placement preview</p>
          <span>Google ads will appear here once activated.</span>
        </div>
      ) : (
        <ins ref={adRef} className="adsbygoogle market-ad-unit" style={{ display: 'block' }}
          data-ad-client={config.client} data-ad-slot={config.slot}
          data-ad-format="rectangle" data-full-width-responsive="false" />
      )}
    </section>
  );
}
