/**
 * Profile Service
 * Handles user profile updates, including PIN and Photo uploads for both Residents and Admins
 */

import { supabase } from "./supabaseClient.js";
import { auditService } from "./auditService.js";

/**
 * Fetch profile data by ID and type
 * @param {string} id
 * @param {'resident'|'admin'} type
 */
export async function getProfileData(id, type) {
  try {
    const table = type === "admin" ? "admins" : "units";
    const select =
      type === "admin"
        ? "id, username, avatar_url"
        : "id, code, name, avatar_url";

    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq("id", id)
      .single();

    if (error) throw error;

    // Normalize names for UI
    if (type === "admin") {
      data.name = data.username;
      data.code = "ADMIN";
    }

    return { success: true, data };
  } catch (err) {
    console.error(`❌ Error fetching ${type} profile data:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Update unit PIN using RPC (Residents only)
 * @param {string} unitId
 * @param {string} oldPin
 * @param {string} newPin
 */
export async function updateUnitPin(unitId, oldPin, newPin) {
  try {
    const { data, error } = await supabase.rpc("update_units_pin", {
      p_units_id: unitId,
      p_old_pin: oldPin,
      p_new_pin: newPin,
    });

    if (error) throw error;

    if (data) {
      await auditService.logAction("CHANGE_PIN", { type: "units", id: unitId });
      return { success: true };
    } else {
      return { success: false, error: "Incorrect current PIN" };
    }
  } catch (err) {
    console.error("❌ Error updating PIN:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Upload profile photo to Supabase Storage with cleanup
 * @param {File} file
 * @param {string} id
 * @param {'resident'|'admin'} type
 */
export async function uploadAvatar(file, id, type) {
  try {
    const table = type === "admin" ? "admins" : "units";

    // 1. Get current avatar to delete it later
    const { data: current, error: fetchError } = await supabase
      .from(table)
      .select("avatar_url")
      .eq("id", id)
      .single();

    if (fetchError) throw fetchError;

    // 2. Prepare new file path
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}-${id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 3. Upload new file to 'avatar' bucket
    const { error: uploadError } = await supabase.storage
      .from("avatar")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // 4. Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("avatar").getPublicUrl(filePath);

    // 5. Update table with new URL
    const { error: updateError } = await supabase
      .from(table)
      .update({ avatar_url: publicUrl })
      .eq("id", id);

    if (updateError) throw updateError;

    // Log the audit action
    await auditService.logAction(
      "UPLOAD_AVATAR",
      { type: table, id: id },
      { filename: fileName },
    );

    // 6. Cleanup: Delete OLD file if it exists and is from our bucket
    if (current?.avatar_url && current.avatar_url.includes("/avatar/")) {
      try {
        const oldFileName = current.avatar_url.split("/").pop();
        if (oldFileName !== fileName) {
          await supabase.storage.from("avatar").remove([oldFileName]);
          console.log("♻️ Old avatar cleaned up:", oldFileName);
        }
      } catch (cleanupErr) {
        console.warn("⚠️ Cleanup failed (non-critical):", cleanupErr);
      }
    }

    return { success: true, publicUrl };
  } catch (err) {
    console.error("❌ Error uploading avatar:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Subscribe to profile changes for real-time updates
 * @param {'resident'|'admin'} type
 * @param {string} id
 * @param {Function} onUpdate
 */
export function subscribeToProfileChanges(type, id, onUpdate) {
  const table = type === "admin" ? "admins" : "units";

  // Create a unique channel identifier to prevent conflicts
  const channelName = `${table}-profile-changes-${id}-${Math.random().toString(36).substring(2, 9)}`;

  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: table,
        filter: `id=eq.${id}`,
      },
      (payload) => {
        console.log("🔄 Real-time profile update detected:", payload.new);
        onUpdate(payload.new);
      },
    )
    .subscribe();

  return channel;
}
