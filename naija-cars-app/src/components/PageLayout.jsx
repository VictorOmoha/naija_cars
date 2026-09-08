import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PageHeader({ eyebrow, title, description, children, backTo, backLabel = 'Back' }) {
  return <header className="nc-page-header"><div className="nc-page-width">
    {backTo && <Link className="nc-back-link" to={backTo}><ArrowLeft size={16} />{backLabel}</Link>}
    <div className="nc-page-title-row"><div>{eyebrow && <p className="nc-eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description && <p className="nc-page-description">{description}</p>}</div>{children && <div className="nc-page-header-actions">{children}</div>}</div>
  </div></header>;
}

export function PageState({ loading, title, description, children }) {
  return <section className="nc-page-state" aria-live="polite">
    {loading ? <Loader2 className="animate-spin" size={30} /> : <AlertCircle size={30} />}
    <h2>{title || (loading ? 'Loading…' : 'Something went wrong')}</h2>
    {description && <p>{description}</p>}{children}
  </section>;
}
