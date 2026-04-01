// import { createClient } from '@supabase/supabase-js';

// const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import { supabase } from "./src/services/supabaseClient.js";

async function check() {
  // 1. Get a resident unit
  const { data: units, error: unitErr } = await supabase
    .from('units')
    .select('id, code, name')
    .limit(5);
  
  if (unitErr) {
    console.error('Unit Error:', unitErr);
    return;
  }
  
  console.log('Sample Units:', units);
  
  const unitId = units[0].id;
  console.log('Checking obligations for unit:', units[0].code, '(' + unitId + ')');

  // 2. Check obligations for this unit
  const { data: obligations, error: oblErr } = await supabase
    .from('payment_obligations')
    .select('*')
    .eq('unit_id', unitId)
    .order('year', { ascending: false })
    .order('month_index', { ascending: false })
    .limit(10);
  
  if (oblErr) {
    console.error('Obligation Error:', oblErr);
  } else {
    console.log('Obligations:', JSON.stringify(obligations, null, 2));
  }
  
  // 3. Check current date for reference
  console.log('Current Server Date:', new Date().toISOString());
}

check();
