// import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import { supabase } from "./src/services/supabaseClient.js";

async function run() {
  // 1. Find unit B5
  const { data: unit } = await supabase.from('units').select('id, code').eq('code', 'B5').single();
  console.log('Unit B5:', unit);

  if (unit) {
    // 2. Check transactions for this unit
    const { data: pt, error: ptErr } = await supabase
      .from('payment_transactions')
      .select('*, event:payment_events(*)')
      .eq('unit_id', unit.id);
    
    console.log('PT for B5:', pt ? pt.length : 0, 'records');
    if (pt && pt.length > 0) {
      console.log('First record sample:', JSON.stringify(pt[0], null, 2));
    } else if (ptErr) {
      console.error('PT Error:', ptErr);
    }
  }
}

run();
