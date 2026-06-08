const mongoose = require('mongoose')

const votoSchema = new mongoose.Schema({
  partita: { type: mongoose.Schema.Types.ObjectId, ref: 'Partita', required: true },
  votante: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  votato: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  punteggio: { type: Number, min: 1, max: 10, required: true },
  commento: { type: String, default: '' },
  mvpVoto: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

votoSchema.index({ partita: 1, votante: 1, votato: 1 }, { unique: true })

module.exports = mongoose.model('Voto', votoSchema)