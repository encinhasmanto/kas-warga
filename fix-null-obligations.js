// import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import { supabase } from "./src/services/supabaseClient.js";

async function fix() {
  console.log('--- Database Repair: Fixing NULL amounts in payment_obligations ---');
  
  // 1. Fetch obligations with null amounts
  const { data: obligations, error: oblErr } = await supabase
    .from('payment_obligations')
    .select('id, unit_id, unit:units(category)')
    .or('amount.is.null,amount.eq.0');
  
  if (oblErr) {
    console.error('❌ Error fetching obligations:', oblErr);
    return;
  }

  if (!obligations || obligations.length === 0) {
    console.log('✅ No records with NULL or 0 amount found. Database is healthy.');
    return;
  }

  console.log(`🔍 Found ${obligations.length} records to fix.`);

  let rukoCount = 0;
  let rumahCount = 0;
  let errorCount = 0;

  // 2. Perform updates in batches or individually
  for (const obl of obligations) {
    const category = obl.unit?.category || 'Rumah';
    const amount = category === 'Ruko' ? 250000 : 170000;
    
    const { error: updErr } = await supabase
      .from('payment_obligations')
      .update({ amount: amount })
      .eq('id', obl.id);
    
    if (updErr) {
      console.error(`❌ Failed to update obligation ${obl.id}:`, updErr.message);
      errorCount++;
    } else {
      if (category === 'Ruko') rukoCount++;
      else rumahCount++;
    }
  }

  console.log('--- Summary ---');
  console.log(`✅ Rumah updated: ${rumahCount}`);
  console.log(`✅ Ruko updated: ${rukoCount}`);
  if (errorCount > 0) console.log(`❌ Errors: ${errorCount}`);
  console.log('--- Done ---');
}

fix();
