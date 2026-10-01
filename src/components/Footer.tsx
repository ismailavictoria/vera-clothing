import { ArrowUpRight, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { brand } from '../config/brand';

export function Footer() {
  return <footer className="site-footer"><div className="footer-main"><div className="footer-brand"><Link to="/" className="brand-lockup"><span className="brand-monogram">{brand.monogram}</span><span>{brand.name}</span></Link><p>{brand.description}</p></div><div className="footer-links"><div><span className="footer-heading">Explore</span><Link to="/shop">Shop all</Link><Link to="/shop?category=Dresses">Dresses</Link><Link to="/shop?category=Tops">Tops</Link></div><div><span className="footer-heading">A little help</span><a href={`mailto:${brand.links.supportEmail}`}>Contact us</a><Link to="/wishlist">Your wishlist</Link><Link to="/cart">Your bag</Link></div></div><a className="social-link" href={brand.links.instagram} target="_blank" rel="noreferrer"><Instagram size={17} /> Instagram <ArrowUpRight size={14} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} {brand.name}. Made with intention.</span><span>Thoughtfully considered, always.</span></div></footer>;
}
