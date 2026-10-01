import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Button } from './ui';

export function AdminAccessGate({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, error, signOut } = useAuth();
  if (loading) return <div className="admin-access-state"><span className="eyebrow">VERA CLOTHING</span><h1>Checking your access.</h1><p>One moment while we restore your account.</p></div>;
  if (!user) return <Navigate to="/login?redirect=%2Fadmin" replace />;
  if (profile?.role !== 'admin') {
    return <div className="admin-access-state"><span className="eyebrow">Account access</span><h1>This area is for the store team.</h1><p>{error || 'Your customer account does not have an administrator role.'}</p><div className="admin-access-actions"><Link to="/" className="button button-primary">Return to the storefront</Link><Button variant="secondary" onClick={() => void signOut()}>Sign out</Button></div></div>;
  }
  return children;
}
