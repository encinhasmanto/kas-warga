/**
 * Bulletin Service
 * Handles CRUD operations for community announcements and bulletins
 */

import { supabase, getCurrentSession } from './supabaseClient.js';

/**
 * Get all available bulletins (for both Residents and Admins)
 * @param {Object} options Options for fetching e.g { limit: 10 }
 * @returns {Promise<Object>} { success: boolean, data: bulletins, error: string }
 */
export async function getBulletins(options = {}) {
  try {
    let query = supabase
      .from('bulletins')
      .select(`
        *,
        author:auth.users(id, email)
      `)
      .order('created_at', { ascending: false });

    // Filter out unpublished for non-admins if desired, 
    // but the SQL RLS simplifies it mostly.
    query = query.eq('is_published', true);

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error('❌ Error fetching bulletins:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Create a new bulletin (Admin only)
 * @param {Object} payload { title, content, category, is_published, image_url }
 * @returns {Promise<Object>} { success, data, error }
 */
export async function createBulletin(payload) {
  try {
    const session = getCurrentSession();
    if (session.type !== 'admin' && session.type !== 'superadmin') {
      throw new Error("Unauthorized: Only Admins can create bulletins.");
    }

    // Rely on Supabase matching the author_id to the authenticated token
    // so we don't strictly need to inject it, but we can from the session if needed.

    const { data, error } = await supabase
      .from('bulletins')
      .insert([{
        title: payload.title,
        content: payload.content,
        category: payload.category || 'General',
        is_published: payload.is_published !== false,
        image_url: payload.image_url || null,
        author_id: session.id
      }])
      .select()
      .single();

    if (error) throw error;
    
    return { success: true, data };
  } catch (err) {
    console.error('❌ Error creating bulletin:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Update an existing bulletin (Admin only)
 * @param {string} id Bulletin ID
 * @param {Object} updates { title, content, category, is_published, image_url }
 * @returns {Promise<Object>}
 */
export async function updateBulletin(id, updates) {
  try {
    const session = getCurrentSession();
    if (session.type !== 'admin' && session.type !== 'superadmin') {
      throw new Error("Unauthorized: Only Admins can update bulletins.");
    }

    // append updated_at timestamp
    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('bulletins')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error('❌ Error updating bulletin:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Delete a bulletin (Admin only)
 * @param {string} id Bulletin ID
 * @returns {Promise<Object>}
 */
export async function deleteBulletin(id) {
  try {
    const session = getCurrentSession();
    if (session.type !== 'admin' && session.type !== 'superadmin') {
      throw new Error("Unauthorized: Only Admins can delete bulletins.");
    }

    const { error } = await supabase
      .from('bulletins')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (err) {
    console.error('❌ Error deleting bulletin:', err);
    return { success: false, error: err.message };
  }
}
