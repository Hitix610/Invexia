export const validateGoal = (req, res, next) => {
  const { nombre, monto_objetivo, fecha_limite } = req.body

  if (!nombre || nombre.trim() === '') {
    return res.status(400).json({ error: 'nombre es obligatorio' })
  }

  if (monto_objetivo === undefined || monto_objetivo <= 0) {
    return res.status(400).json({ error: 'monto_objetivo debe ser mayor a 0' })
  }

  if (fecha_limite && isNaN(Date.parse(fecha_limite))) {
    return res.status(400).json({ error: 'fecha_limite no es una fecha válida' })
  }

  next()
}