// Script una tantum per resettare le statistiche di tutti gli utenti.
// Eseguire dalla cartella backend con: node reset-stats.js
// Dopo l'esecuzione si può cancellare questo file.

require('dotenv').config()
const mongoose = require('mongoose')
const User = require('./models/User')
const Partita = require('./models/Partita')

async function resetStats() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Connesso al database')

    const risultatoUtenti = await User.updateMany(
      {},
      {
        $set: {
          vittorie: 0,
          sconfitte: 0,
          pareggi: 0,
          streak: 0,
          rating: 5,
          mvp: 0
        }
      }
    )

    console.log(`Statistiche resettate per ${risultatoUtenti.modifiedCount} utenti`)

    const risultatoPartite = await Partita.deleteMany({})
    console.log(`Eliminate ${risultatoPartite.deletedCount} partite`)
  } catch (error) {
    console.log('Errore:', error.message)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnesso')
  }
}

resetStats()