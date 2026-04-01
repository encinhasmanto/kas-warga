import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const uId = 'c2409c1e-2a55-483e-b963-352d9247d172'; // R1
  const { data, error } = await supabase
    .from('payment_transactions')
    .select('*, event:payment_events(display_name, key)')
    .eq('unit_id', uId);
    
  console.log('R1 Data:', data);
  console.log('Error if any:', error);
}

run();
