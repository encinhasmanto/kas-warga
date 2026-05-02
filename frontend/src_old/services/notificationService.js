/**
 * Notification Service
 * Manages aggregated feeds from Bulletins, Transactions, and Payments
 * and handles Supabase Realtime subscriptions.
 */

import { supabase, getCurrentSession } from './supabaseClient.js';

/**
 * Normalizes different database rows into a standard Notification object.
 */
function normalizeNotification(row, type) {
  let notif = {
    id: `${type}_${row.id}`,
    original_id: row.id,
    type: type, // 'bulletin', 'expense', 'payment'
    date: row.created_at || row.transaction_date || row.payment_date || new Date().toISOString(),
    isNew: true
  };

  if (type === 'bulletin') {
    notif.title = 'New Bulletin: ' + row.title;
    notif.description = row.category || 'A new announcement has been posted.';
    notif.icon = 'newspaper';
    notif.color = 'text-primary bg-primary/10';
  } else if (type === 'expense') {
    notif.title = 'New Kas Activity';
    const amt = new Intl.NumberFormat('id-ID').format(Math.abs(row.amount));
    notif.description = row.type === 'deposit' 
      ? `Deposit recorded: Rp${amt}` 
      : `Expense recorded: Rp${amt} (${row.description || 'N/A'})`;
    notif.icon = row.type === 'deposit' ? 'south_west' : 'north_east';
    notif.color = row.type === 'deposit' ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10';
  } else if (type === 'payment') {
    notif.title = 'Payment Received';
    const amt = new Intl.NumberFormat('id-ID').format(row.amount);
    notif.description = `A payment of Rp${amt} was recorded.`;
    notif.icon = 'receipt_long';
    notif.color = 'text-emerald-500 bg-emerald-500/10';
  }

  return notif;
}

/**
 * Fetch the last 7 days of relevant data to build the initial feed list
 */
export async function fetchInitialNotifications() {
  const session = getCurrentSession();
  const isAdmin = session.type === 'admin' || session.type === 'superadmin';
  const unitId = session.id;

  let allNotifs = [];
  
  // 7 days ago limit for feed
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - 7);
  const isoLimit = dateLimit.toISOString();

  try {
    // 1. Fetch Bulletins (For everyone)
    let bQuery = supabase.from('bulletins').select('*').gte('created_at', isoLimit);
    if (!isAdmin) bQuery = bQuery.eq('is_published', true);
    
    const { data: bData, error: bErr } = await bQuery;
    if (bErr) console.error("Bulletin err:", bErr);
    if (bData) {
      allNotifs.push(...bData.map(b => normalizeNotification(b, 'bulletin')));
    }

    // 2. Fetch specific to roles
    if (isAdmin) {
      // Admins see all kas transactions
      const { data: tData, error: tErr } = await supabase.from('transactions').select('*').gte('transaction_date', isoLimit);
      if (tErr) console.error("Transactions err:", tErr);
      if (tData) {
        allNotifs.push(...tData.map(t => normalizeNotification(t, 'expense')));
      }
      // Admins see all payments globally
      const { data: pData, error: pErr } = await supabase.from('payment_transactions').select('*').gte('created_at', isoLimit);
      if (pErr) console.error("Payment err:", pErr);
      if (pData) {
        allNotifs.push(...pData.map(p => normalizeNotification(p, 'payment')));
      }
    } else {
      // Residents only see their own unit's payments
      if (unitId) {
        const { data: pData, error: pErr } = await supabase.from('payment_transactions').select('*').eq('unit_id', unitId).gte('created_at', isoLimit);
        if (pErr) console.error("Payment err:", pErr);
        if (pData) {
          allNotifs.push(...pData.map(p => normalizeNotification(p, 'payment')));
        }
      }
    }

    // Sort by newest first
    allNotifs.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Top 20 max to avoid clutter
    return { success: true, data: allNotifs.slice(0, 20) };
  } catch (error) {
    console.error("Error fetching initial notifications:", error);
    return { success: false, error: error.message };
  }
}

let activeChannel = null;

/**
 * Subscribe to realtime Postgres changes to instantly push pop-ups on screen.
 * NOTE: Ensure that 'Replication' is enabled on 'bulletins', 'transactions', and 'payment_transactions' in the Supabase Dashboard.
 */
export function subscribeToRealtimeNotifications(onNewEvent) {
  const session = getCurrentSession();
  const isAdmin = session.type === 'admin' || session.type === 'superadmin';
  const unitId = session.id;

  // Cleanup existing channel if re-subscribing
  if (activeChannel) {
    supabase.removeChannel(activeChannel);
  }

  activeChannel = supabase.channel('notification-feed');

  // Listen for new bulletins
  activeChannel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'bulletins' },
    (payload) => {
      // If resident, enforce is_published check
      if (!isAdmin && !payload.new.is_published) return;
      onNewEvent(normalizeNotification(payload.new, 'bulletin'));
    }
  );

  // Admins listen to kas transactions
  if (isAdmin) {
    activeChannel.on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'transactions' },
      (payload) => {
        onNewEvent(normalizeNotification(payload.new, 'expense'));
      }
    );
  }

  // Everyone listens to payment_transactions, but residents filter locally
  activeChannel.on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'payment_transactions' },
    (payload) => {
      if (isAdmin) {
        onNewEvent(normalizeNotification(payload.new, 'payment'));
      } else if (payload.new.unit_id === unitId) {
        onNewEvent(normalizeNotification(payload.new, 'payment'));
      }
    }
  );

  activeChannel.subscribe();

  return () => {
    supabase.removeChannel(activeChannel);
    activeChannel = null;
  };
}
