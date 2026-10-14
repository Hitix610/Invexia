import { supabase } from '../config/supabase.js'
import { HttpError, must } from '../lib/errors.js'

// Categorías visibles para el usuario: las globales (usuario_id NULL) + las suyas
export const getCategoriesService = async (usuario_id, { tipo } = {}) => {
  let query = supabase
    .from('categorias')
    .select('*')
    .or(`usuario_id.is.null,usuario_id.eq.${usuario_id}`)
    .order('nombre', { ascending: true })

  if (tipo) {
    // 'ambos' sirve tanto para ingresos como para gastos
    query = query.in('tipo', [tipo, 'ambos'])
  }

  return must(await query)
}

export const createCategoryService = async (usuario_id, { nombre, icono, color, tipo }) => {
  const rows = must(
    await supabase
      .from('categorias')
      .insert([
        {
          usuario_id,
          nombre: nombre.trim(),
          icono: icono ?? null,
          color: color ?? null,
          tipo,
          es_predefinida: false
        }
      ])
      .select()
  )

  return rows[0]
}

export const updateCategoryService = async (id, usuario_id, updates) => {
  // .eq('usuario_id') hace que las categorías predefinidas (usuario_id NULL) no se puedan editar
  const rows = must(
    await supabase
      .from('categorias')
      .update(updates)
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select()
  )

  if (rows.length === 0) {
    throw new HttpError(404, 'Categoría no encontrada o no se puede modificar')
  }

  return rows[0]
}

export const deleteCategoryService = async (id, usuario_id) => {
  const rows = must(
    await supabase
      .from('categorias')
      .delete()
      .eq('id', id)
      .eq('usuario_id', usuario_id)
      .select('id')
  )

  if (rows.length === 0) {
    throw new HttpError(404, 'Categoría no encontrada o no se puede eliminar')
  }

  return { message: 'Categoría eliminada correctamente' }
}

// Verifica que una categoría exista y sea usable por el usuario (global o suya).
// Evita que alguien referencie la categoría personalizada de otro usuario.
export const assertCategoriaAccesible = async (categoria_id, usuario_id) => {
  const fila = must(
    await supabase
      .from('categorias')
      .select('id, nombre, usuario_id')
      .eq('id', categoria_id)
      .maybeSingle()
  )

  if (!fila || (fila.usuario_id !== null && fila.usuario_id !== usuario_id)) {
    throw new HttpError(400, 'categoria_id no existe o no está disponible para este usuario')
  }

  return fila
}
