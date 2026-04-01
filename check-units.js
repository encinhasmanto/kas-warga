// import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import { supabase } from "./src/services/supabaseClient.js";

async function run() {
  const { data: pt } = await supabase.from('payment_transactions').select('unit_id').limit(10);
  console.log('Unique unit IDs in PT:', [...new Set(pt.map(p => p.unit_id))]);

  const { data: units } = await supabase.from('units').select('id, code').in('id', pt.map(p => p.unit_id));
  console.log('Units with data:', units);
}

run();
