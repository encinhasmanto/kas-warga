/**
 * Supabase Client Configuration
 * Centralized client for all services
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Session management
let currentSession = null;

/**
 * Sync session from storage or manual set
 */
function syncSession() {
  if (!currentSession) {
    const saved = sessionStorage.getItem('dw_session');
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
