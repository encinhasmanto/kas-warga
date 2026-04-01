// import { createClient } from "@supabase/supabase-js";

// const SUPABASE_URL = "https://zjdlxsjteqjakhrtkxzu.supabase.co";
// const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqZGx4c2p0ZXFqYWtocnRreHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk4MzAsImV4cCI6MjA2NzI5NTgzMH0.-bXkcX9k7KrGJUMgZsW2ismgox2Tcf0p9-q9e7kuxhI";

// const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
import { supabase } from "./src/services/supabaseClient.js";

async function run() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .limit(5);

  console.log("Error:", error);
  console.log("Data:", JSON.stringify(data, null, 2));

  const { data: units } = await supabase.from('units').select('id, code').limit(3);
  console.log("Units:", JSON.stringify(units, null, 2));

  // Also query the joined event just to be absolutely certain how the JS client shapes the response!
  const { data: joinData } = await supabase
      .from('payment_obligations')
      .select('id, status, unit_id, month_index, year, event_id, event:payment_events(key)')
      .limit(2);
  console.log("Join Structure:", JSON.stringify(joinData, null, 2));
}

run().catch(console.error);
