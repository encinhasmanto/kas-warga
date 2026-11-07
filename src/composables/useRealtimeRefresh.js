import { getCurrentScope, onScopeDispose } from 'vue'
import { supabase } from '@/services/supabaseClient'

let seq = 0

/**
 * Satu channel Supabase Realtime per halaman untuk beberapa tabel.
 * - Event beruntun digabung (debounce) menjadi SATU pemanggilan onChange.
 * - Data diambil ulang saat tab kembali aktif setelah lama tersembunyi, atau saat koneksi kembali.
 * - Channel dibersihkan otomatis saat komponen dilepas.
 *
 * @param {string} name            nama dasar channel
 * @param {() => Array<{table:string, filter?:string, event?:string}>} getSources
 *                                  dievaluasi setiap start() agar filter ikut sesi terbaru
 * @param {() => void} onChange    biasanya fungsi fetch data halaman
 * @param {{debounceMs?: number, staleMs?: number}} [opts]
 */
export function useRealtimeRefresh(name, getSources, onChange, opts = {}) {
  const { debounceMs = 400, staleMs = 30000 } = opts
  let channel = null
  let timer = null
  let hiddenAt = 0
  let listening = false

  const trigger = () => {
    clearTimeout(timer)
    timer = setTimeout(() => onChange(), debounceMs)
  }

  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      hiddenAt = Date.now()
    } else if (hiddenAt && Date.now() - hiddenAt > staleMs) {
      hiddenAt = 0
      trigger()
    }
  }

  function stop() {
    clearTimeout(timer)
    if (channel) {
      try { supabase.removeChannel(channel) } catch (e) { /* abaikan */ }
      channel = null
    }
    if (listening) {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('online', trigger)
      listening = false
    }
  }

  function start() {
    stop()
    const ch = supabase.channel(`${name}-${++seq}`)
    for (const { table, filter, event = '*' } of getSources()) {
      ch.on(
        'postgres_changes',
        { event, schema: 'public', table, ...(filter ? { filter } : {}) },
        trigger,
      )
    }
    let wasDown = false
    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED' && wasDown) { wasDown = false; trigger() }
      else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') wasDown = true
    })
    channel = ch
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('online', trigger)
    listening = true
  }

  if (getCurrentScope()) onScopeDispose(stop)
  return { start, stop }
}
