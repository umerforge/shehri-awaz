import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CivicIssue, UserProfile, IssueStatus } from '../types';
import { SEED_ISSUES } from '../data/seedData';

// Supabase Environment variables with multi-framework compatibility (Vite / Next.js / Standard)
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = 
  metaEnv.VITE_SUPABASE_URL || 
  metaEnv.NEXT_PUBLIC_SUPABASE_URL || 
  metaEnv.SUPABASE_URL || 
  'https://fldubtssnhnusqtnermz.supabase.co';

const supabaseAnonKey = 
  metaEnv.VITE_SUPABASE_ANON_KEY || 
  metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  metaEnv.SUPABASE_ANON_KEY || 
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('http')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Local Session Persistence
const STORAGE_KEY_USER = 'shehriawaz_user_v2';
const STORAGE_KEY_ISSUES = 'shehriawaz_issues_v2';

function getLocalUser(): UserProfile | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    return null;
  }
}

function saveLocalUser(user: UserProfile | null) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_USER);
    }
  } catch (e) {
    console.error('Failed to save user session', e);
  }
}

function getLocalIssues(): CivicIssue[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_ISSUES);
    if (!data) return SEED_ISSUES;
    return JSON.parse(data);
  } catch (e) {
    return SEED_ISSUES;
  }
}

function saveLocalIssues(issues: CivicIssue[]) {
  try {
    localStorage.setItem(STORAGE_KEY_ISSUES, JSON.stringify(issues));
  } catch (e) {
    console.error('Failed to cache issues', e);
  }
}

// ----------------- SAFE JSON HTTP CLIENT HELPER -----------------
export async function safeFetchJson<T = any>(
  url: string, 
  options?: RequestInit
): Promise<{
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
}> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (!res.ok) {
        return {
          ok: false,
          status: res.status,
          data,
          error: data?.error || data?.message || `Server returned error (${res.status})`,
        };
      }
      return { ok: true, status: res.status, data, error: null };
    }

    // Non-JSON response received (e.g. HTML 404 page or text error from static edge)
    const rawText = await res.text();
    console.warn(`[ShehriAwaz API] Non-JSON response from ${url} (HTTP ${res.status}):`, rawText.slice(0, 200));

    return {
      ok: false,
      status: res.status,
      data: null,
      error: `Unexpected server response (${res.status}).`,
    };
  } catch (err: any) {
    console.error(`[ShehriAwaz API] Network error calling ${url}:`, err);
    return {
      ok: false,
      status: 0,
      data: null,
      error: err?.message || 'Connection error. Please check your network and try again.',
    };
  }
}

// ----------------- AUTH SERVICES -----------------
export async function signUpUser(params: {
  email: string;
  password: string;
  fullName: string;
  city: string;
  area: string;
  phone?: string;
}): Promise<{ user: UserProfile | null; error: string | null }> {
  if (!supabase) {
    console.warn('[ShehriAwaz Auth] Supabase client is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
    return { user: null, error: "We couldn't create your account right now. Please verify the app configuration." };
  }

  console.log(`[ShehriAwaz Auth] === SIGNUP PROCESS STARTED ===`);
  console.log(`[ShehriAwaz Auth] Target Email: ${params.email}`);
  console.log(`[ShehriAwaz Auth] Target Location: ${params.city}, ${params.area}`);
  console.log(`[ShehriAwaz Auth] Supabase Configured: ${isSupabaseConfigured} (URL: ${supabaseUrl})`);

  try {
    console.log('[ShehriAwaz Auth] Invoking supabase.auth.signUp()...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName,
          city: params.city,
          area: params.area,
          phone: params.phone || '',
        },
      },
    });

    if (authError) {
      console.error('[ShehriAwaz Auth] Supabase Auth signUp returned error:', {
        message: authError.message,
        code: (authError as any).code,
        status: (authError as any).status,
        details: (authError as any).details,
        hint: (authError as any).hint,
      });

      const msgLower = (authError.message || '').toLowerCase();
      if (msgLower.includes('already registered') || msgLower.includes('user already exists')) {
        return {
          user: null,
          error: 'An account with this email address already exists. Please login instead.',
        };
      }
      if (msgLower.includes('rate limit') || msgLower.includes('too many requests')) {
        return {
          user: null,
          error: 'Too many signup attempts. Please wait a moment and try again.',
        };
      }
      if (msgLower.includes('password') && msgLower.includes('least')) {
        return {
          user: null,
          error: authError.message,
        };
      }

      return { user: null, error: authError.message || "We couldn't create your account right now. Please try again." };
    }

    if (authData?.user) {
      // In Supabase, if email confirmation is on and user exists, identities array is empty
      if (authData.user.identities && authData.user.identities.length === 0) {
        console.warn('[ShehriAwaz Auth] User already exists (empty identities array returned by Supabase).');
        return {
          user: null,
          error: 'An account with this email address already exists. Please login instead.',
        };
      }

      const userId = authData.user.id;
      console.log(`[ShehriAwaz Auth] Supabase Auth signUp SUCCEEDED! User ID: ${userId}, Session Active: ${Boolean(authData.session)}`);

      // Insert / Upsert citizen profile record
      console.log('[ShehriAwaz Auth] Inserting/upserting public.profiles record...');
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: params.fullName,
        city: params.city,
        area: params.area,
        phone: params.phone || null,
      });

      if (profileError) {
        console.warn('[ShehriAwaz Auth] Supabase public.profiles upsert notice (may be auto-handled by DB trigger):', {
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint,
        });
      } else {
        console.log('[ShehriAwaz Auth] public.profiles upsert SUCCEEDED.');
      }

      const profile: UserProfile = {
        id: userId,
        email: params.email,
        full_name: params.fullName,
        city: params.city,
        area: params.area,
        phone: params.phone || '',
        created_at: authData.user.created_at || new Date().toISOString(),
      };

      saveLocalUser(profile);
      console.log('[ShehriAwaz Auth] === SIGNUP COMPLETED SUCCESSFULLY ===');
      return { user: profile, error: null };
    }
  } catch (sbErr: any) {
    console.error('[ShehriAwaz Auth] Unexpected exception during Supabase client signup:', sbErr);
  }

  return {
    user: null,
    error: "We couldn't create your account right now. Please try again.",
  };
}

export async function signInUser(
  email: string,
  pass: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  if (!supabase) {
    console.warn('[ShehriAwaz Auth] Supabase client is not configured (missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).');
    return { user: null, error: 'Incorrect email or password. Please try again.' };
  }

  console.log(`[ShehriAwaz Auth] === LOGIN PROCESS STARTED ===`);
  console.log(`[ShehriAwaz Auth] Target Email: ${email}`);
  console.log(`[ShehriAwaz Auth] Supabase Configured: ${isSupabaseConfigured}`);

  try {
    console.log('[ShehriAwaz Auth] Invoking supabase.auth.signInWithPassword()...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (authError) {
      console.error('[ShehriAwaz Auth] Supabase signInWithPassword error:', {
        message: authError.message,
        code: (authError as any).code,
        status: (authError as any).status,
      });

      const msgLower = (authError.message || '').toLowerCase();
      if (msgLower.includes('invalid login credentials') || msgLower.includes('invalid credentials')) {
        return { user: null, error: 'Incorrect email or password. Please try again.' };
      }
      if (msgLower.includes('email not confirmed')) {
        return { user: null, error: 'Please confirm your email address before signing in.' };
      }

      return { user: null, error: authError.message || 'Incorrect email or password. Please try again.' };
    }

    if (authData?.user) {
      const userId = authData.user.id;
      console.log(`[ShehriAwaz Auth] Supabase signIn SUCCEEDED! User ID: ${userId}`);

      let userProfile: UserProfile = {
        id: userId,
        email: authData.user.email || email,
        full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
        city: authData.user.user_metadata?.city || 'Lahore',
        area: authData.user.user_metadata?.area || 'Johar Town',
        phone: authData.user.user_metadata?.phone || '',
        created_at: authData.user.created_at || new Date().toISOString(),
      };

      try {
        console.log('[ShehriAwaz Auth] Fetching profile from public.profiles table...');
        const { data: profileRow, error: pError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileRow) {
          console.log('[ShehriAwaz Auth] Profile loaded from DB:', profileRow.full_name);
          userProfile = {
            ...userProfile,
            full_name: profileRow.full_name || userProfile.full_name,
            city: profileRow.city || userProfile.city,
            area: profileRow.area || userProfile.area,
            phone: profileRow.phone || userProfile.phone,
          };
        } else if (pError) {
          console.warn('[ShehriAwaz Auth] Profile fetch note:', pError.message);
        }
      } catch (pErr) {
        console.warn('[ShehriAwaz Auth] Profile query exception:', pErr);
      }

      saveLocalUser(userProfile);
      console.log('[ShehriAwaz Auth] === LOGIN COMPLETED SUCCESSFULLY ===');
      return { user: userProfile, error: null };
    }
  } catch (sbErr: any) {
    console.error('[ShehriAwaz Auth] Unexpected error during Supabase signIn:', sbErr);
  }

  return {
    user: null,
    error: 'Incorrect email or password. Please try again.',
  };
}

export async function signOutUser(): Promise<void> {
  saveLocalUser(null);
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signout notice:', e);
    }
  }
}

export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  if (supabase) {
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('[ShehriAwaz Auth] Could not read Supabase session:', sessionError.message);
        return getLocalUser();
      }

      const user = sessionData.session?.user;
      if (!user) {
        return getLocalUser();
      }

      let profile: UserProfile = {
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || (user.email || 'Citizen').split('@')[0],
        city: user.user_metadata?.city || 'Lahore',
        area: user.user_metadata?.area || 'Johar Town',
        phone: user.user_metadata?.phone || '',
        created_at: user.created_at || new Date().toISOString(),
      };

      const { data: profileRow, error: pError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileRow) {
        profile = {
          ...profile,
          full_name: profileRow.full_name || profile.full_name,
          city: profileRow.city || profile.city,
          area: profileRow.area || profile.area,
          phone: profileRow.phone || profile.phone,
        };
      } else if (pError && pError.code !== 'PGRST116') {
        console.warn('[ShehriAwaz Auth] Profile fetch note:', pError.message);
      }

      saveLocalUser(profile);
      return profile;
    } catch (e) {
      console.warn('[ShehriAwaz Auth] Session lookup exception, falling back to local cache:', e);
    }
  }

  return getLocalUser();
}

export const getCurrentUser = getCurrentUserProfile;

export async function updateUserProfile(data: {
  fullName?: string;
  city?: string;
  area?: string;
  phone?: string;
}): Promise<UserProfile | null> {
  const current = getLocalUser();
  if (!current?.id) return null;

  if (supabase) {
    try {
      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: current.id,
        full_name: data.fullName,
        city: data.city,
        area: data.area,
        phone: data.phone,
      });
      if (upsertError) {
        console.warn('[ShehriAwaz Auth] Profile upsert notice:', upsertError.message);
      }
    } catch (e) {
      console.warn('[ShehriAwaz Auth] Profile upsert exception:', e);
    }
  }

  const updated: UserProfile = {
    ...current,
    full_name: data.fullName || current.full_name,
    city: data.city || current.city,
    area: data.area || current.area,
    phone: data.phone !== undefined ? data.phone : current.phone,
  };
  saveLocalUser(updated);
  return updated;
}

// ----------------- STORAGE SERVICES (IMAGE UPLOAD) -----------------
export async function uploadIssuePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result as string;
      try {
        const result = await safeFetchJson<{ success: boolean; url: string }>('/api/upload-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
            filename: file.name,
          }),
        });
        if (result.ok && result.data?.success && result.data.url) {
          return resolve(result.data.url);
        }
      } catch (err) {
        console.warn('Upload API fallback to data URL:', err);
      }
      resolve(base64Data);
    };
    reader.onerror = () => {
      reject(new Error('The photo could not be uploaded. Please try again.'));
    };
    reader.readAsDataURL(file);
  });
}

// ----------------- CIVIC ISSUES POSTGRESQL CRUD -----------------
export async function fetchAllIssues(filters?: {
  city?: string;
  area?: string;
  category?: string;
  userId?: string;
}): Promise<CivicIssue[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.city && filters.city !== 'All Cities' && filters.city !== 'all') {
      params.append('city', filters.city);
    }
    if (filters?.area && filters.area !== 'All Areas' && filters.area !== 'all') {
      params.append('area', filters.area);
    }
    if (filters?.category && filters.category !== 'all') {
      params.append('category', filters.category);
    }
    if (filters?.userId) {
      params.append('userId', filters.userId);
    }

    const result = await safeFetchJson<{ success: boolean; data: CivicIssue[] }>(`/api/issues?${params.toString()}`);
    if (result.ok && result.data?.success && Array.isArray(result.data.data)) {
      if (result.data.data.length > 0) {
        saveLocalIssues(result.data.data);
        return result.data.data;
      }
    }
  } catch (e) {
    console.warn('Postgres API query notice:', e);
  }

  // Fallback to local cache if offline
  return getLocalIssues();
}

export const fetchCivicIssues = fetchAllIssues;

export async function fetchUserReports(userId: string): Promise<CivicIssue[]> {
  return fetchAllIssues({ userId });
}

export async function submitCivicIssue(issueData: {
  user_id?: string;
  reporter_name?: string;
  image_url?: string;
  category: 'garbage' | 'water' | 'road' | 'electricity' | 'other';
  severity: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  summary: string;
  description?: string;
  city: string;
  area_text: string;
  street_landmark?: string;
  status?: IssueStatus;
}): Promise<CivicIssue> {
  const fallbackImg = 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80';
  const payload = {
    ...issueData,
    image_url: issueData.image_url || fallbackImg,
    status: issueData.status || 'reported',
  };

  try {
    const result = await safeFetchJson<{ success: boolean; data: CivicIssue }>('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (result.ok && result.data?.success && result.data.data) {
      const local = getLocalIssues();
      saveLocalIssues([result.data.data, ...local]);
      return result.data.data;
    }
  } catch (e) {
    console.warn('Postgres insert error:', e);
  }

  // Offline fallback
  const fallbackIssue: CivicIssue = {
    ...payload,
    image_url: payload.image_url,
    id: 'issue-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    created_at: new Date().toISOString(),
  };
  const local = getLocalIssues();
  saveLocalIssues([fallbackIssue, ...local]);
  return fallbackIssue;
}

export async function updateCivicIssueStatus(
  issueId: string,
  newStatus: IssueStatus
): Promise<boolean> {
  try {
    const result = await safeFetchJson<{ success: boolean }>(`/api/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (result.ok && result.data?.success) {
      const list = getLocalIssues();
      const updated = list.map((item) =>
        item.id === issueId
          ? {
              ...item,
              status: newStatus,
              resolved_at: newStatus === 'resolved' ? new Date().toISOString() : undefined,
            }
          : item
      );
      saveLocalIssues(updated);
      return true;
    }
  } catch (e) {
    console.warn('Status update API error:', e);
  }

  const list = getLocalIssues();
  const updated = list.map((item) =>
    item.id === issueId
      ? {
          ...item,
          status: newStatus,
          resolved_at: newStatus === 'resolved' ? new Date().toISOString() : undefined,
        }
      : item
  );
  saveLocalIssues(updated);
  return true;
}

export const updateIssueStatusInDB = updateCivicIssueStatus;

// ----------------- BACKEND & DATABASE DIAGNOSTICS -----------------
export async function getPostgresHealth(): Promise<{
  connected: boolean;
  issueCount?: number;
  database?: string;
  pooler?: string;
  error?: string | null;
}> {
  try {
    const result = await safeFetchJson<any>('/api/db-status');
    if (result.ok && result.data) {
      return result.data;
    }
    return { connected: false, error: 'Could not contact database server' };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}
