/**
 * Supabase Client Configuration
 * Centralized client for all services
 */

import { createClient } from "@supabase/supabase-js";

// Use Vite's environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Supabase credentials missing! Check your .env file.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Session management
let currentSession = null;

/**
 * Sync session from storage or manual set
 */
function syncSession() {
  if (!currentSession) {
    // const saved = sessionStorage.getItem('dw_session');
    supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // Logic to set your internal currentSession
      }
    });
    if (saved) {
      const parsed = JSON.parse(saved);
      // Normalize role/type for services
      currentSession = {
        type: (parsed.role === 'Admin' || parsed.role === 'Super Admin') ? 'admin' : 'resident',
        id: parsed.id || parsed.unitId,
        unitCode: parsed.unitCode,
        username: parsed.username,
        role: parsed.role,
        isSuperAdmin: parsed.role === 'Super Admin'
      };
    }
  }
}

export function setCurrentSession(session) {
  currentSession = session;
}

export function getCurrentSession() {
  syncSession();
  return currentSession || { type: null, id: null };
}

export function clearSession() {
  currentSession = null;
  sessionStorage.removeItem('dw_session');
}
