import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MessageCircle, ArrowRight, CheckCircle } from 'lucide-react';
import api from '../services/api';
import { PageHeader } from '../components/PageLayout';

export default function ContactPage() {
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();
  const submit = async (data) => {
    setError('');
    try { const response = await api.post('/contact', data); setReference(response.data.data.reference); reset(); }
    catch (err) { setError(err.response?.data?.error?.message || 'Your message wasn’t sent. Please try again. Your details are still here.'); }
  };
  const field = (name, label, type = 'text', rules = {}) => <label className="nc-form-field">{label}<input type={type} autoComplete={name === 'firstName' ? 'given-name' : name === 'lastName' ? 'family-name' : name === 'email' ? 'email' : name === 'phone' ? 'tel' : undefined} {...register(name, { required: name !== 'phone' && `${label} is required`, ...rules })} aria-invalid={Boolean(errors[name])} />{errors[name] && <span className="nc-field-error">{errors[name].message}</span>}</label>;
  return <><PageHeader eyebrow="We’re here to help" title="Let’s talk" description="Questions about your account, a listing or selling on NaijaCars? Get in touch." /><div className="nc-page-width nc-content nc-support-layout">
    <section className="nc-panel"><h2>Send us a message</h2><p className="nc-form-intro">Share a little detail so we can point you in the right direction.</p>
      {reference ? <div className="nc-success-panel" role="status"><CheckCircle size={34} /><h3>Thanks for reaching out</h3><p>Your enquiry is saved in our support inbox.</p><p className="nc-reference">Reference: {reference}</p><button className="nc-button nc-button-secondary" onClick={() => setReference('')}>Send another message</button></div> : <form className="nc-form" onSubmit={handleSubmit(submit)}>
        <div className="nc-form-grid">{field('firstName', 'First name', 'text', { maxLength: 80 })}{field('lastName', 'Last name', 'text', { maxLength: 80 })}{field('email', 'Email address', 'email')}{field('phone', 'Phone number (optional)', 'tel')}</div>
        <label className="nc-form-field">What can we help with?<select {...register('subject', { required: true })}><option value="Account support">Account support</option><option>Buying or renting a car</option><option>Listing a car</option><option>Dealer partnerships</option><option>Something else</option></select></label>
        <label className="nc-form-field">Your message<textarea rows={6} maxLength={5000} {...register('message', { required: 'Please enter your message', minLength: { value: 20, message: 'Please include at least 20 characters.' } })} aria-invalid={Boolean(errors.message)} placeholder="Tell us how we can help…" />{errors.message && <span className="nc-field-error">{errors.message.message}</span>}<small>Please don’t include passwords or payment card details.</small></label>
        {error && <p className="nc-form-error" role="alert">{error}</p>}<button className="nc-button" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : 'Send message'}<ArrowRight size={18} /></button>
      </form>}
    </section><aside className="space-y-5"><section className="nc-panel"><MessageCircle size={26} className="text-brand mb-4" /><h2>A quick answer might be here</h2><p className="nc-description">Our help centre covers finding a car, contacting sellers, listing your vehicle and managing your account.</p><Link className="nc-text-link" to="/help">Visit the help centre<ArrowRight size={17} /></Link></section><section className="nc-safety-note"><div><h2>Asking about a particular car?</h2><p>Message the seller from the listing page for availability, viewing arrangements and vehicle details.</p><Link to="/cars">Find the listing<ArrowRight size={16} /></Link></div></section></aside>
  </div></>;
}
