const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  citta: { type: String, default: '' },
eta: { type: Number, default: null },
  sport: { type: String, default: 'Calcio' },
  rating: { type: Number, default: 5 },
  vittorie: { type: Number, default: 0 },
  sconfitte: { type: Number, default: 0 },
pareggi: { type: Number, default: 0 },
mvp: { type: Number, default: 0 },
streak: { type: Number, default: 0 }
}, { timestamps: true })

module.exports = mongoose.model('User', userSchema)