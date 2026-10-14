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

router.get('/', authMiddleware, getCategories)
router.post('/', authMiddleware, validateCategory, createCategory)
router.put('/:id', authMiddleware, validateUuidParam(), validateCategoryUpdate, updateCategory)
router.delete('/:id', authMiddleware, validateUuidParam(), deleteCategory)

export default router
