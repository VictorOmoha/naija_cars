import { Link } from 'react-router-dom';
import { Logo } from './Navbar';

const FOOTER_LINKS = [
  { name: 'Buy', href: '/cars' },
  { name: 'Rent', href: '/rent' },
  { name: 'Sell', href: '/sell' },
  { name: 'Financing', href: '/pricing' },
  { name: 'Dealers', href: '/dealers' },
  { name: 'Support', href: '/help' },
];

const LEGAL_LINKS = [
  { name: 'Terms', href: '/terms' },
  { name: 'Privacy', href: '/privacy' },
  { name: 'Contact', href: '/contact' },
];

const Footer = () => (
  <footer className="border-t-2 border-ink bg-paper">
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-9 py-5 text-[12.5px] font-semibold text-muted">
      <Link to="/" aria-label="NaijaCars home">
        <Logo className="text-base" />
      </Link>

      <nav className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
        {FOOTER_LINKS.map((link, i) => (
          <span key={link.name} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">·</span>}
            <Link to={link.href} className="hover:text-brand transition-colors">
              {link.name}
            </Link>
          </span>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <nav className="flex items-center gap-3">
          {LEGAL_LINKS.map((link) => (
            <Link key={link.name} to={link.href} className="hover:text-brand transition-colors">
              {link.name}
            </Link>
          ))}
        </nav>
        <span>© {new Date().getFullYear()} NaijaCars</span>
      </div>
    </div>
  </footer>
);

export default Footer;
