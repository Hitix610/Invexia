import {
  getCategoriesService,
  createCategoryService,
  updateCategoryService,
  deleteCategoryService
} from '../services/categories.service.js'
import { handleError } from '../lib/errors.js'

// GET /api/categories?tipo=gasto
// Valida el filtro de ingreso o gasto antes de listar las categorías visibles.
export const getCategories = async (req, res) => {
  try {
    const { tipo } = req.query

    if (tipo !== undefined && !['ingreso', 'gasto'].includes(tipo)) {
      return res.status(400).json({ error: 'tipo debe ser ingreso o gasto' })
    }

    res.json(await getCategoriesService(req.user.id, { tipo }))
  } catch (error) {
    handleError(res, error, 'GET CATEGORIES')
  }
}

// Crea una categoría personalizada con el nombre, el tipo y los detalles visuales enviados.
export const createCategory = async (req, res) => {
  try {
    const { nombre, icono, color, tipo } = req.body
    const data = await createCategoryService(req.user.id, { nombre, icono, color, tipo })

    res.status(201).json(data)
  } catch (error) {
    handleError(res, error, 'CREATE CATEGORY')
  }
}

// Aplica solo los campos editables enviados y recorta los espacios del nombre.
export const updateCategory = async (req, res) => {
  try {
    const { nombre, icono, color, tipo } = req.body

    const updates = {}
    if (nombre !== undefined) updates.nombre = nombre.trim()
    if (icono !== undefined) updates.icono = icono
    if (color !== undefined) updates.color = color
    if (tipo !== undefined) updates.tipo = tipo

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se envió ningún campo para actualizar' })
    }

    res.json(await updateCategoryService(req.params.id, req.user.id, updates))
  } catch (error) {
    handleError(res, error, 'UPDATE CATEGORY')
  }
}

// Solicita la eliminación de una categoría propia mediante su identificador.
export const deleteCategory = async (req, res) => {
  try {
    res.json(await deleteCategoryService(req.params.id, req.user.id))
  } catch (error) {
    handleError(res, error, 'DELETE CATEGORY')
  }
}
