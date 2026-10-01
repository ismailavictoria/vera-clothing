import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return <div className="page-wrap"><div className="empty-state not-found"><span className="eyebrow">404 · A wrong turn</span><h1>This page took<br /><em>the scenic route.</em></h1><p>Let’s get you back to something lovely.</p><Link to="/" className="button button-primary">Return home</Link></div></div>;
}
