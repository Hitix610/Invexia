import { supabase } from '../config/supabase.js'

// Obtener semáforo financiero
export const getFinancialSemaphore = async () => {

  // Usuario de prueba
  const usuario_id = '9f0c0b7c-0ed9-4c68-b30f-2f697b6730f1'

  const fecha = new Date()

  const mes = fecha.getMonth() + 1
  const anio = fecha.getFullYear()

  console.log('usuario:', usuario_id)
  console.log('mes:', mes)
  console.log('anio:', anio)

  // Ejecutar función SQL de Supabase
  const { error } = await supabase.rpc('calcular_semaforo', {
    p_usuario_id: usuario_id,
    p_mes: mes,
    p_anio: anio
  })

  if (error) {
    throw new Error(error.message)
  }

  // Consultar resultado calculado
  const { data, error: selectError } = await supabase
    .from('semaforo_financiero')
    .select('*')
    .eq('usuario_id', usuario_id)
    .eq('mes', mes)
    .eq('anio', anio)
    .single()

  console.log('resultado:', data)

  if (selectError) {
    throw new Error(selectError.message)
  }

  return data
}