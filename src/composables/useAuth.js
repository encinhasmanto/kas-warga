// /**
//  * useAuth composable
//  * Provides reactive session state and auth utilities throughout the app
//  */

import { ref, computed } from "vue";
import { supabase } from "@/services/supabaseClient.js"; // Using our new central supabase file

// 1. Global State
let initialSession = null;
try {
  initialSession = JSON.parse(sessionStorage.getItem("dw_session") || "null");
} catch (err) {
  console.warn("Invalid session payload, clearing local sessionStorage", err);
  sessionStorage.removeItem("dw_session");
  initialSession = null;
}
const session = ref(initialSession);
const user = ref(null);
const role = ref(session.value?.role || null);
const displayName = ref(session.value?.displayName || "User");
const unitCode = ref(session.value?.unitCode || null);
const avatarUrl = ref(session.value?.avatarUrl || null);
const unitId = ref(null);

export function useAuth() {
  // 2. Computed Properties (The missing pieces!)
  const isLoggedIn = computed(() => !!session.value);
  const isGuest = computed(() => session.value?.isGuest === true);
  const isSuperAdmin = computed(
    () => role.value === "Super Admin" || role.value === "super_admin",
  );
  const isAdmin = computed(
    () =>
      role.value === "Admin" || role.value === "admin" || isSuperAdmin.value,
  );
  const isResident = computed(
    () => role.value === "Resident" || role.value === "resident",
  );

  // 3. Methods
  async function fetchUnitId(code) {
    if (!code) return;
    const { data, error } = await supabase
      .from("units")
      .select("id")
      .eq("code", code)
      .single();

    if (data) unitId.value = data.id;
    if (error) console.warn("Supabase Fetch Error (Unit ID):", error.message);
  }

  function setSession(newSession) {
    if (!newSession) {
      logout();
      return;
    }
    session.value = newSession;
    role.value = newSession.role;
    displayName.value = newSession.displayName;
    unitCode.value = newSession.unitCode;
    avatarUrl.value = newSession.avatarUrl;

    fetchUnitId(newSession.unitCode);

    sessionStorage.setItem("dw_session", JSON.stringify(newSession));
  }

  function logout() {
    session.value = null;
    user.value = null;
    role.value = null;
    displayName.value = "User";
    unitCode.value = null;
    avatarUrl.value = null;
    unitId.value = null;
    sessionStorage.removeItem("dw_session");
    window.location.href = "/"; // Safe redirect to login
  }

  // 4. Return EVERYTHING (This fixes the router crash!)
  return {
    session,
    user,
    role,
    displayName,
    unitCode,
    avatarUrl,
    unitId,
    isLoggedIn,
    isGuest,
    isSuperAdmin,
    isAdmin,
    isResident,
    setSession,
    logout,
  };
}
