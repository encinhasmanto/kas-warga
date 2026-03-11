/**
 * Authentication Service
 * Handles resident and admin login with unit_code/PIN or username/PIN
 */

import {
  supabase,
  setCurrentSession,
  getCurrentSession,
} from "./supabaseClient.js";

/**
 * Authenticate resident with unit_code and PIN
 * @param {string} unitCode - Resident's unit code (e.g., "R1", "A3", "B5")
 * @param {string} pin - Resident's PIN
 * @returns {Promise<Object>} { success: boolean, data: unitData, error: string }
 */
export async function authenticateResident(unitCode, pin) {
  try {
    // Query units table for matching unit and PIN
    const { data, error } = await supabase
      .from("units")
      .select("id, code, display_name, category, resident_name")
      .eq("code", unitCode)
      .eq("pin", pin)
      .single();

    if (error) {
      return {
        success: false,
        error: "Invalid unit code or PIN",
      };
    }

    // Set current session
    setCurrentSession({
      type: "resident",
      id: data.id,
      unitCode: data.code,
      displayName: data.display_name,
      category: data.category,
    });

    console.log("✅ Resident authenticated:", data.code);
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("❌ Authentication error:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Authenticate admin with username and PIN
 * @param {string} username - Admin username
 * @param {string} pin - Admin PIN
 * @returns {Promise<Object>} { success: boolean, data: adminData, error: string }
 */
export async function authenticateAdmin(username, pin) {
  try {
    // Query admins table for matching username and PIN
    const { data, error } = await supabase
      .from("admins")
      .select("id, username, role, created_at")
      .eq("username", username)
      .eq("pin", pin)
      .single();

    if (error) {
      return {
        success: false,
        error: "Invalid username or PIN",
      };
    }

    // Set current session
    setCurrentSession({
      type: "admin",
      id: data.id,
      username: data.username,
      role: data.role,
    });

    console.log("✅ Admin authenticated:", data.username);
    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("❌ Admin authentication error:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Verify current session is valid
 * Used for checking if user is still logged in
 * @returns {boolean}
 */
export function verifySession() {
  const session = getCurrentSession();
  return session && session.type !== null && session.id !== null;
}

/**
 * Logout current user
 */
export function logout() {
  setCurrentSession({ type: null, id: null, unitCode: null, username: null });
  console.log("✅ User logged out");
}

/**
 * Get current authenticated user info
 * @returns {Object} Current session data
 */
export function getCurrentUser() {
  return getCurrentSession();
}
