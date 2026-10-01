import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, LockKeyhole, UserRound } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { brand } from '../config/brand';
import { useAuth } from '../features/auth/AuthContext';
import { Button, Input } from '../components/ui';

function AuthFrame({ eyebrow, title, intro, children, footer }: { eyebrow: string; title: string; intro: string; children: ReactNode; footer: ReactNode }) {
  return <div className="page-wrap auth-page"><div className="auth-panel"><Link to="/" className="auth-brand"><span className="brand-monogram">{brand.monogram}</span><span>{brand.name}</span></Link><span className="eyebrow auth-eyebrow">{eyebrow}</span><h1>{title}</h1><p className="auth-intro">{intro}</p>{children}<div className="auth-footer">{footer}</div><Link to="/" className="auth-back-link"><ArrowLeft size={14}/> Back to the collection</Link></div></div>;
}

export function SignInPage() {
  const { user, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!loading && user) return <Navigate to="/" replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { await signIn(email, password); navigate('/', { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign in. Please try again.'); }
    finally { setSubmitting(false); }
  };
  return <AuthFrame eyebrow="Welcome back" title="A familiar feeling." intro="Sign in to return to the pieces you love." footer={<>New to VERA? <Link to="/register">Create an account</Link></>}>
    <form className="auth-form" onSubmit={submit} noValidate>
      <Input label="Email address" name="email" type="email" autoComplete="email" required value={email} onChange={(event)=>setEmail(event.target.value)} />
      <Input label="Password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(event)=>setPassword(event.target.value)} />
      {error && <p className="auth-error" role="alert">{error}</p>}
      {!import.meta.env.VITE_SUPABASE_URL && <p className="auth-hint" role="status">Sign in requires the Supabase project URL and publishable key in local environment settings.</p>}
      <Button type="submit" fullWidth loading={submitting}><LockKeyhole size={15}/> Sign in</Button>
    </form>
  </AuthFrame>;
}

export function RegisterPage() {
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  if (!loading && user) return <Navigate to="/" replace />;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(''); setMessage('');
    if (password.length < 8) { setError('Choose a password with at least 8 characters.'); return; }
    if (password !== confirmPassword) { setError('Your passwords do not match.'); return; }
    setSubmitting(true);
    try {
      const result = await signUp(fullName, email, password);
      if (result.confirmationRequired) setMessage('Your account has been created. Check your email to confirm your address, then sign in.');
      else navigate('/', { replace: true });
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create your account. Please try again.'); }
    finally { setSubmitting(false); }
  };
  return <AuthFrame eyebrow="A new beginning" title="Make yourself at home." intro="Create an account to keep the pieces you love a little closer." footer={<>Already have an account? <Link to="/login">Sign in</Link></>}>
    <form className="auth-form" onSubmit={submit} noValidate>
      <Input label="Full name" name="fullName" autoComplete="name" required value={fullName} onChange={(event)=>setFullName(event.target.value)} />
      <Input label="Email address" name="email" type="email" autoComplete="email" required value={email} onChange={(event)=>setEmail(event.target.value)} />
      <Input label="Password" name="newPassword" type="password" autoComplete="new-password" required value={password} onChange={(event)=>setPassword(event.target.value)} />
      <Input label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event)=>setConfirmPassword(event.target.value)} />
      {error && <p className="auth-error" role="alert">{error}</p>}
      {message && <p className="auth-success" role="status">{message}</p>}
      <Button type="submit" fullWidth loading={submitting}><UserRound size={15}/> Create account</Button>
    </form>
  </AuthFrame>;
}

export function AccountPage() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  if (loading) return <div className="page-wrap auth-page"><div className="auth-panel"><span className="eyebrow">Your VERA account</span><h1>One moment.</h1><p className="auth-intro">We’re restoring your account details.</p></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  const logout = async () => {
    setError('');
    try { await signOut(); navigate('/', { replace: true }); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to sign out. Please try again.'); }
  };
  return <div className="page-wrap auth-page"><section className="auth-panel account-panel"><span className="eyebrow">Your VERA account</span><h1>Good to have you, <em>{profile?.full_name || user.email?.split('@')[0] || 'friend'}.</em></h1><p className="auth-intro">Your account details, all in one considered place.</p><div className="account-detail"><span>Full name</span><strong>{profile?.full_name || 'Not provided'}</strong></div><div className="account-detail"><span>Email address</span><strong>{profile?.email || user.email}</strong></div><div className="account-detail"><span>Account type</span><strong>{profile?.role === 'admin' ? 'Store administrator' : 'Customer'}</strong></div>{error&&<p className="auth-error" role="alert">{error}</p>}<Button variant="secondary" onClick={logout}>Sign out</Button><div className="auth-footer"><Link to="/wishlist">Visit your wishlist</Link><span>·</span><Link to="/shop">Continue shopping <ArrowRight size={13}/></Link></div></section></div>;
}
