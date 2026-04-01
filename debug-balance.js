// import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import { supabase } from "./src/services/supabaseClient.js";

async function run() {
  const { data: pt } = await supabase.from('payment_transactions').select('amount, event:payment_events(key)');
  if (pt) {
    const total = pt.reduce((sum, p) => sum + (p.amount || 0), 0);
    const iplThrTotal = pt.filter(p => p.event && ['ipl', 'thr'].includes(p.event.key)).reduce((sum, p) => sum + (p.amount || 0), 0);
    console.log('Total Payment Transactions:', pt.length);
    console.log('Total Amount (All):', total);
    console.log('Total Amount (IPL/THR):', iplThrTotal);
    
    const missingEvent = pt.filter(p => !p.event);
    console.log('Transactions missing event link:', missingEvent.length);
    if (missingEvent.length > 0) {
        // Check event_id of missing ones
        const { data: raw } = await supabase.from('payment_transactions').select('event_id').is('event_id', null);
        console.log('Transactions with null event_id:', raw?.length);
    }
  }
}

run();
