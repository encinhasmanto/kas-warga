import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const { data, error } = await supabase.from('payment_transactions').select('*').limit(5);
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Sample Data:', JSON.stringify(data, null, 2));
  
  const { data: events } = await supabase.from('payment_events').select('*');
  console.log('Events:', JSON.stringify(events, null, 2));
}

run();
