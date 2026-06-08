const express = require('express')
const router = express.Router()
const Voto = require('../models/Voto')
const Partita = require('../models/Partita')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth')

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { partitaId, votatoId, punteggio, commento } = req.body

    if (!partitaId || !votatoId || !punteggio) {
      return res.status(400).json({ messaggio: 'Tutti i campi sono obbligatori' })
    }

    if (punteggio < 1 || punteggio > 10) {
      return res.status(400).json({ messaggio: 'Il punteggio deve essere tra 1 e 10' })
    }

    const partita = await Partita.findById(partitaId)
    if (!partita) {
      return res.status(404).json({ messaggio: 'Partita non trovata' })
    }

    if (partita.stato !== 'terminata') {
      return res.status(400).json({ messaggio: 'Puoi votare solo dopo la fine della partita' })
    }

    if (!partita.giocatori.includes(req.utente.id)) {
      return res.status(403).json({ messaggio: 'Devi aver partecipato alla partita per votare' })
    }

    if (req.utente.id === votatoId) {
      return res.status(400).json({ messaggio: 'Non puoi votare te stesso' })
    }

    if (!partita.giocatori.includes(votatoId)) {
      return res.status(400).json({ messaggio: 'Il giocatore votato non ha partecipato alla partita' })
    }

    const votoEsistente = await Voto.findOne({
      partita: partitaId,
      votante: req.utente.id,
      votato: votatoId
    })

    if (votoEsistente) {
      return res.status(400).json({ messaggio: 'Hai già votato questo giocatore' })
    }

    const nuovoVoto = new Voto({
      partita: partitaId,
      votante: req.utente.id,
      votato: votatoId,
      punteggio,
      commento: commento || ''
    })

    await nuovoVoto.save()

    const tuttiVotiRicevuti = await Voto.find({ votato: votatoId })
    const mediaRating = tuttiVotiRicevuti.reduce((acc, v) => acc + v.punteggio, 0) / tuttiVotiRicevuti.length

    await User.findByIdAndUpdate(votatoId, { rating: mediaRating.toFixed(1) })

    res.status(201).json({ messaggio: 'Voto registrato con successo' })

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ messaggio: 'Hai già votato questo giocatore' })
    }
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.get('/partita/:id', async (req, res) => {
  try {
    const voti = await Voto.find({ partita: req.params.id })
      .populate('votante', 'nome')
      .populate('votato', 'nome')
    res.json(voti)
  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.get('/classifica', async (req, res) => {
  try {
    const utenti = await User.find()
      .select('nome sport rating vittorie sconfitte pareggi streak mvp')
      .sort({ rating: -1 })
    res.json(utenti)
  } catch (error) {
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

router.post('/mvp', authMiddleware, async (req, res) => {
  try {
    const { partitaId, mvpId } = req.body

    const partita = await Partita.findById(partitaId)
    if (!partita) {
      return res.status(404).json({ messaggio: 'Partita non trovata' })
    }

    if (partita.stato !== 'terminata') {
      return res.status(400).json({ messaggio: 'Puoi votare MVP solo a partita terminata' })
    }

    if (!partita.giocatori.map(g => g.toString()).includes(req.utente.id)) {
      return res.status(403).json({ messaggio: 'Devi aver partecipato alla partita' })
    }

    if (req.utente.id === mvpId) {
      return res.status(400).json({ messaggio: 'Non puoi votare te stesso come MVP' })
    }

    const tuttiVoti = await Voto.find({ partita: partitaId })
    const votiMvp = {}

    tuttiVoti.forEach(v => {
      if (v.mvpVoto) {
        votiMvp[v.mvpVoto.toString()] = (votiMvp[v.mvpVoto.toString()] || 0) + 1
      }
    })

    const votoEsistente = await Voto.findOne({
      partita: partitaId,
      votante: req.utente.id
    })

    if (votoEsistente) {
      votoEsistente.mvpVoto = mvpId
      await votoEsistente.save()
    }

    votiMvp[mvpId] = (votiMvp[mvpId] || 0) + 1

    const mvpFinale = Object.entries(votiMvp).sort((a, b) => b[1] - a[1])[0]?.[0]

    if (mvpFinale) {
      const vecchioMvp = partita.mvp?.toString()
      await Partita.findByIdAndUpdate(partitaId, { mvp: mvpFinale })
      if (vecchioMvp && vecchioMvp !== mvpFinale) {
        await User.findByIdAndUpdate(vecchioMvp, { $inc: { mvp: -1 } })
      }
      if (!vecchioMvp || vecchioMvp !== mvpFinale) {
        await User.findByIdAndUpdate(mvpFinale, { $inc: { mvp: 1 } })
      }
    }

    res.json({ messaggio: 'Voto MVP registrato' })
  } catch (error) {
    console.log('Errore MVP:', error.message)
    res.status(500).json({ messaggio: 'Errore del server' })
  }
})

module.exports = router