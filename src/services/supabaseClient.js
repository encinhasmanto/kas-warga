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
  const saved = sessionStorage.getItem("dw_session");

  if (saved) {
    let parsed = null;
    try {
      parsed = JSON.parse(saved);
    } catch (err) {
      console.warn("Corrupted session storage, clearing dw_session", err);
      sessionStorage.removeItem("dw_session");
      parsed = null;
    }
    if (!parsed) return;
    // Normalize role/type for services, supporting both CamelCase and snake_case formats
    const isSuperAdmin =
      parsed.role === "Super Admin" || parsed.role === "super_admin";
    const isAdmin =
      parsed.role === "Admin" || parsed.role === "admin" || isSuperAdmin;
    currentSession = {
      type: isAdmin ? "admin" : "resident",
      id: parsed.id || parsed.unitId,
      unitCode: parsed.unitCode,
      username: parsed.username,
      displayName: parsed.displayName,
      role: parsed.role,
      avatarUrl: parsed.avatarUrl,
      isSuperAdmin: isSuperAdmin,
    };
  }
}

export function setCurrentSession(session) {
  currentSession = session;
}

export function getCurrentSession() {
  syncSession();
  if (!currentSession) {
    return { type: null, id: null, isSuperAdmin: false };
  }
  return currentSession;
}

export function clearSession() {
  currentSession = null;
  sessionStorage.removeItem("dw_session");
}
