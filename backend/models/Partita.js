const mongoose = require('mongoose')

const partitaSchema = new mongoose.Schema({
  sport: { type: String, required: true },
  luogo: { type: String, required: true },
  data: { type: Date, required: true },
  maxGiocatori: { type: Number, required: true },
  organizzatore: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  giocatori: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  vincitori: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  stato: { type: String, enum: ['aperta', 'in corso', 'terminata'], default: 'aperta' },
  risultato: { type: String, default: '' },
  mvp: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true })

module.exports = mongoose.model('Partita', partitaSchema)