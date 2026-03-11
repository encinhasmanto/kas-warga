/**
 * Payment Service
 * Handles recording resident payments and computing payment status
 */

import { supabase, getCurrentSession } from "./supabaseClient.js";

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

    // Create payment transaction record
    const newTransaction = {
      obligation_id: paymentData.obligation_id,
      unit_id: obligation.unit_id,
      admin_id: session.type === "admin" ? session.id : null,
      amount: paymentData.amount,
      payment_date: paymentData.payment_date || new Date().toISOString(),
      payment_method: paymentData.payment_method || "cash",
      notes: paymentData.notes,
      status: "completed",
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("payment_transactions")
      .insert([newTransaction])
      .select();

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Update obligation status if fully paid
    const totalPaid = await getTotalPaidForObligation(
      paymentData.obligation_id,
    );
    if (totalPaid >= obligation.amount) {
      await supabase
        .from("payment_obligations")
        .update({ status: "paid" })
        .eq("id", paymentData.obligation_id);
    }

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
 * Get total paid amount for an obligation
 * @param {string} obligationId - Obligation ID
 * @returns {Promise<number>} Total amount paid
 */
export async function getTotalPaidForObligation(obligationId) {
  try {
    const { data, error } = await supabase
      .from("payment_transactions")
      .select("amount")
      .eq("obligation_id", obligationId);

    if (error) {
      console.error("Error calculating total paid:", error);
      return 0;
    }

    return data.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  } catch (err) {
    console.error("❌ Error getting total paid:", err);
    return 0;
  }
}

/**
 * Get payment status computed from payment_transactions vs payment_obligations
 * @param {string} unitId - Unit ID
 * @returns {Promise<Object>} { success: boolean, data: paymentStatus, error: string }
 */
export async function getUnitPaymentStatus(unitId) {
  try {
    // Get all obligations for the unit
    const { data: obligations, error: oblErr } = await supabase
      .from("payment_obligations")
      .select("id, amount, status, event:payment_events(name, year, month)")
      .eq("unit_id", unitId);

    if (oblErr) {
      return {
        success: false,
        error: oblErr.message,
      };
    }

    // For each obligation, get total paid amount
    const paymentStatus = [];
    for (const obl of obligations) {
      const { data: payments, error: payErr } = await supabase
        .from("payment_transactions")
        .select("amount")
        .eq("obligation_id", obl.id);

      if (payErr) {
        console.error("Error fetching payments:", payErr);
        continue;
      }

      const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const remaining = Math.max(0, obl.amount - totalPaid);

      paymentStatus.push({
        obligation_id: obl.id,
        event_name: obl.event?.name,
        year: obl.event?.year,
        month: obl.event?.month,
        amount_due: obl.amount,
        amount_paid: totalPaid,
        amount_remaining: remaining,
        status: obl.status || (remaining === 0 ? "paid" : "pending"),
        payment_percentage: Math.round((totalPaid / obl.amount) * 100),
      });
    }

    // Calculate summary
    const totalDue = paymentStatus.reduce((sum, p) => sum + p.amount_due, 0);
    const totalPaid = paymentStatus.reduce((sum, p) => sum + p.amount_paid, 0);

    return {
      success: true,
      data: {
        unit_id: unitId,
        total_obligations: paymentStatus.length,
        total_due: totalDue,
        total_paid: totalPaid,
        total_remaining: totalDue - totalPaid,
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
      .select(
        `
        *,
        obligation:payment_obligations(
          amount,
          event:payment_events(name, year, month)
        )
      `,
      )
      .eq("unit_id", unitId)
      .order("payment_date", { ascending: false });

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
    console.error("❌ Error fetching unit payments:", err);
    return {
      success: false,
      error: err.message,
    };
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
        unit:units(code, display_name, category),
        obligation:payment_obligations(amount, event:payment_events(name, year))
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
