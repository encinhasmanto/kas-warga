import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  const uId = '5c252f66-4da0-427a-bb58-7065b089fe44'; // B5 UUID
  const { data: pt } = await supabase.from('payment_transactions').select('*').eq('unit_id', uId);
  console.log('B5 entries in payment_transactions:', pt.length);

  const { data: t } = await supabase.from('transactions').select('*').eq('user_id', uId);
  console.log('B5 entries in transactions (user_id):', t.length);

  // Maybe B5 is stored in description?
  const { data: t2 } = await supabase.from('transactions').select('*').ilike('description', '%B5%');
  console.log('B5 entries in transactions (description search):', t2.length);
}

run();
