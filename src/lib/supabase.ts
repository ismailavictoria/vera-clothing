import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

const placeholderUrl = Boolean(supabaseUrl?.includes('your-project-ref'));
const placeholderKey = Boolean(supabasePublishableKey?.startsWith('your-supabase-publishable-key'));
const hasPlaceholderValues = placeholderUrl || placeholderKey;
const onlyExampleValues = placeholderUrl && placeholderKey;
const hasPrivilegedKey = Boolean(supabasePublishableKey && /service_role|sb_secret_/i.test(supabasePublishableKey));

export const supabaseConfigurationIssue = hasPrivilegedKey
  ? 'A privileged Supabase key is not allowed in the browser. Configure a publishable key instead.'
  : Boolean(supabaseUrl || supabasePublishableKey) && !onlyExampleValues && (!supabaseUrl || !supabasePublishableKey || hasPlaceholderValues)
    ? 'Set both VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to enable the catalogue connection.'
    : null;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey && !hasPlaceholderValues && !hasPrivilegedKey);

/**
 * Browser-safe Supabase client. Only the publishable key is accepted here.
 * Uses only the public publishable key; authentication identities and profiles remain protected by Supabase RLS.
 */
let clientPromise: Promise<SupabaseClient | null> | undefined;

export function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured) return Promise.resolve(null);
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => createClient(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    }));
  }
  return clientPromise;
}
