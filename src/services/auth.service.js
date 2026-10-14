import { supabase, createIsolatedClient } from '../config/supabase.js'
import { HttpError } from '../lib/errors.js'

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
    throw new HttpError(400, error.message)
  }

  return data
}

export const loginService = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw new HttpError(401, error.message)
  }

  return data
}

// Renueva la sesión con el refresh_token (el access_token dura ~1 hora)
export const refreshService = async ({ refresh_token }) => {
  const client = createIsolatedClient()

  const { data, error } = await client.auth.refreshSession({ refresh_token })

  if (error || !data.session) {
    throw new HttpError(401, error?.message || 'No se pudo renovar la sesión')
  }

  return { session: data.session, user: data.user }
}

// Envía el correo de recuperación (RF-04). El enlace expira según la configuración de Supabase Auth.
export const forgotPasswordService = async ({ email }) => {
  const client = createIsolatedClient()

  const opciones = process.env.PASSWORD_RESET_REDIRECT_URL
    ? { redirectTo: process.env.PASSWORD_RESET_REDIRECT_URL }
    : undefined

  const { error } = await client.auth.resetPasswordForEmail(email, opciones)

  if (error) {
    // Un error de límite de envíos sí se informa; el resto se oculta para no revelar si el correo existe
    if (error.status === 429) {
      throw new HttpError(429, 'Demasiados intentos. Intenta de nuevo en unos minutos.')
    }
    console.error('FORGOT PASSWORD ERROR:', error.message)
  }

  return { message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' }
}
