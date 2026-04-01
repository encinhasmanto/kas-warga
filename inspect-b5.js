// import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import { supabase } from "./src/services/supabaseClient.js";

async function run() {
  const { data: t } = await supabase.from('transactions').select('*').ilike('description', '%B5%');
  console.log('B5 Records from transactions table:');
  t.forEach(r => console.log(`- [${r.transaction_date}] ${r.amount}: ${r.description}`));
}

run();
