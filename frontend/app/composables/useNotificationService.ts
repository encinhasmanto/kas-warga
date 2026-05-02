import type { Database } from '~/types/database';

export interface AppNotification {
  id: string;
  original_id: string;
  type: 'bulletin' | 'expense' | 'payment';
  date: string;
  isNew: boolean;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export const useNotificationService = () => {
  const supabase = useSupabaseClient<Database>();
  const authStore = useAuthStore();
  
  let activeChannel: any = null;

  /**
   * Normalizes rows into a standard Notification object.
   */
  function normalizeNotification(row: any, type: 'bulletin' | 'expense' | 'payment'): AppNotification {
    let notif: any = {
      id: `${type}_${row.id}`,
      original_id: row.id,
      type: type,
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

    return notif as AppNotification;
  }

  /**
   * Fetch recent notifications to build initial feed
   */
  async function fetchInitialNotifications() {
    const isAdmin = authStore.isAdmin || authStore.isSuperAdmin;
    const unitId = authStore.currentUser?.id;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - 7);
    const isoLimit = dateLimit.toISOString();

    let allNotifs: AppNotification[] = [];

    try {
      // Bulletins
      let bQuery = supabase.from('bulletins').select('*').gte('created_at', isoLimit);
      if (!isAdmin) bQuery = bQuery.eq('is_published', true);
      const { data: bData } = await bQuery;
      if (bData) allNotifs.push(...bData.map(b => normalizeNotification(b, 'bulletin')));

      if (isAdmin) {
        // Transactions
        const { data: tData } = await supabase.from('transactions').select('*').gte('transaction_date', isoLimit);
        if (tData) allNotifs.push(...tData.map(t => normalizeNotification(t, 'expense')));
        
        // Payments
        const { data: pData } = await supabase.from('payment_transactions').select('*').gte('created_at', isoLimit);
        if (pData) allNotifs.push(...pData.map(p => normalizeNotification(p, 'payment')));
      } else if (unitId) {
        // Resident payments
        const { data: pData } = await supabase.from('payment_transactions').select('*').eq('unit_id', unitId).gte('created_at', isoLimit);
        if (pData) allNotifs.push(...pData.map(p => normalizeNotification(p, 'payment')));
      }

      allNotifs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { success: true, data: allNotifs.slice(0, 20) };
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Subscribe to realtime updates
   */
  function subscribeToRealtimeNotifications(onNewEvent: (notif: AppNotification) => void) {
    const isAdmin = authStore.isAdmin || authStore.isSuperAdmin;
    const unitId = authStore.currentUser?.id;

    if (activeChannel) supabase.removeChannel(activeChannel);

    activeChannel = supabase.channel('notification-feed');

    activeChannel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bulletins' }, (payload: any) => {
      if (!isAdmin && !payload.new.is_published) return;
      onNewEvent(normalizeNotification(payload.new, 'bulletin'));
    });

    if (isAdmin) {
      activeChannel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'transactions' }, (payload: any) => {
        onNewEvent(normalizeNotification(payload.new, 'expense'));
      });
    }

    activeChannel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'payment_transactions' }, (payload: any) => {
      if (isAdmin || payload.new.unit_id === unitId) {
        onNewEvent(normalizeNotification(payload.new, 'payment'));
      }
    });

    activeChannel.subscribe();

    return () => {
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
        activeChannel = null;
      }
    };
  }

  return {
    fetchInitialNotifications,
    subscribeToRealtimeNotifications
  };
};
