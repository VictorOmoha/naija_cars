import { Link } from 'react-router-dom';
import { Logo } from './Navbar';
const Footer = () => (
  <footer className="nc-footer">
    <div className="nc-footer-main">
      <div><Link to="/" aria-label="NaijaCars home"><Logo /></Link><p>Your next car. Your next chapter.</p></div>
      <nav aria-label="Marketplace links"><Link to="/cars">Buy a car</Link><Link to="/rent">Rent a car</Link><Link to="/sell">Sell your car</Link><Link to="/dealers">Find a dealer</Link></nav>
      <nav aria-label="Support links"><Link to="/help">Help centre</Link><Link to="/contact">Contact us</Link><Link to="/valuation">Car valuation</Link><Link to="/pricing">Seller plans</Link></nav>
    </div>
    <div className="nc-footer-bottom"><span>© {new Date().getFullYear()} NaijaCars</span><div><Link to="/about">About</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div><span>Powered by <a href="https://omohasolutions.com" target="_blank" rel="noopener noreferrer">Omoha Solutions</a></span></div>
  </footer>
);
export default Footer;
