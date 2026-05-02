/**
 * Payment Service
 * Handles recording resident payments and computing payment status
 */

import { supabase, getCurrentSession } from "@/services/supabaseClient.js";

/**
 * Record a payment from a resident
 * @param {Object} paymentData
 *   - obligation_id: the specific obligation being paid
 *   - amount: payment amount
 *   - payment_date: date of payment (ISO string)
 *   - payment_method: method used (e.g., "cash", "transfer", "check")
 *   - notes: optional payment notes
 * @returns {Promise<Object>} { success: boolean, data: transaction, error: string }
 */
export async function recordPayment(paymentData) {
  try {
    const session = getCurrentSession();

    // Get the obligation to find the unit
    const { data: obligation, error: oblErr } = await supabase
      .from("payment_obligations")
      .select("*")
      .eq("id", paymentData.obligation_id)
      .single();

    if (oblErr || !obligation) {
      return {
        success: false,
        error: "Obligation not found",
      };
    }

    // 2. Update obligation status (Always mark as true since DompetWarga accepts exact full monthly payments)
    const { data: updated, error: obStatusErr } = await supabase
      .from("payment_obligations")
      .update({ status: true })
      .eq("id", paymentData.obligation_id)
      .select();

    if (obStatusErr) {
      console.error("❌ Could not mark obligation as paid:", obStatusErr);
      return { success: false, error: obStatusErr.message };
    }

    console.log("✅ Payment status updated in tracker");
    return {
      success: true,
      data: updated?.[0],
    };

    console.log("✅ Payment recorded successfully");
    return {
      success: true,
      data: data[0],
    };
  } catch (err) {
    console.error("❌ Error recording payment:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get payment status computed from payment_transactions vs payment_obligations
 * @param {string} unitId - Unit ID
 * @returns {Promise<Object>} { success: boolean, data: paymentStatus, error: string }
 */
export async function getUnitPaymentStatus(unitId) {
  try {
    // Get all obligations for the unit, including the unit category for fallback pricing
    const { data: obligations, error: oblErr } = await supabase
      .from("payment_obligations")
      .select(`
        id, 
        amount, 
        status, 
        year, 
        month_index, 
        event_id, 
        unit_id,
        event:payment_events(id, display_name, key),
        unit:units(category)
      `)
      .eq("unit_id", unitId);

    if (oblErr) {
      return {
        success: false,
        error: oblErr.message,
      };
    }

    // For each obligation, determine status and paid amount
    const paymentStatus = obligations.map((obl) => {
      const isPaid = obl.status === true;
      
      // Fallback logic: if amount is NULL in DB, use standard category rates
      let baseAmount = obl.amount;
      if (baseAmount === null || baseAmount === 0) {
        const category = obl.unit?.category || 'Rumah';
        baseAmount = category === 'Ruko' ? 250000 : 170000;
      }
      
      const totalPaid = isPaid ? baseAmount : 0;
      const remaining = isPaid ? 0 : baseAmount;

      return {
        obligation_id: obl.id,
        event_id: obl.event_id || obl.event?.id,
        event_key: obl.event?.key,
        event_name: obl.event?.display_name || obl.event?.key || 'Payment',
        year: obl.year,
        month: obl.month_index,
        amount_due: baseAmount,
        amount_paid: totalPaid,
        amount_remaining: remaining,
        status: isPaid,
        payment_percentage: isPaid ? 100 : 0,
      };
    });

    // Calculate summary
    const totalDue = paymentStatus.reduce((sum, p) => sum + p.amount_due, 0);
    const totalPaid = paymentStatus.reduce((sum, p) => sum + p.amount_paid, 0);

    // Calculate "Next Due" = Overdue + Current Month only
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    const currentDueTotal = paymentStatus
      .filter((p) => {
        if (p.status) return false; // Skip paid
        // Include if year is in the past OR (same year and month is past or current)
        return (p.year < currentYear) || (p.year === currentYear && (p.month <= currentMonth || !p.month));
      })
      .reduce((sum, p) => sum + p.amount_remaining, 0);

    return {
      success: true,
      data: {
        unit_id: unitId,
        total_obligations: paymentStatus.length,
        total_due: totalDue,
        total_paid: totalPaid,
        total_remaining: totalDue - totalPaid,
        current_due_total: currentDueTotal, // NEW: Monthly Due + Overdue only
        payment_percentage:
          totalDue > 0 ? Math.round((totalPaid / totalDue) * 100) : 0,
        obligations: paymentStatus,
      },
    };
  } catch (err) {
    console.error("❌ Error getting payment status:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}

/**
 * Get all payments for a unit
 * @param {string} unitId - Unit ID
 * @returns {Promise<Object>} { success: boolean, data: payments, error: string }
 */
export async function getUnitPayments(unitId) {
  try {
    const { data, error } = await supabase
      .from("payment_transactions")
      .select('*, event:payment_events(display_name, key)')
      .eq("unit_id", unitId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return { success: true, data: data || [] };
  } catch (err) {
    console.error("❌ Error fetching unit payments:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Update the due month for a specific event type globally for a given year
 * Used by Super Admins to schedule THR, etc.
 * @param {string} eventKey - 'thr', etc.
 * @param {number} year - Target year
 * @param {number} newMonthIndex - 1-12
 */
export async function updateEventObligations(eventKey, year, newMonthIndex) {
  try {
    // 1. Get the event ID
    const { data: event } = await supabase
      .from('payment_events')
      .select('id')
      .eq('key', eventKey)
      .single();
    
    if (!event) throw new Error("Event not found");

    // 2. Update all UNPAID obligations for this event/year
    const { data, error } = await supabase
      .from('payment_obligations')
      .update({ month_index: newMonthIndex })
      .eq('event_id', event.id)
      .eq('year', year)
      .eq('status', false); // Only shift future/unpaid ones

    if (error) throw error;

    return { success: true, data };
  } catch (err) {
    console.error("❌ Error updating event obligations:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Get unified history for a resident (Own payments + All global expenses - Corrections)
 * @param {string} unitId - Unit UUID
 * @param {string} unitCode - Unit Code (e.g. "B5")
 * @returns {Promise<Object>} { success: boolean, data: history, error: string }
 */
export async function getUnitFullHistory(unitId, unitCode) {
  try {
    // 1. Fetch IPL/THR payments from specific table
    const { data: pt, error: ptErr } = await supabase
      .from("payment_transactions")
      .select('*, event:payment_events(display_name, key)')
      .eq("unit_id", unitId);
    
    // 2. Fetch relevant transactions (Global Expenses OR Unit-specific Income)
    const { data: t, error: tErr } = await supabase
      .from("transactions")
      .select("*, category:transaction_categories(name)")
      .or(`type.eq.withdrawal,unit_id.eq.${unitId}`);

    if (ptErr || tErr) {
        return { success: false, error: ptErr?.message || tErr?.message };
    }

    // 3. Unify and Filter
    const unified = [
        // Include personal IPL/THR from specific table
        ...(pt || []).map(item => ({
            id: item.id,
            date: item.created_at,
            amount: item.amount,
            description: item.event?.display_name || item.event?.key || 'Payment',
            type: 'ipl_thr',
            category_name: item.event?.key === 'thr' ? 'THR Payment' : 'Monthly Payment',
            method: item.payment_method || 'Transfer',
            status: 'Completed'
        })),
        // Include personal other payments + ALL Global Expenses from main table
        ...(t || [])
          .filter(item => {
            const isCorrection = (item.category?.name || '').toLowerCase().includes('correction');
            if (isCorrection) return false; // HIDE corrections for residents
            
            if (item.type === "withdrawal") return true; // SHOW all community expenses

            // For Income (deposits), only show if it belongs to THIS unit
            return item.type === "deposit" && item.unit_id === unitId;
          })
          .map(item => {
            const desc = item.description || '';
            const isTHR = /THR/i.test(desc);
            const isIPL = /IPL/i.test(desc);
            
            let categoryName = item.category?.name || 'Social';
            if (item.type === 'deposit') {
               const isProject = /Iuran Lainnya/i.test(desc);
               if (isProject) {
                   // Extract project name from decription: "Iuran Lainnya - Tembok - Unit B5" -> "Tembok"
                   const projectNameRaw = desc
                     .replace(/Iuran Lainnya/gi, '')
                     .replace(/\s*-\s*Unit\s*\w+/gi, '')
                     .replace(/\s*-\s*\d+\b/g, '') // remove trailing standalone numbers
                     .replace(/\s*-\s*/g, ' ')
                     .trim();
                   categoryName = projectNameRaw ? `Sinking Fund` : 'Sinking Fund';
                   // Put project name in brackets for explicit labeling if found
                   if (projectNameRaw) categoryName = `Sinking Fund (${projectNameRaw})`;
               } else {
                   categoryName = isTHR ? 'THR Payment' : (isIPL ? 'Monthly Payment' : 'Sinking Fund');
               }
            }

            return {
                id: item.id,
                date: item.transaction_date || item.created_at,
                amount: item.amount,
                description: desc,
                type: item.type, // 'deposit' or 'withdrawal'
                category_name: categoryName,
                method: 'Transfer',
                status: 'Completed'
            };
          })
    ];

    // 4. Sort by date desc
    unified.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      success: true,
      data: unified.slice(0, 100)
    };
  } catch (err) {
    console.error("❌ Error fetching full history:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Get summary of all payments by admin
 * @returns {Promise<Object>} { success: boolean, data: summary, error: string }
 */
export async function getPaymentSummary() {
  try {
    const session = getCurrentSession();

    if (session.type !== "admin") {
      return {
        success: false,
        error: "Only admins can view payment summaries",
      };
    }

    const { data, error } = await supabase
      .from("payment_transactions")
      .select(
        `
        *,
        unit:units(code, name, category),
        obligation:payment_obligations(amount, year, month_index, event:payment_events(display_name, key))
      `,
      )
      .order("payment_date", { ascending: false });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Calculate totals
    const totalCollected = data.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    const paymentsByMethod = {};
    const paymentsByUnit = {};

    data.forEach((tx) => {
      // By method
      paymentsByMethod[tx.payment_method] =
        (paymentsByMethod[tx.payment_method] || 0) + tx.amount;

      // By unit
      const unitCode = tx.unit?.code || "unknown";
      paymentsByUnit[unitCode] = (paymentsByUnit[unitCode] || 0) + tx.amount;
    });

    return {
      success: true,
      data: {
        total_collected: totalCollected,
        total_transactions: data.length,
        payments_by_method: paymentsByMethod,
        payments_by_unit: paymentsByUnit,
        recent_payments: data.slice(0, 20),
      },
    };
  } catch (err) {
    console.error("❌ Error getting payment summary:", err);
    return {
      success: false,
      error: err.message,
    };
  }
}
