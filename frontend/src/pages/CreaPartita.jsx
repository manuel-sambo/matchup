import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const SPORT = ['Calcio', 'Basket', 'Tennis', 'Padel', 'Pallavolo']

function CreaPartita() {
  const [sport, setSport] = useState('Calcio')
  const [luogo, setLuogo] = useState('')
  const [data, setData] = useState('')
  const [maxGiocatori, setMaxGiocatori] = useState(10)
  const [errore, setErrore] = useState('')
  const [caricamento, setCaricamento] = useState(false)
  const { token, utente } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrore('')
    setCaricamento(true)
    try {
      await axios.post(
        'https://matchup-backend-8kmk.onrender.com/api/partite',
        { sport, luogo, data, maxGiocatori },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      navigate('/dashboard')
    } catch (error) {
      setErrore(error.response?.data?.messaggio || 'Errore nella creazione')
    } finally {
      setCaricamento(false)
    }
  }

  if (!utente) {
    navigate('/login')
    return null
  }

  const inputClass = "w-full bg-[#f5f2eb] border border-[#e0ddd6] rounded px-4 py-3 font-dm text-[#1a1a1a] text-sm focus:outline-none focus:border-[#e8ff47] focus:border-2 transition-all"
  const labelClass = "block font-barlow font-bold text-sm uppercase tracking-wide text-[#1a1a1a] mb-2"

  return (
    <div className="min-h-screen bg-[#f5f2eb]">

      {/* NAVBAR */}
      <nav className="bg-[#1a1a1a] h-[60px] flex items-center justify-between px-8 sticky top-0 z-50">
        <span className="font-barlow font-black text-2xl uppercase text-white tracking-tight">
          Match<span className="bg-[#e8ff47] text-[#1a1a1a] px-1">Up</span>
        </span>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-[#aaaaaa] hover:text-white text-sm font-dm px-4 py-2 rounded hover:bg-white/10 transition-colors">
            Partite
          </Link>
          <Link to="/classifica" className="text-[#aaaaaa] hover:text-white text-sm font-dm px-4 py-2 rounded hover:bg-white/10 transition-colors">
            Classifica
          </Link>
          <Link to="/profilo" className="text-[#aaaaaa] hover:text-white text-sm font-dm px-4 py-2 rounded hover:bg-white/10 transition-colors">
            Profilo
          </Link>
        </div>
      </nav>

      {/* CONTENUTO */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-barlow font-black text-5xl uppercase tracking-tight text-[#1a1a1a]">
            Nuova partita
          </h1>
          <p className="text-[#6b6b6b] text-sm font-dm mt-1">
            Compila i dettagli e invita i tuoi amici
          </p>
        </div>

        <div className="bg-white border border-[#e0ddd6] rounded p-8">

          {errore && (
            <div className="bg-[#ffeaea] border border-[#cc3333] text-[#cc3333] font-dm text-sm px-4 py-3 rounded mb-6">
              {errore}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>

  <div>
    <label className={labelClass}>Sport</label>
    <div className="flex gap-2 flex-wrap">
      {SPORT.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setSport(s)}
          className={`font-barlow font-bold text-sm uppercase px-4 py-2 rounded transition-colors ${
            sport === s
              ? 'bg-[#1a1a1a] text-[#e8ff47]'
              : 'bg-[#f5f2eb] text-[#1a1a1a] border border-[#e0ddd6] hover:border-[#1a1a1a]'
          }`}
        >
          {s}
        </button>
      ))}
    </div>
  </div>

  <div>
    <label className={labelClass}>Luogo</label>
    <input
      type="text"
      value={luogo}
      onChange={(e) => setLuogo(e.target.value)}
      placeholder="Es. Campo Sportivo Via Roma"
      className={inputClass}
      required
    />
  </div>

  <div>
    <label className={labelClass}>Data e ora</label>
    <input
      type="datetime-local"
      value={data}
      onChange={(e) => setData(e.target.value)}
      className={inputClass}
      required
    />
  </div>

  <div>
    <label className={labelClass}>Numero massimo giocatori</label>
    <input
      type="number"
      value={maxGiocatori}
      onChange={(e) => setMaxGiocatori(e.target.value)}
      min={2}
      max={22}
      className={inputClass}
      required
    />
  </div>

 <div className="flex gap-4 mt-2">
  <button
    type="button"
    onClick={() => navigate('/dashboard')}
    className="w-1/2 border-2 border-[#1a1a1a] text-[#1a1a1a] font-barlow font-bold text-lg uppercase py-4 rounded hover:bg-[#1a1a1a] hover:text-[#e8ff47] transition-all duration-200"
  >
    Annulla
  </button>
  <button
    type="submit"
    disabled={caricamento}
    className="w-1/2 bg-[#e8ff47] text-[#1a1a1a] font-barlow font-bold text-lg uppercase py-4 rounded hover:bg-[#c8df27] transition-all duration-200 disabled:opacity-50"
  >
    {caricamento ? 'Creazione...' : 'Crea partita'}
  </button>
</div>

</form>
        </div>
      </div>
    </div>
  )
}

export default CreaPartita