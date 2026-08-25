import {
  getBudgetsService,
  createBudgetService,
  updateBudgetService,
  deleteBudgetService
} from '../services/budgets.service.js'

export const getBudgets = async (req, res) => {
    try {
        const data = await getBudgetsService(req.user.id)

        res.json(data)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}


export const createBudget = async (req, res) => {
  try {
    console.log(req.body)

    const { categoria_id, monto_limite, mes, anio } = req.body

    const data = await createBudgetService({
      categoria_id,
      monto_limite,
      mes,
      anio,
      usuario_id: req.user.id
    })

    res.status(201).json(data)
  } catch (error) {
    res.status(500).json({
      error: error.message
    })
  }
}

export const updateBudget = async (req, res) => {
  try {
    const { id } = req.params
    const { categoria_id, monto_limite, mes, anio } = req.body

    const data = await updateBudgetService(id, req.user.id, {
      categoria_id,
      monto_limite,
      mes,
      anio
    })

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params

    const data = await deleteBudgetService(id, req.user.id)

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
