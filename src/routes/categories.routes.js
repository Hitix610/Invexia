import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { validateUuidParam } from '../lib/validators.js'
import { validateCategory, validateCategoryUpdate } from '../middleware/validateCategory.js'
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categories.controller.js'

const router = Router()

// Las consultas requieren una sesión y devuelven las categorías visibles para el usuario.
router.get('/', authMiddleware, getCategories)
// La creación valida los campos de una categoría personalizada.
router.post('/', authMiddleware, validateCategory, createCategory)
// Actualizar y eliminar requieren un UUID de categoría. La actualización también valida los campos enviados.
router.put('/:id', authMiddleware, validateUuidParam(), validateCategoryUpdate, updateCategory)
router.delete('/:id', authMiddleware, validateUuidParam(), deleteCategory)

export default router
