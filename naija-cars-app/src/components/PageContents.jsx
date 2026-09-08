import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
export default function PageContents({ sections }) {
  const [wide, setWide] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  useEffect(() => { const media = window.matchMedia('(min-width: 1024px)'); const change = () => setWide(media.matches); media.addEventListener('change', change); return () => media.removeEventListener('change', change); }, []);
  return <details key={String(wide)} className="nc-panel nc-legal-nav" open={wide || undefined}><summary>On this page<ChevronDown size={18} /></summary><nav>{sections.map(section => <a key={section.id} href={`#${section.id}`}>{section.title.replace(/^\d+\.\s*/, '')}</a>)}</nav></details>;
}
