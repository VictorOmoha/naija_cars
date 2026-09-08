import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Check, Mail } from 'lucide-react';
import api from '../../services/api';
import { PageState } from '../../components/PageLayout';
import { useApp } from '../../context/AppContext';

export default function AdminSettings() {
  const [resolved, setResolved] = useState(false);
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(null);
  const client = useQueryClient();
  const { addToast } = useApp();
  const { data: settings, error: settingsError } = useQuery({ queryKey: ['admin-settings'], queryFn: () => api.get('/admin/settings').then(r => r.data.data) });
  const { data, isLoading, error, refetch } = useQuery({ queryKey: ['admin-inquiries', resolved, page], queryFn: () => api.get('/admin/settings/inquiries', { params: { resolved, page } }).then(r => r.data.data) });
  const update = async (id) => {
    setSaving(id);
    try { await api.patch(`/admin/settings/inquiries/${id}`, { resolved: !resolved }); await client.invalidateQueries({ queryKey: ['admin-inquiries'] }); addToast(resolved ? 'Enquiry reopened' : 'Enquiry marked resolved', 'success'); }
    catch { addToast('Could not update this enquiry', 'error'); }
    finally { setSaving(null); }
  };
  return <div className="space-y-7"><div><h1 className="text-3xl font-bold tracking-tight">Platform & support</h1><p className="text-muted mt-2">Service configuration and enquiries from your contact form.</p></div>
    <section className="nc-panel"><h2>Service configuration</h2>{settingsError ? <p className="nc-form-error">Couldn’t load service configuration.</p> : !settings ? <p className="text-muted mt-4">Loading configuration…</p> : <dl className="nc-spec-grid mt-6"><div><dt>Application</dt><dd>{settings.siteName}</dd></div><div><dt>Email delivery</dt><dd>{settings.emailConfigured ? 'Configured' : 'Not configured'}</dd></div><div><dt>Subscription payments</dt><dd>{settings.paymentsConfigured ? 'Configured' : 'Not configured'}</dd></div><div><dt>Support enquiries</dt><dd>{settings.supportStorage}</dd></div><div><dt>Environment</dt><dd>{settings.environment}</dd></div></dl>}<p className="text-sm text-muted mt-6">Service credentials are managed in the deployment environment. This page never displays secret values.</p></section>
    <section><div className="nc-section-title"><h2>Support inbox</h2><div className="flex gap-3"><select className="nc-input-light" aria-label="Enquiry status" value={String(resolved)} onChange={(e) => { setResolved(e.target.value === 'true'); setPage(1); }}><option value="false">Open enquiries</option><option value="true">Resolved enquiries</option></select><button className="nc-icon-button" aria-label="Refresh enquiries" onClick={() => refetch()}><RefreshCw size={18} /></button></div></div>
      {isLoading ? <PageState loading /> : error ? <PageState title="Couldn’t load support enquiries"><button className="nc-button" onClick={() => refetch()}>Try again</button></PageState> : !data?.inquiries.length ? <div className="nc-panel"><p className="text-muted">No {resolved ? 'resolved' : 'open'} enquiries.</p></div> : <div className="space-y-4">{data.inquiries.map(item => <article className="nc-panel" key={item.id}><div className="nc-section-title"><div><h2>{item.subject}</h2><p>{item.firstName} {item.lastName} · {new Date(item.createdAt).toLocaleDateString()}</p></div><button className="nc-button nc-button-secondary" disabled={saving === item.id} onClick={() => update(item.id)}><Check size={16} />{resolved ? 'Reopen' : 'Mark resolved'}</button></div><p className="nc-description">{item.message}</p><a className="nc-text-link" href={`mailto:${item.email}`}><Mail size={17} />{item.email}</a><p className="text-xs text-muted mt-4">Ref. {item.id}{item.phone && ` · ${item.phone}`}</p></article>)}</div>}
      {data?.pagination.pages > 1 && <nav className="nc-pagination"><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>{page} / {data.pagination.pages}</span><button disabled={page >= data.pagination.pages} onClick={() => setPage(page + 1)}>Next</button></nav>}
    </section></div>;
}
