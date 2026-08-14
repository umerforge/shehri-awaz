import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CivicIssue, UserProfile, IssueStatus } from '../types';
import { SEED_ISSUES } from '../data/seedData';

// Supabase Environment variables
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

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

// ----------------- AUTH SERVICES -----------------
export async function signUpUser(params: {
  email: string;
  password: string;
  fullName: string;
  city: string;
  area: string;
  phone?: string;
}): Promise<{ user: UserProfile | null; error: string | null }> {
  try {
    // 1. Call server-side Postgres / Supabase auth endpoint
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { user: null, error: data.error || 'Registration failed. Please check your details.' };
    }

    const profile: UserProfile = {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.full_name,
      city: data.user.city,
      area: data.user.area,
      phone: data.user.phone,
      created_at: data.user.created_at,
    };

    saveLocalUser(profile);
    return { user: profile, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Connection error during registration.' };
  }
}

export async function signInUser(
  email: string,
  pass: string
): Promise<{ user: UserProfile | null; error: string | null }> {
  try {
    // 1. Call server-side Postgres / Supabase login endpoint
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { user: null, error: data.error || 'Email or password is incorrect. Please try again.' };
    }

    const profile: UserProfile = {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.full_name,
      city: data.user.city,
      area: data.user.area,
      phone: data.user.phone,
      created_at: data.user.created_at,
    };

    saveLocalUser(profile);
    return { user: profile, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Connection error during login.' };
  }
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
  const cached = getLocalUser();
  if (cached?.id) {
    try {
      const res = await fetch(`/api/auth/me?userId=${cached.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          saveLocalUser(data.user);
          return data.user;
        }
      }
    } catch (e) {
      // Fallback to local session on temporary network hitch
    }
  }
  return cached;
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

  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: current.id,
        ...data,
      }),
    });
    if (res.ok) {
      const respData = await res.json();
      if (respData.success && respData.user) {
        saveLocalUser(respData.user);
        return respData.user;
      }
    }
  } catch (e) {
    console.error('Update profile error:', e);
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
        const res = await fetch('/api/upload-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
            filename: file.name,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.url) {
            return resolve(data.url);
          }
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

    const res = await fetch(`/api/issues?${params.toString()}`);
    if (res.ok) {
      const body = await res.json();
      if (body.success && Array.isArray(body.data)) {
        if (body.data.length > 0) {
          saveLocalIssues(body.data);
          return body.data;
        }
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
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const body = await res.json();
      if (body.success && body.data) {
        const local = getLocalIssues();
        saveLocalIssues([body.data, ...local]);
        return body.data;
      }
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
    const res = await fetch(`/api/issues/${issueId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const body = await res.json();
      if (body.success) {
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
    const res = await fetch('/api/db-status');
    if (res.ok) {
      return await res.json();
    }
    return { connected: false, error: 'Could not contact database server' };
  } catch (e: any) {
    return { connected: false, error: e.message };
  }
}
