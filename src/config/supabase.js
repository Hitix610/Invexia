import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

console.log('URL:', process.env.SUPABASE_URL)
console.log('KEY length:', process.env.SUPABASE_KEY?.length)

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)

// Cliente desechable, sin sesión compartida.
// Se usa para refresh / recuperar contraseña, para no mezclar sesiones de
// distintos usuarios dentro del cliente global `supabase`.
export const createIsolatedClient = () =>
  createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
