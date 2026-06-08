import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const AvatarSport = ({ sport }) => {
  const calcio = (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <circle cx="40" cy="40" r="32" fill="white"/>
      <circle cx="40" cy="40" r="28" stroke="#1a1a1a" strokeWidth="3" fill="none"/>
      <polygon points="40,18 49,32 62,32 53,43 57,57 40,48 23,57 27,43 18,32 31,32" fill="#1a1a1a" opacity="0.8"/>
    </svg>
  )
  const basket = (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <circle cx="40" cy="40" r="32" fill="white"/>
      <circle cx="40" cy="40" r="28" stroke="#1a1a1a" strokeWidth="3" fill="none"/>
      <path d="M12 40 Q40 20 68 40" stroke="#1a1a1a" strokeWidth="2.5" fill="none"/>
      <path d="M12 40 Q40 60 68 40" stroke="#1a1a1a" strokeWidth="2.5" fill="none"/>
      <line x1="40" y1="12" x2="40" y2="68" stroke="#1a1a1a" strokeWidth="2.5"/>
    </svg>
  )
  const tennis = (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <circle cx="40" cy="40" r="32" fill="white"/>
      <circle cx="40" cy="40" r="28" stroke="#1a1a1a" strokeWidth="3" fill="none"/>
      <path d="M16 24 Q40 40 16 56" stroke="#1a1a1a" strokeWidth="2.5" fill="none"/>
      <path d="M64 24 Q40 40 64 56" stroke="#1a1a1a" strokeWidth="2.5" fill="none"/>
    </svg>
  )
  const pallavolo = (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <circle cx="40" cy="40" r="32" fill="white"/>
      <circle cx="40" cy="40" r="28" stroke="#1a1a1a" strokeWidth="3" fill="none"/>
      <path d="M14 34 Q40 14 66 34" stroke="#1a1a1a" strokeWidth="2.5" fill="none"/>
      <path d="M14 46 Q40 66 66 46" stroke="#1a1a1a" strokeWidth="2.5" fill="none"/>
      <line x1="40" y1="12" x2="40" y2="68" stroke="#1a1a1a" strokeWidth="2.5"/>
    </svg>
  )

  const mappa = {
    'Calcio a 5': calcio,
    'Calcio a 7': calcio,
    'Calcio a 8': calcio,
    'Calcio a 11': calcio,
    'Basket 3x3': basket,
    'Basket 5x5': basket,
    'Tennis': tennis,
    'Padel': tennis,
    'Pallavolo': pallavolo,
    'Beach Volley': pallavolo,
  }

  return mappa[sport] || (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <circle cx="40" cy="40" r="32" fill="white"/>
      <circle cx="40" cy="40" r="28" stroke="#1a1a1a" strokeWidth="3" fill="none"/>
      <circle cx="40" cy="40" r="8" fill="#1a1a1a"/>
    </svg>
  )
}

function ProfiloUtente() {
  const [utenteVisto, setUtenteVisto] = useState(null)
  const [partite, setPartite] = useState([])
  const [caricamento, setCaricamento] = useState(true)
  const { id } = useParams()
  const { utente, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!utente) { navigate('/login'); return }
    caricaDati()
  }, [id])

  const caricaDati = async () => {
    try {
      const [resUtente, resPartite] = await Promise.all([
        axios.get(`http://localhost:5002/api/auth/utente/${id}`),
        axios.get('http://localhost:5002/api/partite')
      ])
      setUtenteVisto(resUtente.data)
      const partiteUtente = resPartite.data.filter(p =>
        p.giocatori.some(g => g._id.toString() === id.toString())
      )
      setPartite(partiteUtente)
    } catch (error) {
      console.log('Errore caricamento')
    } finally {
      setCaricamento(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatData = (data) => new Date(data).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  if (caricamento) return (
    <div className="min-h-screen bg-[#f5f2eb] flex items-center justify-center">
      <p className="font-barlow font-bold text-2xl uppercase">Caricamento...</p>
    </div>
  )

  if (!utenteVisto) return (
    <div className="min-h-screen bg-[#f5f2eb] flex items-center justify-center">
      <p className="font-barlow font-bold text-2xl uppercase">Utente non trovato</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f5f2eb]">
      <nav className="bg-[#1a1a1a] h-[60px] flex items-center justify-between px-8 sticky top-0 z-50">
        <span className="font-barlow font-black text-2xl uppercase text-white tracking-tight">
          Match<span className="bg-[#e8ff47] text-[#1a1a1a] px-1">Up</span>
        </span>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-[#aaaaaa] hover:text-white text-sm font-dm px-4 py-2 rounded hover:bg-white/10 transition-colors">Partite</Link>
          <Link to="/classifica" className="text-[#aaaaaa] hover:text-white text-sm font-dm px-4 py-2 rounded hover:bg-white/10 transition-colors">Classifica</Link>
          <Link to="/profilo" className="text-[#aaaaaa] hover:text-white text-sm font-dm px-4 py-2 rounded hover:bg-white/10 transition-colors">Profilo</Link>
          <button onClick={handleLogout} className="bg-[#e8ff47] text-[#1a1a1a] font-dm font-semibold text-sm px-4 py-2 rounded hover:bg-[#c8df27] transition-colors ml-2">Esci</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link to="/classifica" className="text-[#6b6b6b] text-sm font-dm hover:text-[#1a1a1a] transition-colors">
            Torna alla classifica
          </Link>
        </div>

        <div className="bg-[#1a1a1a] rounded p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-[#e8ff47] rounded-full flex items-center justify-center flex-shrink-0">
                <AvatarSport sport={utenteVisto.sport} />
              </div>
              <div>
                <p className="text-[#aaaaaa] text-xs font-dm uppercase tracking-wider mb-1">Profilo giocatore</p>
                <h1 className="font-barlow font-black text-4xl uppercase tracking-tight text-white">
                  {utenteVisto.nome}
                </h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <p className="text-[#aaaaaa] text-sm font-dm">{utenteVisto.sport}</p>
                  {utenteVisto.citta && <p className="text-[#aaaaaa] text-sm font-dm">· {utenteVisto.citta}</p>}
                  {utenteVisto.eta && <p className="text-[#aaaaaa] text-sm font-dm">· {utenteVisto.eta} anni</p>}
                </div>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[#aaaaaa] text-xs font-dm uppercase tracking-wider mb-1">Rating</p>
              <p className="font-barlow font-black text-5xl bg-[#e8ff47] text-[#1a1a1a] px-4 py-1 rounded">
                {Number(utenteVisto.rating).toFixed(1)}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-[#e0ddd6] rounded p-6 text-center">
            <p className="font-barlow font-black text-4xl text-[#1a1a1a]">{partite.length}</p>
            <p className="text-[#6b6b6b] text-xs font-dm uppercase tracking-wide mt-1">Partite</p>
          </div>
          <div className="bg-white border border-[#e0ddd6] rounded p-6 text-center">
            <p className="font-barlow font-black text-4xl text-[#1a8a5a]">{utenteVisto.vittorie || 0}</p>
            <p className="text-[#6b6b6b] text-xs font-dm uppercase tracking-wide mt-1">Vittorie</p>
          </div>
          <div className="bg-white border border-[#e0ddd6] rounded p-6 text-center">
            <p className="font-barlow font-black text-4xl text-[#cc3333]">{utenteVisto.sconfitte || 0}</p>
            <p className="text-[#6b6b6b] text-xs font-dm uppercase tracking-wide mt-1">Sconfitte</p>
          </div>
          <div className="bg-white border border-[#e0ddd6] rounded p-6 text-center">
            <p className="font-barlow font-black text-4xl text-[#b8860b]">{utenteVisto.pareggi || 0}</p>
            <p className="text-[#6b6b6b] text-xs font-dm uppercase tracking-wide mt-1">Pareggi</p>
          </div>
          <div className="bg-white border border-[#e0ddd6] rounded p-6 text-center">
            <p className="font-barlow font-black text-4xl text-yellow-500">{utenteVisto.mvp || 0}</p>
            <p className="text-[#6b6b6b] text-xs font-dm uppercase tracking-wide mt-1">★ MVP</p>
          </div>
        </div>

        <div className="bg-white border border-[#e0ddd6] rounded p-8">
          <h2 className="font-barlow font-black text-2xl uppercase tracking-tight text-[#1a1a1a] mb-6">
            Partite giocate
          </h2>
          {partite.length === 0 ? (
            <p className="text-[#6b6b6b] font-dm">Nessuna partita ancora.</p>
          ) : (
            partite.map((partita) => (
              <div key={partita._id} onClick={() => navigate(`/partita/${partita._id}`)}
                className="flex items-center justify-between py-4 border-b border-[#e0ddd6] last:border-0 cursor-pointer hover:bg-[#f5f2eb] px-2 rounded transition-colors">
                <div>
                  <span className="bg-[#1a1a1a] text-[#e8ff47] font-barlow font-bold text-xs uppercase px-2 py-0.5 rounded-sm tracking-wider mr-2">
                    {partita.sport}
                  </span>
                  <span className="font-barlow font-bold text-lg uppercase text-[#1a1a1a]">{partita.luogo}</span>
                  <p className="text-[#6b6b6b] text-xs font-dm mt-1">{formatData(partita.data)}</p>
                </div>
                <span className={`font-barlow font-bold text-xs uppercase px-3 py-1 rounded-sm ${
                  partita.stato === 'aperta' ? 'bg-[#e8fff5] text-[#1a8a5a]' :
                  partita.stato === 'in corso' ? 'bg-[#fff8e1] text-[#b8860b]' :
                  'bg-[#ffeaea] text-[#cc3333]'
                }`}>
                  {partita.stato}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ProfiloUtente