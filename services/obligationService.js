/**
 * Payment Obligations Service
 * Handles generation and management of payment obligations for units
 */

import { supabase, getCurrentSession } from "./supabaseClient.js";

/**
 * Create obligation for a unit based on a payment event
 * @param {Object} obligationData
 *   - event_id: payment event ID
 *   - unit_id: unit ID (or unit_code for easier lookup)
 *   - amount: obligation amount
 *   - due_date: due date for this obligation
 * @returns {Promise<Object>} { success: boolean, data: obligation, error: string }
 */
export async function createObligation(obligationData) {
  try {
    const session = getCurrentSession();

    // Verify admin access
    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can create obligations",
      };
    }

    // If unit_code is provided, get unit_id
    let unitId = obligationData.unit_id;
    if (!unitId && obligationData.unit_code) {
      const { data: unit, error: unitErr } = await supabase
        .from("units")
        .select("id")
        .eq("code", obligationData.unit_code)
        .single();

      if (unitErr || !unit) {
        return {
          success: false,
          error: "Unit not found",
        };
      }
      unitId = unit.id;
    }

    const newObligation = {
      event_id: obligationData.event_id,
      unit_id: unitId,
      amount: obligationData.amount,
      due_date: obligationData.due_date,
      status: "pending", // pending, paid, overdue
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("payment_obligations")
      .insert([newObligation])
      .select();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log("✅ Obligation created for unit");
    return {
      success: true,
      data: data[0],
    };
  } catch (err) {
    console.error("❌ Error creating obligation:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Generate obligations for all units based on a payment event
 * @param {string} eventId - Payment event ID
 * @returns {Promise<Object>} { success: boolean, created: number, error: string }
 */
export async function generateObligationsForEvent(eventId) {
  try {
    const session = getCurrentSession();

    // Verify admin access
    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can generate obligations",
      };
    }

    // Get event details
    const { data: event, error: eventErr } = await supabase
      .from("payment_events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (eventErr || !event) {
      return {
        success: false,
        error: "Event not found",
      };
    }

    // Get all active units
    const { data: units, error: unitsErr } = await supabase
      .from("units")
      .select("id, code, category")
      .eq("is_active", true);

    if (unitsErr || !units) {
      return {
        success: false,
        error: "Could not fetch units",
      };
    }

    // Create obligations for each unit
    const obligations = units.map((unit) => ({
      event_id: eventId,
      unit_id: unit.id,
      amount: event.amount,
      due_date: event.due_date,
      status: "pending",
      created_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("payment_obligations")
      .insert(obligations)
      .select();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(
      `✅ Generated ${data.length} obligations for event: ${event.name}`,
    );
    return {
      success: true,
      created: data.length,
    };
  } catch (err) {
    console.error("❌ Error generating obligations:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get obligations for a unit
 * @param {string} unitId - Unit ID
 * @param {Object} filters - Optional filters
 *   - status: filter by status (pending, paid, overdue)
 *   - year: filter by year from event
 * @returns {Promise<Object>} { success: boolean, data: obligations, error: string }
 */
export async function getUnitObligations(unitId, filters = {}) {
  try {
    let query = supabase
      .from("payment_obligations")
      .select(
        `
        *,
        event:payment_events(*)
      `,
      )
      .eq("unit_id", unitId)
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Filter by year if provided
    let filtered = data;
    if (filters.year) {
      filtered = data.filter((o) => o.event && o.event.year === filters.year);
    }

    return {
      success: true,
      data: filtered,
    };
  } catch (err) {
    console.error("❌ Error fetching obligations:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get all pending obligations
 * @returns {Promise<Object>} { success: boolean, data: obligations, error: string }
 */
export async function getAllPendingObligations() {
  try {
    const { data, error } = await supabase
      .from("payment_obligations")
      .select(
        `
        *,
        unit:units(code, display_name, category),
        event:payment_events(name, event_type, year, month, due_date)
      `,
      )
      .eq("status", "pending")
      .order("due_date", { ascending: true });

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
    console.error("❌ Error fetching pending obligations:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Update obligation status
 * @param {string} obligationId - Obligation ID
 * @param {string} newStatus - New status (pending, paid, overdue)
 * @returns {Promise<Object>} { success: boolean, error: string }
 */
export async function updateObligationStatus(obligationId, newStatus) {
  try {
    const { error } = await supabase
      .from("payment_obligations")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", obligationId);

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    console.log(`✅ Obligation status updated to: ${newStatus}`);
    return { success: true };
  } catch (err) {
    console.error("❌ Error updating obligation:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Calculate total obligations for unit
 * @param {string} unitId - Unit ID
 * @param {Object} filters - Optional filters
 * @returns {Promise<Object>} { success: boolean, total: number, count: number, error: string }
 */
export async function calculateUnitObligations(unitId, filters = {}) {
  try {
    const result = await getUnitObligations(unitId, filters);

    if (!result.success) {
      return result;
    }

    const obligations = result.data;
    const total = obligations.reduce((sum, o) => sum + o.amount, 0);

    return {
      success: true,
      total,
      count: obligations.length,
      obligations,
    };
  } catch (err) {
    console.error("❌ Error calculating obligations:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}
