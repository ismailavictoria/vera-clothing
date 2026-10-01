import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabaseClient, isSupabaseConfigured } from '../../lib/supabase';

export interface CustomerProfile {
  id: string;
  email: string | null;
  full_name: string;
  role: string;
}

interface SignUpResult {
  confirmationRequired: boolean;
  profileReady: boolean;
}
interface AuthContextValue {
  user: User | null;
  profile: CustomerProfile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (fullName: string, email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
}
const AuthContext = createContext<AuthContextValue | null>(null);

function userFullName(user: User): string {
  const value = user.user_metadata?.full_name;
  return typeof value === 'string' ? value.trim() : '';
}

async function ensureCustomerProfile(user: User): Promise<CustomerProfile> {
  const supabase = await getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured. Add the project URL and publishable key to .env.local.');

  const { data: currentProfile, error: readError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', user.id)
    .maybeSingle();
  if (readError) throw new Error(`Could not load your customer profile: ${readError.message}`);
  if (currentProfile) return currentProfile as CustomerProfile;

  const fullName = userFullName(user);
  const { data: createdProfile, error: createError } = await supabase
    .from('profiles')
    .insert({ id: user.id, email: user.email ?? null, full_name: fullName, role: 'customer' })
    .select('id, email, full_name, role')
    .single();

  if (createError) {
    if (createError.code === '23505') {
      const { data: existingProfile, error: duplicateReadError } = await supabase
        .from('profiles')
        .select('id, email, full_name, role')
        .eq('id', user.id)
        .maybeSingle();
      if (!duplicateReadError && existingProfile) return existingProfile as CustomerProfile;
    }
    throw new Error(`Your account is authenticated, but the customer profile could not be initialized. Check the existing profiles RLS policy or auth-user profile trigger: ${createError.message}`);
  }
  return createdProfile as CustomerProfile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const profileRequest = useRef(0);
  const user = session?.user ?? null;

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    let unsubscribe = () => {};
    void getSupabaseClient().then(async (supabase) => {
      if (!active || !supabase) return;
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!active) return;
        setSession(nextSession);
        setError(null);
      });
      unsubscribe = () => subscription.unsubscribe();
      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!active) return;
      if (sessionError) setError(`Could not restore your sign-in session: ${sessionError.message}`);
      setSession(data.session);
      setAuthReady(true);
    }).catch((reason: unknown) => {
      if (!active) return;
      setError(reason instanceof Error ? reason.message : 'Could not initialize Supabase authentication.');
      setAuthReady(true);
    });
    return () => { active = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    const requestId = ++profileRequest.current;
    if (!authReady || !user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    let active = true;
    setProfileLoading(true);
    void ensureCustomerProfile(user)
      .then((nextProfile) => {
        if (active && profileRequest.current === requestId) { setProfile(nextProfile); setError(null); }
      })
      .catch((reason: unknown) => {
        if (active && profileRequest.current === requestId) {
          setProfile(null);
          setError(reason instanceof Error ? reason.message : 'Could not load the customer profile.');
        }
      })
      .finally(() => { if (active && profileRequest.current === requestId) setProfileLoading(false); });
    return () => { active = false; };
  }, [authReady, user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured. Add the project URL and publishable key to .env.local.');
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) throw new Error(signInError.message);
  }, []);

  const signUp = useCallback(async (fullName: string, email: string, password: string): Promise<SignUpResult> => {
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error('Supabase is not configured. Add the project URL and publishable key to .env.local.');
    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      // Role assignment is written to the protected profiles row after authentication;
      // never accept authorization roles from editable user metadata.
      options: { data: { full_name: normalizedName } },
    });
    if (signUpError) throw new Error(signUpError.message);

    if (!data.session || !data.user) return { confirmationRequired: true, profileReady: false };
    const createdProfile = await ensureCustomerProfile({ ...data.user, user_metadata: { ...data.user.user_metadata, full_name: normalizedName } });
    setProfile(createdProfile);
    return { confirmationRequired: false, profileReady: true };
  }, []);

  const signOut = useCallback(async () => {
    const supabase = await getSupabaseClient();
    if (!supabase) { setSession(null); setProfile(null); return; }
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) throw new Error(signOutError.message);
  }, []);

  const loading = !authReady || profileLoading;
  const value = useMemo(() => ({ user, profile, loading, error, signIn, signUp, signOut }), [user, profile, loading, error, signIn, signUp, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
