/**
 * Supabase Client Configuration
 * Centralized client for all services
 */

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Session management
let currentSession = {
  type: null, // "resident" or "admin"
  id: null,
  unitCode: null, // for residents
  username: null, // for admins
};

export function setCurrentSession(session) {
  currentSession = session;
}

export function getCurrentSession() {
  return currentSession;
}

export function clearSession() {
  currentSession = { type: null, id: null, unitCode: null, username: null };
}
