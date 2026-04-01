// import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import { supabase } from "./src/services/supabaseClient.js";

async function run() {
  const { data: t } = await supabase.from('transactions').select('amount, description, type');
  if (t) {
    const total = t.reduce((sum, p) => sum + (p.amount || 0), 0);
    const iplLike = t.filter(p => p.description && (p.description.includes('IPL') || p.description.includes('THR')));
    const iplTotal = iplLike.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    console.log('Total general transactions:', t.length);
    console.log('Total Amount (All):', total);
    console.log('IPL-like search in transactions:', iplLike.length, 'entries, total:', iplTotal);
    
    const first5 = iplLike.slice(0, 5);
    console.log('Sample IPL in transactions:', first5);
  }
}

run();
