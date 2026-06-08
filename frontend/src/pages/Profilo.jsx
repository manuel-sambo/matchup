import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const SPORT = [
  'Calcio a 5', 'Calcio a 7', 'Calcio a 8', 'Calcio a 11',
  'Basket 3x3', 'Basket 5x5', 'Tennis', 'Padel', 'Pallavolo', 'Beach Volley'
]

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

function Profilo() {
  const [partiteGiocate, setPartiteGiocate] = useState([])
  const [mediaVoti, setMediaVoti] = useState(null)
  const [vittorie, setVittorie] = useState(0)
  const [sconfitte, setSconfitte] = useState(0)
  const [pareggi, setPareggi] = useState(0)
  const [mvpCount, setMvpCount] = useState(0)
  const [caricamento, setCaricamento] = useState(true)
  const [modificando, setModificando] = useState(false)
  const [nome, setNome] = useState('')
  const [sport, setSport] = useState('')
  const [citta, setCitta] = useState('')
  const [eta, setEta] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [messaggio, setMessaggio] = useState('')
  const { utente, token, logout, login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!utente) { navigate('/login'); return }
    setNome(utente.nome)
    setSport(utente.sport)
    setCitta(utente.citta || '')
    setEta(utente.eta || '')
    caricaDati(utente.id)
  }, [])

  const caricaDati = async (userId) => {
    try {
      const [resPartite, resClassifica] = await Promise.all([
        axios.get('https://matchup-backend-8kmk.onrender.com/api/partite'),
        axios.get('https://matchup-backend-8kmk.onrender.com/api/voti/classifica')
      ])
      const miePartite = resPartite.data.filter(p =>
        p.giocatori.some(g => g._id.toString() === userId.toString())
      )
      setPartiteGiocate(miePartite)
      const mioProfilo = resClassifica.data.find(g => g._id.toString() === userId.toString())
      if (mioProfilo) {
        setMediaVoti(Number(mioProfilo.rating).toFixed(1))
        setVittorie(mioProfilo.vittorie || 0)
        setSconfitte(mioProfilo.sconfitte || 0)
        setPareggi(mioProfilo.pareggi || 0)
        setMvpCount(mioProfilo.mvp || 0)
      }
    } catch (error) {
      console.log('Errore nel caricamento')
    } finally {
      setCaricamento(false)
    }
  }

  const salvaProfilo = async () => {
    if (!nome) return
    setSalvando(true)
    try {
      const risposta = await axios.put(
        'https://matchup-backend-8kmk.onrender.com/api/auth/profilo',
        { nome, sport, citta, eta: eta ? Number(eta) : null },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      login(risposta.data.utente, token)
      setMessaggio('Profilo aggiornato')
      setModificando(false)
      caricaDati(utente.id)
      setTimeout(() => setMessaggio(''), 3000)
    } catch (error) {
      setMessaggio(error.response?.data?.messaggio || 'Errore')
    } finally {
      setSalvando(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatData = (data) => new Date(data).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-[#f5f2eb]">
      <nav className="bg-[#1a1a1a] h-[60px] flex items-center justify-between px-8 sticky top-0 z-50">
        <span className="font-barlow font-black text-2xl uppercase text-white tracking-tight">
          Match<span className="bg-[#e8ff47] text-[#1a1a1a] px-1">Up</span>
        </span>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-[#aaaaaa] hover:text-white text-sm font-dm px-4 py-2 rounded hover:bg-white/10 transition-colors">Partite</Link>
          <Link to="/classifica" className="text-[#aaaaaa] hover:text-white text-sm font-dm px-4 py-2 rounded hover:bg-white/10 transition-colors">Classifica</Link>
          <Link to="/profilo" className="text-white text-sm font-dm px-4 py-2 rounded bg-white/10">Profilo</Link>
          <button onClick={handleLogout} className="bg-[#e8ff47] text-[#1a1a1a] font-dm font-semibold text-sm px-4 py-2 rounded hover:bg-[#c8df27] transition-colors ml-2">Esci</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        {messaggio && (
          <div className="bg-[#e8fff5] border border-[#1a8a5a] text-[#1a8a5a] font-dm text-sm px-4 py-3 rounded mb-6">
            {messaggio}
          </div>
        )}

        <div className="bg-[#1a1a1a] rounded p-8 mb-6">
          {modificando ? (
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[#aaaaaa] text-xs font-dm uppercase tracking-wider mb-2 block">Nome</label>
                <input type="text" value={nome} onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded px-4 py-3 font-dm text-white text-sm focus:outline-none focus:border-[#e8ff47]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[#aaaaaa] text-xs font-dm uppercase tracking-wider mb-2 block">Città</label>
                  <input type="text" value={citta} onChange={(e) => setCitta(e.target.value)} placeholder="Es. Milano"
                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded px-4 py-3 font-dm text-white text-sm focus:outline-none focus:border-[#e8ff47]" />
                </div>
                <div>
                  <label className="text-[#aaaaaa] text-xs font-dm uppercase tracking-wider mb-2 block">Età</label>
                  <input type="number" value={eta} onChange={(e) => setEta(e.target.value)} placeholder="Es. 22" min={10} max={99}
                    className="w-full bg-[#2a2a2a] border border-[#3a3a3a] rounded px-4 py-3 font-dm text-white text-sm focus:outline-none focus:border-[#e8ff47]" />
                </div>
              </div>
              <div>
                <label className="text-[#aaaaaa] text-xs font-dm uppercase tracking-wider mb-2 block">Sport preferito</label>
                <div className="flex gap-2 flex-wrap">
                  {SPORT.map((s) => (
                    <button key={s} type="button" onClick={() => setSport(s)}
                      className={`font-barlow font-bold text-xs uppercase px-3 py-1 rounded transition-colors ${
                        sport === s ? 'bg-[#e8ff47] text-[#1a1a1a]' : 'bg-[#2a2a2a] text-[#aaaaaa] border border-[#3a3a3a] hover:border-[#e8ff47]'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setModificando(false)} className="border border-[#3a3a3a] text-[#aaaaaa] font-barlow font-bold text-sm uppercase px-4 py-2 rounded hover:border-white hover:text-white transition-colors">
                  Annulla
                </button>
                <button onClick={salvaProfilo} disabled={salvando} className="bg-[#e8ff47] text-[#1a1a1a] font-barlow font-bold text-sm uppercase px-4 py-2 rounded hover:bg-[#c8df27] transition-colors disabled:opacity-50">
                  {salvando ? 'Salvataggio...' : 'Salva'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-[#e8ff47] rounded-full flex items-center justify-center flex-shrink-0">
                  <AvatarSport sport={utente?.sport} />
                </div>
                <div>
                  <p className="text-[#aaaaaa] text-xs font-dm uppercase tracking-wider mb-1">Il tuo profilo</p>
                  <h1 className="font-barlow font-black text-4xl uppercase tracking-tight text-white">
                    {utente?.nome}
                  </h1>
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <p className="text-[#aaaaaa] text-sm font-dm">{utente?.sport}</p>
                    {utente?.citta && <p className="text-[#aaaaaa] text-sm font-dm">· {utente.citta}</p>}
                    {utente?.eta && <p className="text-[#aaaaaa] text-sm font-dm">· {utente.eta} anni</p>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-[#aaaaaa] text-xs font-dm uppercase tracking-wider mb-1">Rating</p>
                  <p className="font-barlow font-black text-5xl bg-[#e8ff47] text-[#1a1a1a] px-4 py-1 rounded">
                    {mediaVoti || Number(utente?.rating || 5).toFixed(1)}
                  </p>
                </div>
                <button onClick={() => setModificando(true)} className="border border-[#3a3a3a] text-[#aaaaaa] font-barlow font-bold text-sm uppercase px-4 py-2 rounded hover:border-[#e8ff47] hover:text-[#e8ff47] transition-colors">
                  Modifica
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-[#e0ddd6] rounded p-6 text-center">
            <p className="font-barlow font-black text-4xl text-[#1a1a1a]">{partiteGiocate.length}</p>
            <p className="text-[#6b6b6b] text-xs font-dm uppercase tracking-wide mt-1">Partite</p>
          </div>
          <div className="bg-white border border-[#e0ddd6] rounded p-6 text-center">
            <p className="font-barlow font-black text-4xl text-[#1a8a5a]">{vittorie}</p>
            <p className="text-[#6b6b6b] text-xs font-dm uppercase tracking-wide mt-1">Vittorie</p>
          </div>
          <div className="bg-white border border-[#e0ddd6] rounded p-6 text-center">
            <p className="font-barlow font-black text-4xl text-[#cc3333]">{sconfitte}</p>
            <p className="text-[#6b6b6b] text-xs font-dm uppercase tracking-wide mt-1">Sconfitte</p>
          </div>
          <div className="bg-white border border-[#e0ddd6] rounded p-6 text-center">
            <p className="font-barlow font-black text-4xl text-[#b8860b]">{pareggi}</p>
            <p className="text-[#6b6b6b] text-xs font-dm uppercase tracking-wide mt-1">Pareggi</p>
          </div>
          <div className="bg-white border border-[#e0ddd6] rounded p-6 text-center">
            <p className="font-barlow font-black text-4xl text-yellow-500">{mvpCount}</p>
            <p className="text-[#6b6b6b] text-xs font-dm uppercase tracking-wide mt-1">★ MVP</p>
          </div>
        </div>

        <div className="bg-white border border-[#e0ddd6] rounded p-8">
          <h2 className="font-barlow font-black text-2xl uppercase tracking-tight text-[#1a1a1a] mb-6">
            Le tue partite
          </h2>
          {caricamento ? (
            <p className="text-[#6b6b6b] font-dm">Caricamento...</p>
          ) : partiteGiocate.length === 0 ? (
            <p className="text-[#6b6b6b] font-dm">Non hai ancora partecipato a nessuna partita.</p>
          ) : (
            partiteGiocate.map((partita) => (
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

export default Profilo