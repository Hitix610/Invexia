import { supabase } from '../config/supabase.js'

export const registerService = async ({
  email,
  password,
  nombre
}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre
      }
    }
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}