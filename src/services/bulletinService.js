/**
 * Bulletin Service
 * Handles CRUD operations for community announcements and bulletins
 */

import { supabase, getCurrentSession } from "./supabaseClient.js";
import { auditService } from "./auditService.js";

/**
 * Helper to normalize and check roles
 * Ensures 'Super Admin', 'super_admin', and 'admin' all work correctly.
 */
const hasAdminPrivileges = (session) => {
  if (!session || !session.type) return false;
  const role = session.type.toLowerCase().replace(/[\s_]/g, ''); // cleans 'super_admin' or 'super admin' to 'superadmin'
  return role === 'admin' || role === 'superadmin';
};

/**
 * Upload an image file to Supabase Storage (bulletin-assets bucket)
 */
export async function uploadBulletinImage(file) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `bulletins/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("bulletin-assets")
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from("bulletin-assets")
    .getPublicUrl(filePath);

  return data.publicUrl;
}

/**
 * Get all available bulletins
 */
export async function getBulletins(options = {}) {
  try {
    let query = supabase
      .from("bulletins")
      .select("id, title, category, content, content_url, is_published, created_at")
      .order("created_at", { ascending: false });

    query = query.eq("is_published", true);

    const limit = options.limit || 50;
    const offset = options.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error("❌ Error fetching bulletins:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Create a new bulletin (Admin only)
 */
export async function createBulletin(payload) {
  try {
    const session = getCurrentSession();
    
    // Normalize the role to 'admin' or 'superadmin' (removes spaces and underscores)
    const role = (session.type || "").toLowerCase().replace(/[\s_]/g, '');
    const isAuthorized = ['admin', 'superadmin'].includes(role);

    if (!isAuthorized) {
      throw new Error(`Unauthorized: Role '${session.type}' is not an Admin.`);
    }

    const { data, error } = await supabase
      .from("bulletins")
      .insert([
        {
          title: payload.title,
          content: payload.content,
          category: payload.category || "General",
          is_published: payload.is_published !== false,
          content_url: payload.content_url || null,
          author_id: session.id // This now matches public.admins(id)
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Log action (won't crash if audit fails)
    auditService.logAction('CREATE_BULLETIN', { id: data.id }).catch(e => console.warn("Audit failed:", e.message));

    return { success: true, data };
  } catch (err) {
    console.error("❌ Bulletin Service Error:", err.message);
    return { success: false, error: err.message };
  }
}
/**
 * Update an existing bulletin (Admin only)
 */
export async function updateBulletin(id, updates) {
  try {
    const session = getCurrentSession();
    if (!hasAdminPrivileges(session)) {
      throw new Error("Unauthorized: Only Admins can update bulletins.");
    }

    const { data, error } = await supabase
      .from("bulletins")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await auditService.logAction('UPDATE_BULLETIN', { type: 'bulletins', id: id });

    return { success: true, data };
  } catch (err) {
    console.error("❌ Error updating bulletin:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a bulletin (Admin only)
 */
export async function deleteBulletin(id) {
  try {
    const session = getCurrentSession();
    if (!hasAdminPrivileges(session)) {
      throw new Error("Unauthorized: Only Admins can delete bulletins.");
    }

    const { error } = await supabase.from("bulletins").delete().eq("id", id);
    if (error) throw error;

    await auditService.logAction('DELETE_BULLETIN', { type: 'bulletins', id: id });

    return { success: true };
  } catch (err) {
    console.error("❌ Error deleting bulletin:", err);
    return { success: false, error: err.message };
  }
}

export const bulletinService = {
  /**
   * Fetch all bulletins (or filter by is_published boolean)
   */
  async getBulletins(isPublished = null) {
    let query = supabase
      .from('bulletins')
      .select('*')
      .order('created_at', { ascending: false });

    // If a specific boolean is passed, filter by it
    if (isPublished !== null) {
      query = query.eq('is_published', isPublished);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  /**
   * Save a bulletin (Creates if no ID, Updates if ID exists)
   * Handles both draft saves and publishes
   */
  async saveBulletin(bulletinData) {
    const isUpdate = !!bulletinData.id;
    
    const payload = {
      title: bulletinData.title,
      content: bulletinData.content,
      is_published: bulletinData.is_published || false,
      category: bulletinData.category || 'General',
      content_url: bulletinData.content_url || null,
    };

    if (isUpdate) {
      const { data, error } = await supabase
        .from('bulletins')
        .update(payload)
        .eq('id', bulletinData.id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } else {
      // For new bulletins, include author_id from the current session
      const session = getCurrentSession();
      const insertPayload = { ...payload };
      if (session?.id) {
        insertPayload.author_id = session.id;
      }

      const { data, error } = await supabase
        .from('bulletins')
        .insert([insertPayload])
        .select()
        .single();
        
      if (error) throw error;
      return data;
    }
  },

  async deleteBulletin(id) {
    const { error } = await supabase.from('bulletins').delete().eq('id', id);
    if (error) throw error;
    return true;
  }
};