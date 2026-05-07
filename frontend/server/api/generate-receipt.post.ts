import { createClient } from '@supabase/supabase-js'
import type { Database } from '~/types/database.types'
import { terbilang } from '~/utils/terbilang'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabaseUrl = process.env.SUPABASE_URL || config.public.supabaseUrl
  const serviceRole = config.supabaseServiceRole

  if (!supabaseUrl || !serviceRole) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase service role or URL is not configured on the server.'
    })
  }

  const payload = await readBody(event)
  const requiredFields = ['obligation_id', 'unit_id', 'unit_code', 'owner_name', 'amount', 'payment_description']

  for (const field of requiredFields) {
    if (payload?.[field] === undefined || payload?.[field] === null) {
      throw createError({
        statusCode: 400,
        statusMessage: `Missing required receipt field: ${field}`
      })
    }
  }

  const supabase = createClient<Database>(supabaseUrl, serviceRole, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })

  try {
    const now = new Date();
    const { data: receiptNumber, error: rpcErr } = await supabase.rpc(
      'get_next_receipt_number',
      { p_year: now.getFullYear(), p_month: now.getMonth() + 1 }
    );
    if (rpcErr) {
      throw createError({ statusCode: 500, statusMessage: rpcErr.message });
    }

    const { data: setting, error: settingErr } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'treasurer_name')
      .maybeSingle();

    if (settingErr) {
      throw createError({ statusCode: 500, statusMessage: settingErr.message });
    }

    const receiptPayload = {
      receipt_number: receiptNumber as string,
      obligation_id: payload.obligation_id,
      unit_id: payload.unit_id,
      unit_code: payload.unit_code,
      owner_name: payload.owner_name,
      amount: payload.amount,
      amount_words: terbilang(payload.amount),
      payment_description: payload.payment_description,
      issued_by: setting?.value ?? 'Encin',
      payment_date: now.toISOString().split('T')[0],
    }

    const { data, error } = await supabase
      .from('receipts')
      .insert(receiptPayload)
      .select()
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message
      })
    }

    return data
  } catch (err: any) {
    console.error('Receipt generation API error:', err)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: err.message || 'Failed to generate receipt.'
    })
  }
})
