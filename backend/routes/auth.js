const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

const validaEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const validaPassword = (password) => {
  return /^(?=.*[A-Z])(?=.*[0-9]).{8,}$/.test(password)
}

router.post('/register', async (req, res) => {
  try {
    const { nome, email, password, sport } = req.body

    if (!nome || !email || !password) {
      return res.status(400).json({ messaggio: 'Tutti i campi sono obbligatori' })
    }

    if (!validaEmail(email)) {
      return res.status(400).json({ messaggio: 'Email non valida' })
    }

    if (!validaPassword(password)) {
      return res.status(400).json({ messaggio: 'La password deve avere almeno 8 caratteri, una maiuscola e un numero' })
    }

    const utenteEsistente = await User.findOne({ email })
    if (utenteEsistente) {
      return res.status(400).json({ messaggio: 'Email già registrata' })
    }

    const salt = await bcrypt.genSalt(10)
    const passwordCriptata = await bcrypt.hash(password, salt)

    const nuovoUtente = new User({
      nome,
      email,
      password: passwordCriptata,
      sport: sport || 'Calcio'
    })

    await nuovoUtente.save()

    const token = jwt.sign(
      { id: nuovoUtente._id, nome: nuovoUtente.nome },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, utente: { id: nuovoUtente._id, nome: nuovoUtente.nome, sport: nuovoUtente.sport } })

  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ messaggio: 'Email e password obbligatorie' })
    }

    const utente = await User.findOne({ email })
    if (!utente) {
      return res.status(400).json({ messaggio: 'Credenziali non valide' })
    }

    const passwordCorretta = await bcrypt.compare(password, utente.password)
    if (!passwordCorretta) {
      return res.status(400).json({ messaggio: 'Credenziali non valide' })
    }

    const token = jwt.sign(
      { id: utente._id, nome: utente.nome },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({ token, utente: { id: utente._id, nome: utente.nome, sport: utente.sport } })

  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})
router.put('/profilo', authMiddleware, async (req, res) => {
  try {
    const { nome, sport, citta, eta } = req.body

    if (!nome) {
      return res.status(400).json({ messaggio: 'Il nome è obbligatorio' })
    }

    const utenteAggiornato = await User.findByIdAndUpdate(
      req.utente.id,
      { nome, sport, citta, eta },
      { new: true }
    ).select('-password')

    res.json({
      utente: {
        id: utenteAggiornato._id,
        nome: utenteAggiornato.nome,
        sport: utenteAggiornato.sport,
        citta: utenteAggiornato.citta,
        eta: utenteAggiornato.eta,
        rating: utenteAggiornato.rating,
        vittorie: utenteAggiornato.vittorie,
        sconfitte: utenteAggiornato.sconfitte,
        pareggi: utenteAggiornato.pareggi,
        mvp: utenteAggiornato.mvp
      }
    })
  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})
router.get('/utente/:id', async (req, res) => {
  try {
    const utente = await User.findById(req.params.id)
      .select('-password')
    if (!utente) {
      return res.status(404).json({ messaggio: 'Utente non trovato' })
    }
    res.json(utente)
  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})
module.exports = router