// src/middleware/validateTransaction.js

// exportar una función de middleware para validar los datos de una transacción

export const validateTransaction = (req, res, next) => {
    // validar que el monto y el tipo estén presentes en el cuerpo de la solicitud

  const { amount, type } = req.body

  next()
}
