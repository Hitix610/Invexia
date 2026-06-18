import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

console.log('URL:', process.env.SUPABASE_URL)
console.log('KEY length:', process.env.SUPABASE_KEY?.length)

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
)