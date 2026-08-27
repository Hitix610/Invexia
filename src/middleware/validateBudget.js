export const validateBudget = (req, res, next) => {
  const { categoria_id, monto_limite, mes, anio } = req.body

  if (!categoria_id) {
    return res.status(400).json({ error: 'categoria_id es obligatorio' })
  }

  if (monto_limite === undefined || monto_limite <= 0) {
    return res.status(400).json({ error: 'monto_limite debe ser mayor a 0' })
  }

  if (!mes || mes < 1 || mes > 12) {
    return res.status(400).json({ error: 'mes debe estar entre 1 y 12' })
  }

  if (!anio || anio < 2020) {
    return res.status(400).json({ error: 'anio debe ser 2020 o posterior' })
  }

  next()
}