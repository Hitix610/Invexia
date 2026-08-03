import {
  getBudgetsService,
  createBudgetService
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