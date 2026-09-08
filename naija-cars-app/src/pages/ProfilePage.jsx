import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { User, Shield, BadgeCheck, ArrowRight, Camera, Heart, MessageCircle, LogOut } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useApp } from '../context/AppContext';
import api, { authAPI } from '../services/api';
import { PageHeader } from '../components/PageLayout';
import { NIGERIAN_STATES } from '../data/constants';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuthStore();
  const [tab, setTab] = useState('profile');
  return <><PageHeader eyebrow="Your NaijaCars account" title="Account settings" description="Keep your details up to date and your account secure." /><div className="nc-page-width nc-content nc-profile-layout"><nav className="nc-profile-nav" aria-label="Account settings">
    {[['profile', 'My profile', User], ['security', 'Security', Shield], ['verification', 'Verification', BadgeCheck]].map(([id, label, Icon]) => <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}><Icon size={18} />{label}</button>)}
    <Link to="/favorites"><Heart size={18} />Saved cars</Link><Link to="/messages"><MessageCircle size={18} />Messages</Link><button onClick={() => logout()}><LogOut size={18} />Sign out</button>
  </nav><section className="nc-panel">{tab === 'profile' ? <ProfileForm user={user} updateUser={updateUser} /> : tab === 'security' ? <SecurityForm /> : <Verification user={user} updateUser={updateUser} />}</section></div></>;
}
function ProfileForm({ user, updateUser }) {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useApp();
  const p = user?.profile || {};
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { firstName: p.firstName || '', lastName: p.lastName || '', phone: user?.phoneNumber || '', businessName: p.businessName || '', about: p.about || '', address: p.address || '', city: p.city || '', state: p.state || '' } });
  const save = async (data) => {
    setError('');
    try { const response = await api.put('/users/profile', data); updateUser(response.data.data.user); addToast('Your profile has been updated', 'success'); }
    catch (err) { setError(err.response?.data?.error?.message || 'Couldn’t update your profile. Please try again.'); }
  };
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('Choose a JPG, PNG or WebP photo smaller than 5 MB.'); return; }
    setUploading(true); setError('');
    try { const form = new FormData(); form.append('file', file); const response = await api.post('/users/me/avatar', form); updateUser(response.data.data.user); addToast('Profile photo updated', 'success'); }
    catch (err) { setError(err.response?.data?.error?.message || 'Couldn’t upload your photo. Please try again.'); }
    finally { setUploading(false); event.target.value = ''; }
  };
  const field = (name, label, rules = {}, type = 'text') => <label className="nc-form-field">{label}<input type={type} {...register(name, rules)} aria-invalid={Boolean(errors[name])} />{errors[name] && <span className="nc-field-error">{errors[name].message}</span>}</label>;
  return <><h2>Personal details</h2><p className="nc-form-intro">Help buyers and sellers recognise you.</p><div className="nc-avatar-editor">{p.avatarUrl ? <img src={p.avatarUrl} alt="Your profile" /> : <span>{(p.firstName || user?.email || 'N')[0].toUpperCase()}</span>}<div><input className="sr-only" ref={input} type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} aria-label="Profile photo" /><button className="nc-button nc-button-secondary" onClick={() => input.current?.click()} disabled={uploading}><Camera size={17} />{uploading ? 'Uploading…' : 'Change photo'}</button><small>JPG, PNG or WebP. Up to 5 MB.</small></div></div>
    <form className="nc-form" onSubmit={handleSubmit(save)}><div className="nc-form-grid">{field('firstName', 'First name', { required: 'Enter your first name', minLength: { value: 2, message: 'Use at least 2 characters' } })}{field('lastName', 'Last name', { required: 'Enter your last name', minLength: { value: 2, message: 'Use at least 2 characters' } })}<label className="nc-form-field">Email address<input value={user.email} disabled type="email" /><small>Your sign-in email</small></label>{field('phone', 'Phone number', { required: 'Enter your phone number', pattern: { value: /^\+?[\d\s()-]{7,20}$/, message: 'Enter a valid phone number' } }, 'tel')}</div>
    {user.userType !== 'BUYER' && field('businessName', 'Business name (optional)')}
    {field('address', 'Address (optional)')}<div className="nc-form-grid">{field('city', 'City (optional)')}<label className="nc-form-field">State<select {...register('state')}><option value="">Choose a state</option>{NIGERIAN_STATES.map(state => <option key={state}>{state}</option>)}</select></label></div>
    <label className="nc-form-field">About you<textarea rows={4} maxLength={500} {...register('about')} /><small>Up to 500 characters. This appears on your seller profile.</small></label>{error && <p className="nc-form-error" role="alert">{error}</p>}<button className="nc-button" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save changes'}<ArrowRight size={17} /></button>
    </form></>;
}
function SecurityForm() {
  const [error, setError] = useState('');
  const { addToast } = useApp();
  const { register, handleSubmit, getValues, reset, formState: { errors, isSubmitting } } = useForm();
  const save = async ({ currentPassword, newPassword }) => {
    setError('');
    try { await authAPI.changePassword({ currentPassword, newPassword }); reset(); addToast('Password updated', 'success'); }
    catch (err) { setError(err.response?.data?.error?.message || 'Couldn’t change your password. Please try again.'); }
  };
  return <><h2>Change your password</h2><p className="nc-form-intro">Use at least 8 characters, with uppercase and lowercase letters and a number.</p><form className="nc-form" onSubmit={handleSubmit(save)}>{[['currentPassword', 'Current password'], ['newPassword', 'New password'], ['confirmPassword', 'Confirm new password']].map(([name, label]) => <label className="nc-form-field" key={name}>{label}<input type="password" autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'} {...register(name, { required: 'This field is required', validate: value => name === 'confirmPassword' ? value === getValues('newPassword') || 'Passwords do not match' : name === 'newPassword' ? /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(value) || 'Use 8+ characters with uppercase, lowercase and a number' : true })} />{errors[name] && <span className="nc-field-error">{errors[name].message}</span>}</label>)}{error && <p role="alert" className="nc-form-error">{error}</p>}<button className="nc-button" disabled={isSubmitting}>{isSubmitting ? 'Updating…' : 'Update password'}</button></form></>;
}
function Verification({ user, updateUser }) {
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { addToast } = useApp();
  const send = async () => { setBusy(true); setError(''); try { await authAPI.sendOTP(); setSent(true); addToast('Check your email for a verification code', 'success'); } catch (err) { setError(err.response?.data?.error?.message || 'Couldn’t send a code. Please try again.'); } finally { setBusy(false); } };
  const verify = async (event) => { event.preventDefault(); setBusy(true); setError(''); try { await authAPI.verifyOTP(code); const result = await authAPI.getMe(); updateUser(result.data.data.user); addToast('Account verified', 'success'); } catch (err) { setError(err.response?.data?.error?.message || 'Couldn’t verify this code'); } finally { setBusy(false); } };
  return <><h2>Account verification</h2><p className="nc-form-intro">Confirm your email address to help keep your account secure.</p>{user.isVerified ? <p className="nc-status"><BadgeCheck size={20} />Your account is verified</p> : <div className="nc-form"><p className="text-muted text-sm">We’ll send a code to {user.email}.</p>{sent && <form className="nc-form" onSubmit={verify}><label className="nc-form-field">6-digit verification code<input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)} required /></label><button className="nc-button" disabled={busy}>Verify account</button></form>}<button className="nc-button nc-button-secondary" disabled={busy} onClick={send}>{busy ? 'Please wait…' : sent ? 'Send a new code' : 'Send verification code'}</button></div>}{error && <p className="nc-form-error mt-5" role="alert">{error}</p>}<div className="nc-notice mt-8">Seller verification badges are reviewed separately by NaijaCars. <Link className="text-brand underline" to="/contact">Contact support</Link> for help.</div></>;
}
