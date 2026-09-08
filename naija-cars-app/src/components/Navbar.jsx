import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, ChevronDown, User, Heart, Bell, LayoutDashboard, LogOut, MessageCircle, HelpCircle, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import useAuthStore from '../stores/authStore';
import Dialog from './Dialog';

const NAV_LINKS = [
  { name: 'Buy cars', href: '/cars' }, { name: 'Rent cars', href: '/rent' },
  { name: 'Dealers', href: '/dealers' }, { name: 'Sell', href: '/sell' },
];
const ACCOUNT_LINKS = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My profile', href: '/profile', icon: User },
  { name: 'Saved cars', href: '/favorites', icon: Heart },
  { name: 'Messages', href: '/messages', icon: MessageCircle },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Help centre', href: '/help', icon: HelpCircle },
];
export const Logo = ({ className = '' }) => (
  <span className={'nc-logo ' + className}>NaijaCars<span>.</span></span>
);

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { openAuthModal, unreadNotificationCount } = useApp();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  useEffect(() => { setMobileOpen(false); setAccountOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!accountOpen) return;
    const closeOutside = (event) => { if (!accountRef.current?.contains(event.target)) setAccountOpen(false); };
    const closeOnEscape = (event) => { if (event.key === 'Escape') { setAccountOpen(false); accountRef.current?.querySelector('button')?.focus(); } };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeOnEscape); };
  }, [accountOpen]);

  const signIn = () => { setMobileOpen(false); openAuthModal('login'); };
  const saved = () => { if (isAuthenticated) navigate('/favorites'); else signIn(); };
  const signOut = async () => { setMobileOpen(false); setAccountOpen(false); await logout(); navigate('/'); };

  return (
    <>
      <a className="nc-skip-link" href="#main-content">Skip to content</a>
      <header className="nc-header">
        <div className="nc-header-inner">
          <Link to="/" aria-label="NaijaCars home"><Logo /></Link>
          <nav className="nc-desktop-nav" aria-label="Main navigation">
            {NAV_LINKS.map((link) => <NavLink key={link.href} to={link.href} className={({ isActive }) => isActive ? 'is-active' : ''}>{link.name}</NavLink>)}
          </nav>
          <div className="nc-header-actions">
            <button className="nc-saved-button" onClick={saved}><Heart size={22} strokeWidth={1.8} /><span>Saved</span></button>
            {isAuthenticated ? (
              <>
                <Link to="/messages" className="nc-icon-button nc-messages-button" aria-label={'Messages' + (unreadNotificationCount ? ', ' + unreadNotificationCount + ' unread' : '')}>
                  <MessageCircle size={21} />{unreadNotificationCount > 0 && <span className="nc-notification-dot" />}
                </Link>
                <div className="nc-account" ref={accountRef}>
                  <button className="nc-account-button" onClick={() => setAccountOpen(!accountOpen)} aria-expanded={accountOpen} aria-controls="account-navigation"><User size={19} /><span>{user?.profile?.firstName || 'Account'}</span><ChevronDown size={15} /></button>
                  {accountOpen && <nav id="account-navigation" className="nc-account-menu" aria-label="Account navigation">
                    <div className="nc-account-info"><strong>{user?.profile?.firstName || 'Your account'}</strong><span>{user?.email}</span></div>
                    {ACCOUNT_LINKS.map(({ href, name, icon: Icon }) => <Link to={href} key={href}><Icon size={17} />{name}</Link>)}
                    {user?.userType === 'ADMIN' && <Link to="/admin"><Shield size={17} />Admin panel</Link>}
                    <button onClick={signOut}><LogOut size={17} />Sign out</button>
                  </nav>}
                </div>
              </>
            ) : <button className="nc-sign-in" onClick={signIn}>Sign in</button>}
            <Link to="/sell" className="nc-button nc-list-button">List a car</Link>
            <button className="nc-icon-button nc-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen}><Menu size={24} /></button>
          </div>
        </div>
      </header>
      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} title="Menu" className="nc-mobile-menu">
        <nav aria-label="Mobile navigation">
          {NAV_LINKS.map(({ href, name }) => <NavLink to={href} key={href} onClick={() => setMobileOpen(false)}>{name}</NavLink>)}
          <button onClick={saved}><Heart size={19} />Saved cars</button>
          <Link to="/valuation">Car valuation</Link>
          {isAuthenticated && ACCOUNT_LINKS.filter(({ href }) => href !== '/favorites').map(({ href, name }) => <Link key={href} to={href} onClick={() => setMobileOpen(false)}>{name}</Link>)}
          {user?.userType === 'ADMIN' && <Link to="/admin">Admin panel</Link>}
          <div className="nc-menu-auth"><button className="nc-button" onClick={isAuthenticated ? signOut : signIn}>{isAuthenticated ? 'Sign out' : 'Sign in'}</button></div>
        </nav>
      </Dialog>
    </>
  );
}
