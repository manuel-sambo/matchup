import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TextField, Alert, CircularProgress, MenuItem } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const SPORT = ['Calcio', 'Basket', 'Tennis', 'Padel', 'Pallavolo']

function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sport, setSport] = useState('Calcio')
  const [errore, setErrore] = useState('')
  const [caricamento, setCaricamento] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrore('')
    setCaricamento(true)
    try {
      const risposta = await axios.post('https://matchup-backend-8kmk.onrender.com/api/auth/register', {
        nome, email, password, sport
      })
      login(risposta.data.utente, risposta.data.token)
      navigate('/dashboard')
    } catch (error) {
      setErrore(error.response?.data?.messaggio || 'Errore durante la registrazione')
    } finally {
      setCaricamento(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f2eb] flex">

      {/* SINISTRA - decorativa */}
      <div className="hidden lg:flex w-1/2 bg-[#1a1a1a] flex-col justify-between p-12">
        <span className="logo-animato font-barlow font-black text-3xl uppercase tracking-tight text-white">
          Match<span className="bg-[#e8ff47] text-[#1a1a1a] px-1">Up</span>
        </span>
        <div>
          <div className="font-barlow font-black text-7xl uppercase leading-none mb-6">
            <p className="testo-animato text-white">Unisciti.</p>
            <p className="testo-animato text-white">Gioca.</p>
            <p className="testo-animato text-[#e8ff47]">Vinci.</p>
          </div>
          <p className="text-[#aaaaaa] text-sm font-dm">
            Crea il tuo account e inizia a organizzare partite oggi stesso.
          </p>
        </div>
        <div className="flex gap-8">
          <div>
            <p className="font-barlow font-black text-4xl text-[#e8ff47]"></p>
            <p className="text-[#aaaaaa] text-xs font-dm"></p>
          </div>
          <div>
            <p className="font-barlow font-black text-4xl text-white"></p>
            <p className="text-[#aaaaaa] text-xs font-dm"></p>
          </div>
        </div>
      </div>

      {/* DESTRA - form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">

          <div className="lg:hidden mb-8">
            <span className="font-barlow font-black text-3xl uppercase tracking-tight">
              Match<span className="bg-[#e8ff47] px-1">Up</span>
            </span>
          </div>

          <h2 className="font-barlow font-black text-4xl uppercase tracking-tight text-[#1a1a1a] mb-1">
            Crea account
          </h2>
          <p className="text-[#6b6b6b] text-sm font-dm mb-8">
            Registrati e inizia a giocare con i tuoi amici
          </p>

          {errore && <Alert severity="error" sx={{ mb: 3, borderRadius: '4px' }}>{errore}</Alert>}
<form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <TextField
              label="Nome"
              fullWidth
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div>
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-[#6b6b6b] mt-1 font-dm">
                Minimo 8 caratteri, una maiuscola e un numero
              </p>
            </div>
            <TextField
              label="Sport preferito"
              select
              fullWidth
              value={sport}
              onChange={(e) => setSport(e.target.value)}
            >
              {SPORT.map((s) => (
                <MenuItem key={s} value={s}>{s}</MenuItem>
              ))}
            </TextField>
            <button
              type="submit"
              disabled={caricamento}
              className="w-full bg-[#e8ff47] text-[#1a1a1a] font-barlow font-bold text-lg uppercase tracking-wide py-3 rounded hover:bg-[#c8df27] transition-colors disabled:opacity-50 mt-2"
            >
              {caricamento ? <CircularProgress size={22} color="inherit" /> : 'Registrati'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[#6b6b6b] font-dm">
            Hai già un account?{' '}
            <Link to="/login" className="text-[#1a1a1a] font-semibold border-b-2 border-[#e8ff47] hover:bg-[#e8ff47] transition-colors">
              Accedi
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register