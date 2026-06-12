const express = require('express')
const router = express.Router()
const Partita = require('../models/Partita')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

router.get('/', async (req, res) => {
  try {
    const partite = await Partita.find()
      .populate('organizzatore', 'nome rating')
      .populate('giocatori', 'nome rating')
      .sort({ createdAt: -1 })
    res.json(partite)
  } catch (error) {
    console.log('Errore:', error.message)
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.get('/cerca-utenti', authMiddleware, async (req, res) => {
  try {
    const { nome } = req.query
    if (!nome) return res.json([])
    const utenti = await User.find({
      nome: { $regex: nome, $options: 'i' }
    }).select('nome sport rating').limit(5)
    res.json(utenti)
  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const partita = await Partita.findById(req.params.id)
      .populate('organizzatore', 'nome rating')
      .populate('giocatori', 'nome rating')
    if (!partita) {
      return res.status(404).json({ messaggio: 'Partita non trovata' })
    }
    const partitaObj = partita.toObject()
    partitaObj.vincitori = partita.vincitori || []
    res.json(partitaObj)
  } catch (error) {
    console.log('Errore:', error.message)
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sport, luogo, data, maxGiocatori } = req.body
    if (!sport || !luogo || !data || !maxGiocatori) {
      return res.status(400).json({ messaggio: 'Tutti i campi sono obbligatori' })
    }
    const nuovaPartita = new Partita({
      sport,
      luogo,
      data,
      maxGiocatori,
      organizzatore: req.utente.id,
      giocatori: [req.utente.id]
    })
    await nuovaPartita.save()
    const partitaCompleta = await Partita.findById(nuovaPartita._id)
      .populate('organizzatore', 'nome rating')
      .populate('giocatori', 'nome rating')
    const io = req.app.get('io')
    io.emit('nuova_partita', partitaCompleta)
    res.status(201).json(partitaCompleta)
  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const partita = await Partita.findById(req.params.id)
    if (!partita) {
      return res.status(404).json({ messaggio: 'Partita non trovata' })
    }
    if (partita.organizzatore.toString() !== req.utente.id) {
      return res.status(403).json({ messaggio: 'Solo l organizzatore può modificare la partita' })
    }
    const { sport, luogo, data, maxGiocatori } = req.body
    if (sport) partita.sport = sport
    if (luogo) partita.luogo = luogo
    if (data) partita.data = data
    if (maxGiocatori) partita.maxGiocatori = maxGiocatori
    if (risultato !== undefined) partita.risultato = risultato
    await partita.save()
    const partitaAggiornata = await Partita.findById(req.params.id)
      .populate('organizzatore', 'nome rating')
      .populate('giocatori', 'nome rating')
    const io = req.app.get('io')
    io.emit('partita_aggiornata', partitaAggiornata)
    res.json(partitaAggiornata)
  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const partita = await Partita.findById(req.params.id)
    if (!partita) {
      return res.status(404).json({ messaggio: 'Partita non trovata' })
    }
    if (partita.organizzatore.toString() !== req.utente.id) {
      return res.status(403).json({ messaggio: 'Solo l organizzatore può eliminare la partita' })
    }
    await Partita.findByIdAndDelete(req.params.id)
    const io = req.app.get('io')
    io.emit('partita_eliminata', req.params.id)
    res.json({ messaggio: 'Partita eliminata' })
  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.post('/:id/unisciti', authMiddleware, async (req, res) => {
  try {
    const partita = await Partita.findById(req.params.id)
    if (!partita) {
      return res.status(404).json({ messaggio: 'Partita non trovata' })
    }
    if (partita.stato !== 'aperta') {
      return res.status(400).json({ messaggio: 'La partita non è più aperta' })
    }
    if (partita.giocatori.includes(req.utente.id)) {
      return res.status(400).json({ messaggio: 'Sei già iscritto a questa partita' })
    }
    if (partita.giocatori.length >= partita.maxGiocatori) {
      return res.status(400).json({ messaggio: 'Partita al completo' })
    }
    partita.giocatori.push(req.utente.id)
    await partita.save()
    const partitaAggiornata = await Partita.findById(req.params.id)
      .populate('organizzatore', 'nome rating')
      .populate('giocatori', 'nome rating')
    const io = req.app.get('io')
    io.emit('partita_aggiornata', partitaAggiornata)
    res.json(partitaAggiornata)
  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.post('/:id/invita', authMiddleware, async (req, res) => {
  try {
    const partita = await Partita.findById(req.params.id)
    if (!partita) {
      return res.status(404).json({ messaggio: 'Partita non trovata' })
    }
    if (partita.organizzatore.toString() !== req.utente.id) {
      return res.status(403).json({ messaggio: 'Solo l organizzatore può invitare giocatori' })
    }
    const { utenteId } = req.body
    if (partita.giocatori.map(g => g.toString()).includes(utenteId)) {
      return res.status(400).json({ messaggio: 'Giocatore già presente' })
    }
    if (partita.giocatori.length >= partita.maxGiocatori) {
      return res.status(400).json({ messaggio: 'Partita al completo' })
    }
    partita.giocatori.push(utenteId)
    await partita.save()
    const partitaAggiornata = await Partita.findById(req.params.id)
      .populate('organizzatore', 'nome rating')
      .populate('giocatori', 'nome rating')
    const io = req.app.get('io')
    io.emit('partita_aggiornata', partitaAggiornata)
    res.json(partitaAggiornata)
  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.put('/:id/stato', authMiddleware, async (req, res) => {
  try {
    const partita = await Partita.findById(req.params.id)
    if (!partita) {
      return res.status(404).json({ messaggio: 'Partita non trovata' })
    }
    if (partita.organizzatore.toString() !== req.utente.id) {
      return res.status(403).json({ messaggio: 'Solo l organizzatore può modificare lo stato' })
    }

    const { stato, risultato, vincitori, perdenti, pareggio } = req.body

    const aggiornamenti = { stato }
    if (risultato) aggiornamenti.risultato = risultato
    if (vincitori) aggiornamenti.vincitori = vincitori

    await Partita.findByIdAndUpdate(req.params.id, aggiornamenti)

    if (stato === 'terminata') {
      if (pareggio) {
        await User.updateMany(
          { _id: { $in: partita.giocatori } },
          { $inc: { pareggi: 1 } }
        )
      } else {
        if (vincitori && vincitori.length > 0) {
          await User.updateMany(
            { _id: { $in: vincitori } },
            { $inc: { vittorie: 1, streak: 1 } }
          )
        }
        if (perdenti && perdenti.length > 0) {
          await User.updateMany(
            { _id: { $in: perdenti } },
            { $inc: { sconfitte: 1 }, $set: { streak: 0 } }
          )
        }
      }
    }

    const partitaAggiornata = await Partita.findById(req.params.id)
      .populate('organizzatore', 'nome rating')
      .populate('giocatori', 'nome rating')

    const io = req.app.get('io')
    io.emit('partita_aggiornata', partitaAggiornata)
    res.json(partitaAggiornata)
  } catch (error) {
    console.log('Errore stato:', error.message)
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

module.exports = router