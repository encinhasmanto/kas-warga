// const { createClient } = require('@supabase/supabase-client');
// require('dotenv').config();

// const supabaseUrl = process.env.VITE_SUPABASE_URL;
// const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// const supabase = createClient(supabaseUrl, supabaseKey);
import { supabase } from "./src/services/supabaseClient.js";

async function check() {
  const { data, error } = await supabase
    .from('payment_obligations')
    .select('*, event:payment_events(*)')
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sample Obligations:', JSON.stringify(data, null, 2));
  }
}

check();
