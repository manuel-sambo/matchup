const jwt = require('jsonwebtoken')

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ messaggio: 'Accesso negato, token mancante' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.utente = decoded
    next()
  } catch (error) {
    res.status(401).json({ messaggio: 'Token non valido' })
  }
}

module.exports = authMiddleware