import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { TextField, Alert, CircularProgress } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState('')
  const [caricamento, setCaricamento] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrore('')
    setCaricamento(true)
    try {
      const risposta = await axios.post('http://localhost:5002/api/auth/login', { email, password })
      login(risposta.data.utente, risposta.data.token)
      navigate('/dashboard')
    } catch (error) {
      setErrore(error.response?.data?.messaggio || 'Errore durante il login')
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
  <p className="testo-animato text-white">Gioca.</p>
  <p className="testo-animato text-white">Vinci.</p>
  <p className="testo-animato text-[#e8ff47]">Scala.</p>
</div>
          <p className="text-[#aaaaaa] text-sm font-dm">
            Organizza partite, vota le prestazioni e scala la classifica globale.
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
            Bentornato
          </h2>
          <p className="text-[#6b6b6b] text-sm font-dm mb-8">
            Accedi per vedere le partite e la classifica
          </p>

          {errore && <Alert severity="error" sx={{ mb: 3, borderRadius: '4px' }}>{errore}</Alert>}
<form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={caricamento}
              className="w-full bg-[#e8ff47] text-[#1a1a1a] font-barlow font-bold text-lg uppercase tracking-wide py-3 rounded hover:bg-[#c8df27] transition-colors disabled:opacity-50 mt-2"
            >
              {caricamento ? <CircularProgress size={22} color="inherit" /> : 'Accedi'}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-[#6b6b6b] font-dm">
            Non hai un account?{' '}
            <Link to="/register" className="text-[#1a1a1a] font-semibold border-b-2 border-[#e8ff47] hover:bg-[#e8ff47] transition-colors">
              Registrati
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login