// import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import { supabase } from "@/services/supabaseClient.js";

async function run() {
  const currentYear = 2026;
  const { data: obligations, error: obErr } = await supabase
    .from('payment_obligations')
    .select('id, status, unit_id, month_index, year, event_id, event:payment_events(key)')
    .eq('year', currentYear);
    
  if (obErr) {
    console.error('Error fetching obligations:', obErr);
    return;
  }
  
  console.log(`Fetched ${obligations.length} obligations for 2026`);
  if (obligations.length > 0) {
    console.log('Sample obligation structure:', JSON.stringify(obligations[0], null, 2));
  }
}

run();
