/**
 * Payment Events Service
 * Handles payment event creation, retrieval, and management
 */

import { supabase, getCurrentSession } from "./supabaseClient.js";

/**
 * Create a new payment event
 * Only admins can create events
 * @param {Object} eventData - Event details
 *   - name: event name (e.g., "Iuran IPL Januari 2025")
 *   - event_type: type of event (e.g., "IPL", "THR", "Iuran Lain")
 *   - description: event description
 *   - amount: amount for this event
 *   - month: month number (1-12)
 *   - year: year (2025)
 *   - due_date: deadline for payment (ISO string)
 * @returns {Promise<Object>} { success: boolean, data: eventData, error: string }
 */
export async function createPaymentEvent(eventData) {
  try {
    const session = getCurrentSession();

    // Verify admin access
    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can create payment events",
      };
    }

    const newEvent = {
      name: eventData.name,
      event_type: eventData.event_type, // "IPL", "THR", "Iuran_Lain"
      description: eventData.description,
      amount: eventData.amount,
      month: eventData.month,
      year: eventData.year,
      due_date: eventData.due_date,
      created_by: session.id,
      created_at: new Date().toISOString(),
      is_active: true,
    };

    const { data, error } = await supabase
      .from("payment_events")
      .insert([newEvent])
      .select();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Payment event created:", data[0].name);
    return {
      success: true,
      data: data[0],
    };
  } catch (err) {
    console.error("❌ Error creating payment event:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get all active payment events
 * @param {Object} filters - Optional filters
 *   - eventType: filter by event type (e.g., "IPL")
 *   - year: filter by year
 * @returns {Promise<Object>} { success: boolean, data: events, error: string }
 */
export async function getPaymentEvents(filters = {}) {
  try {
    let query = supabase
      .from("payment_events")
      .select("*")
      .eq("is_active", true)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (filters.eventType) {
      query = query.eq("event_type", filters.eventType);
    }

    if (filters.year) {
      query = query.eq("year", filters.year);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (err) {
    console.error("❌ Error fetching payment events:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get payment event by ID
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} { success: boolean, data: event, error: string }
 */
export async function getPaymentEventById(eventId) {
  try {
    const { data, error } = await supabase
      .from("payment_events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (err) {
    console.error("❌ Error fetching payment event:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Update payment event
 * @param {string} eventId - Event ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} { success: boolean, data: updated event, error: string }
 */
export async function updatePaymentEvent(eventId, updates) {
  try {
    const session = getCurrentSession();

    // Verify admin access
    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can update payment events",
      };
    }

    const { data, error } = await supabase
      .from("payment_events")
      .update(updates)
      .eq("id", eventId)
      .select();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Payment event updated");
    return {
      success: true,
      data: data[0],
    };
  } catch (err) {
    console.error("❌ Error updating payment event:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Deactivate payment event
 * @param {string} eventId - Event ID
 * @returns {Promise<Object>} { success: boolean, error: string }
 */
export async function deactivatePaymentEvent(eventId) {
  try {
    const session = getCurrentSession();

    // Verify admin access
    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can deactivate events",
      };
    }

    const { error } = await supabase
      .from("payment_events")
      .update({ is_active: false })
      .eq("id", eventId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Payment event deactivated");
    return { success: true };
  } catch (err) {
    console.error("❌ Error deactivating payment event:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}
