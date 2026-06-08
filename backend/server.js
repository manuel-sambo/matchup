require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const connectDB = require('./db')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173' }
})

connectDB()

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
app.use('/api/voti', require('./routes/voti'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/partite', require('./routes/partite'))
app.use('/api/voti', require('./routes/voti'))

io.on('connection', (socket) => {
  console.log('Utente connesso:', socket.id)
  
  socket.on('disconnect', () => {
    console.log('Utente disconnesso:', socket.id)
  })
})

app.set('io', io)

server.listen(process.env.PORT, () => {
  console.log(`Server avviato sulla porta ${process.env.PORT}`)
})