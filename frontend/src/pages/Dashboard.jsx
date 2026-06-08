import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { io } from 'socket.io-client'

const socket = io('https://matchup-backend-8kmk.onrender.com')

function Dashboard() {
  const [partite, setPartite] = useState([])
  const [caricamento, setCaricamento] = useState(true)
  const { utente, token, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!utente) {
      navigate('/login')
      return
    }
    caricaPartite()

    socket.on('nuova_partita', (partita) => {
      setPartite((prev) => [partita, ...prev])
    })

    socket.on('partita_aggiornata', (partitaAggiornata) => {
      setPartite((prev) =>
        prev.map((p) => p._id === partitaAggiornata._id ? partitaAggiornata : p)
      )
    })

    return () => {
      socket.off('nuova_partita')
      socket.off('partita_aggiornata')
    }
  }, [])

  const caricaPartite = async () => {
    try {
      const risposta = await axios.get('https://matchup-backend-8kmk.onrender.com/api/partite')
      setPartite(risposta.data)
    } catch (error) {
      console.log('Errore nel caricamento partite')
    } finally {
      setCaricamento(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatData = (data) => {
    return new Date(data).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

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
          <button
            onClick={handleLogout}
            className="bg-[#e8ff47] text-[#1a1a1a] font-dm font-semibold text-sm px-4 py-2 rounded hover:bg-[#c8df27] transition-colors ml-2"
          >
            Esci
          </button>
        </div>
      </nav>

      {/* CONTENUTO */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-barlow font-black text-5xl uppercase tracking-tight text-[#1a1a1a]">
              Partite
            </h1>
            <p className="text-[#6b6b6b] text-sm font-dm mt-1">
              Ciao {utente?.nome}, trova una partita o creane una nuova
            </p>
          </div>
          <Link
            to="/crea-partita"
            className="bg-[#e8ff47] text-[#1a1a1a] font-barlow font-bold text-lg uppercase px-6 py-3 rounded hover:bg-[#c8df27] transition-colors"
          >
            + Nuova partita
          </Link>
        </div>

        {/* LISTA PARTITE */}
        {caricamento ? (
          <p className="text-[#6b6b6b] font-dm">Caricamento...</p>
        ) : partite.length === 0 ? (
          <div className="bg-white border border-[#e0ddd6] rounded p-12 text-center">
            <p className="font-barlow font-black text-2xl uppercase text-[#1a1a1a] mb-2">
              Nessuna partita
            </p>
            <p className="text-[#6b6b6b] text-sm font-dm">
              Sii il primo a crearne una
            </p>
          </div>
        ) : (
          partite.map((partita) => (
            <div
              key={partita._id}
              onClick={() => navigate(`/partita/${partita._id}`)}
              className="bg-white border border-[#e0ddd6] rounded p-6 mb-3 cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-[#1a1a1a] text-[#e8ff47] font-barlow font-bold text-xs uppercase px-3 py-1 rounded-sm tracking-wider">
                    {partita.sport}
                  </span>
                  <h3 className="font-barlow font-bold text-2xl uppercase tracking-tight text-[#1a1a1a] mt-3 mb-1">
                    {partita.luogo}
                  </h3>
                  <p className="text-[#6b6b6b] text-sm font-dm">{formatData(partita.data)}</p>
                  <p className="text-[#6b6b6b] text-sm font-dm mt-1">
                    Organizzatore: <span className="text-[#1a1a1a] font-semibold">{partita.organizzatore?.nome}</span>
                  </p>
                </div>
                <span className={`font-barlow font-bold text-xs uppercase px-3 py-1 rounded-sm tracking-wider ${
                  partita.stato === 'aperta' ? 'bg-[#e8fff5] text-[#1a8a5a]' :
                  partita.stato === 'in corso' ? 'bg-[#fff8e1] text-[#b8860b]' :
                  'bg-[#ffeaea] text-[#cc3333]'
                }`}>
                  {partita.stato}
                </span>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#e0ddd6]">
                <div className="flex gap-2 flex-wrap">
                  {partita.giocatori?.map((g) => (
                    <span key={g._id} className="bg-[#f5f2eb] text-[#1a1a1a] text-xs font-dm px-3 py-1 rounded-sm border border-[#e0ddd6]">
                      {g.nome}
                    </span>
                  ))}
                </div>
                <p className="text-[#6b6b6b] text-sm font-dm">
                  {partita.giocatori?.length}/{partita.maxGiocatori} giocatori
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Dashboard