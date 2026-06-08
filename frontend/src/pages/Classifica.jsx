import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

function Classifica() {
  const [giocatori, setGiocatori] = useState([])
  const [caricamento, setCaricamento] = useState(true)
  const { utente, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!utente) { navigate('/login'); return }
    caricaClassifica()
  }, [])

  const caricaClassifica = async () => {
    try {
      const risposta = await axios.get('https://matchup-backend-8kmk.onrender.com/api/voti/classifica')
      setGiocatori(risposta.data)
    } catch (error) {
      console.log('Errore nel caricamento classifica')
    } finally {
      setCaricamento(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const PodioCard = ({ giocatore, posizione }) => {
    const altezza = posizione === 1 ? 'h-40' : posizione === 2 ? 'h-32' : 'h-24'
    const dimensioneTesto = posizione === 1 ? 'text-5xl' : 'text-3xl'
    const sfondoPosizione = posizione === 1 ? 'bg-[#e8ff47] text-[#1a1a1a]' : 'bg-[#2a2a2a] text-white'

    return (
      <div
        onClick={() => giocatore._id !== utente?.id && navigate(`/utente/${giocatore._id}`)}
        className={`flex flex-col items-center justify-end cursor-pointer group`}
      >
        <div className="flex flex-col items-center mb-2">
          <div className="w-12 h-12 bg-[#e8ff47] rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <span className="font-barlow font-black text-lg text-[#1a1a1a]">
              {giocatore.nome?.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <p className="font-barlow font-bold text-sm uppercase text-[#1a1a1a] text-center">{giocatore.nome}</p>
          <p className="text-[#6b6b6b] text-xs font-dm">{giocatore.sport}</p>
          <p className="font-barlow font-black text-2xl bg-[#e8ff47] text-[#1a1a1a] px-3 py-0.5 rounded mt-1">
            {Number(giocatore.rating).toFixed(1)}
          </p>
        </div>
        <div className={`w-full ${altezza} ${sfondoPosizione} rounded-t flex items-center justify-center`}>
          <span className={`font-barlow font-black ${dimensioneTesto}`}>
            {posizione === 1 ? '1°' : posizione === 2 ? '2°' : '3°'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f2eb]">
      <nav className="bg-[#1a1a1a] h-[60px] flex items-center justify-between px-8 sticky top-0 z-50">
        <span className="font-barlow font-black text-2xl uppercase text-white tracking-tight">
          Match<span className="bg-[#e8ff47] text-[#1a1a1a] px-1">Up</span>
        </span>
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="text-[#aaaaaa] hover:text-white text-sm font-dm px-4 py-2 rounded hover:bg-white/10 transition-colors">Partite</Link>
          <Link to="/classifica" className="text-white text-sm font-dm px-4 py-2 rounded bg-white/10">Classifica</Link>
          <Link to="/profilo" className="text-[#aaaaaa] hover:text-white text-sm font-dm px-4 py-2 rounded hover:bg-white/10 transition-colors">Profilo</Link>
          <button onClick={handleLogout} className="bg-[#e8ff47] text-[#1a1a1a] font-dm font-semibold text-sm px-4 py-2 rounded hover:bg-[#c8df27] transition-colors ml-2">Esci</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="font-barlow font-black text-5xl uppercase tracking-tight text-[#1a1a1a]">
            Classifica
          </h1>
          <p className="text-[#6b6b6b] text-sm font-dm mt-1">
            I migliori giocatori per rating globale
          </p>
        </div>

        {/* PODIO TOP 3 */}
        {!caricamento && giocatori.length >= 3 && (
          <div className="bg-white border border-[#e0ddd6] rounded p-8 mb-6">
            <p className="font-barlow font-bold text-xs uppercase tracking-wider text-[#6b6b6b] mb-6">Podio</p>
            <div className="grid grid-cols-3 gap-4 items-end">
              <PodioCard giocatore={giocatori[1]} posizione={2} />
              <PodioCard giocatore={giocatori[0]} posizione={1} />
              <PodioCard giocatore={giocatori[2]} posizione={3} />
            </div>
          </div>
        )}

        {/* LISTA COMPLETA */}
        {caricamento ? (
          <p className="text-[#6b6b6b] font-dm">Caricamento...</p>
        ) : giocatori.length === 0 ? (
          <div className="bg-white border border-[#e0ddd6] rounded p-12 text-center">
            <p className="font-barlow font-black text-2xl uppercase text-[#1a1a1a]">Nessun giocatore</p>
          </div>
        ) : (
          <div className="bg-white border border-[#e0ddd6] rounded p-6">
            <p className="font-barlow font-bold text-xs uppercase tracking-wider text-[#6b6b6b] mb-4">Classifica completa</p>
            {giocatori.map((giocatore, index) => (
              <div
                key={giocatore._id}
                onClick={() => giocatore._id !== utente?.id && navigate(`/utente/${giocatore._id}`)}
                className={`flex items-center gap-6 py-4 border-b border-[#e0ddd6] last:border-0 transition-all ${
                  giocatore._id === utente?.id ? 'bg-[#f5f2eb] px-3 rounded' : 'cursor-pointer hover:bg-[#f5f2eb] px-3 rounded'
                }`}
              >
                <span className={`font-barlow font-black text-2xl min-w-[40px] ${
                  index === 0 ? 'text-[#1a1a1a] bg-[#e8ff47] px-2 rounded' : 'text-[#6b6b6b]'
                }`}>
                  {index + 1}
                </span>
                <div className="w-10 h-10 bg-[#1a1a1a] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="font-barlow font-black text-sm text-[#e8ff47]">
                    {giocatore.nome?.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-barlow font-bold text-xl uppercase text-[#1a1a1a]">
                    {giocatore.nome}
                    {giocatore._id === utente?.id && (
                      <span className="text-[#6b6b6b] text-sm normal-case font-dm ml-2">(tu)</span>
                    )}
                  </p>
                  <p className="text-[#6b6b6b] text-xs font-dm">{giocatore.sport}</p>
                </div>
                <div className="text-right">
                  <p className="font-barlow font-black text-2xl text-[#1a1a1a] bg-[#e8ff47] px-3 py-1 rounded">
                    {Number(giocatore.rating).toFixed(1)}
                  </p>
                  <p className="text-[#6b6b6b] text-xs font-dm mt-1">
                    {giocatore.vittorie}V · {giocatore.sconfitte}S
                    {giocatore.mvp > 0 && <span className="text-yellow-500 ml-1">· {giocatore.mvp}★</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Classifica