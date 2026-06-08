import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const SPORT = [
  'Calcio a 5', 'Calcio a 7', 'Calcio a 8', 'Calcio a 11',
  'Basket 3x3', 'Basket 5x5', 'Tennis', 'Padel', 'Pallavolo', 'Beach Volley'
]

function Partita() {
  const [partita, setPartita] = useState(null)
  const [voti, setVoti] = useState([])
  const [caricamento, setCaricamento] = useState(true)
  const [mioVoto, setMioVoto] = useState({})
  const [mvpVotato, setMvpVotato] = useState(null)
  const [mostraRisultato, setMostraRisultato] = useState(false)
  const [risultato, setRisultato] = useState('')
  const [squadraVincitrice, setSquadraVincitrice] = useState([])
  const [pareggio, setPareggio] = useState(false)
  const [cercaNome, setCercaNome] = useState('')
  const [risultatiRicerca, setRisultatiRicerca] = useState([])
  const [cercando, setCercando] = useState(false)
  const [modificando, setModificando] = useState(false)
  const [formModifica, setFormModifica] = useState({ sport: '', luogo: '', data: '', maxGiocatori: '' })
  const { id } = useParams()
  const { utente, token, aggiornaUtente } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!utente) { navigate('/login'); return }
    caricaDati()
  }, [id])

  const caricaDati = async () => {
    try {
      const [resPartita, resVoti] = await Promise.all([
        axios.get(`http://localhost:5002/api/partite/${id}`),
        axios.get(`http://localhost:5002/api/voti/partita/${id}`)
      ])
      setPartita(resPartita.data)
      setVoti(resVoti.data)
      setFormModifica({
        sport: resPartita.data.sport,
        luogo: resPartita.data.luogo,
        data: resPartita.data.data?.slice(0, 16),
        maxGiocatori: resPartita.data.maxGiocatori
      })
      const mioVotoMvp = resVoti.data.find(v => v.votante?._id === utente?.id)
      if (mioVotoMvp?.mvpVoto) setMvpVotato(mioVotoMvp.mvpVoto)
    } catch (error) {
      console.log('Errore nel caricamento')
    } finally {
      setCaricamento(false)
    }
  }

  const unisciti = async () => {
    try {
      await axios.post(
        `http://localhost:5002/api/partite/${id}/unisciti`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      caricaDati()
    } catch (error) {
      alert(error.response?.data?.messaggio || 'Errore')
    }
  }

  const modificaPartita = async () => {
    try {
      await axios.put(
        `http://localhost:5002/api/partite/${id}`,
        formModifica,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setModificando(false)
      caricaDati()
    } catch (error) {
      alert(error.response?.data?.messaggio || 'Errore')
    }
  }

  const eliminaPartita = async () => {
    if (!window.confirm('Sei sicuro di voler eliminare questa partita?')) return
    try {
      await axios.delete(
        `http://localhost:5002/api/partite/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      navigate('/dashboard')
    } catch (error) {
      alert(error.response?.data?.messaggio || 'Errore')
    }
  }

  const cambiaStato = async (nuovoStato) => {
    try {
      const body = { stato: nuovoStato }
      if (nuovoStato === 'terminata') {
        const perdenti = pareggio ? [] : partita.giocatori
          .map(g => g._id)
          .filter(gId => !squadraVincitrice.includes(gId))
        body.risultato = risultato
        body.vincitori = pareggio ? [] : squadraVincitrice
        body.perdenti = pareggio ? [] : perdenti
        body.pareggio = pareggio
      }
      await axios.put(
        `http://localhost:5002/api/partite/${id}/stato`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (nuovoStato === 'terminata') {
        if (pareggio) {
          aggiornaUtente({ pareggi: (utente.pareggi || 0) + 1 })
        } else {
          const sonoVincitore = squadraVincitrice.map(v => v.toString()).includes(utente?.id?.toString())
          aggiornaUtente({
            vittorie: sonoVincitore ? (utente.vittorie || 0) + 1 : (utente.vittorie || 0),
            sconfitte: !sonoVincitore ? (utente.sconfitte || 0) + 1 : (utente.sconfitte || 0)
          })
        }
      }
      setMostraRisultato(false)
      setPareggio(false)
      setSquadraVincitrice([])
      caricaDati()
    } catch (error) {
      alert(error.response?.data?.messaggio || 'Errore')
    }
  }

  const cercaUtenti = async (valore) => {
    setCercaNome(valore)
    if (valore.length < 2) { setRisultatiRicerca([]); return }
    setCercando(true)
    try {
      const risposta = await axios.get(
        `http://localhost:5002/api/partite/cerca-utenti?nome=${valore}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRisultatiRicerca(risposta.data)
    } catch (error) {
      console.log('Errore ricerca')
    } finally {
      setCercando(false)
    }
  }

  const invitaGiocatore = async (utenteId) => {
    try {
      await axios.post(
        `http://localhost:5002/api/partite/${id}/invita`,
        { utenteId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setCercaNome('')
      setRisultatiRicerca([])
      caricaDati()
    } catch (error) {
      alert(error.response?.data?.messaggio || 'Errore')
    }
  }

  const inviaVoto = async (votatoId) => {
    const punteggio = mioVoto[votatoId]
    if (!punteggio) return
    try {
      await axios.post(
        'http://localhost:5002/api/voti',
        { partitaId: id, votatoId, punteggio: Number(punteggio) },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      caricaDati()
    } catch (error) {
      alert(error.response?.data?.messaggio || 'Errore')
    }
  }

  const votaMvp = async (mvpId) => {
    try {
      await axios.post(
        'http://localhost:5002/api/voti/mvp',
        { partitaId: id, mvpId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMvpVotato(mvpId)
      caricaDati()
    } catch (error) {
      alert(error.response?.data?.messaggio || 'Errore')
    }
  }

  const getVotoGiocatore = (giocatoreId) => {
    return voti.find(v =>
      v.votato?._id === giocatoreId &&
      v.votante?._id === utente?.id
    )
  }

  const getMediaVoti = (giocatoreId) => {
    const votiGiocatore = voti.filter(v => v.votato?._id === giocatoreId)
    if (votiGiocatore.length === 0) return null
    const media = votiGiocatore.reduce((acc, v) => acc + v.punteggio, 0) / votiGiocatore.length
    return media.toFixed(1)
  }

  const vinciId = (partita?.vincitori || []).map(v => v?.toString())
  const sonoOrganizzatore = partita?.organizzatore?._id === utente?.id
  const sonoGiocatore = partita?.giocatori?.some(g => g._id === utente?.id)
  const possoUnirmi = !sonoGiocatore && partita?.stato === 'aperta' && partita?.giocatori?.length < partita?.maxGiocatori
  const hoVinto = vinciId.includes(utente?.id?.toString())
  const ePareggio = partita?.vincitori?.length === 0 && partita?.stato === 'terminata'

  const formatData = (data) => new Date(data).toLocaleDateString('it-IT', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  const inputClass = "w-full bg-[#f5f2eb] border border-[#e0ddd6] rounded px-4 py-2 font-dm text-[#1a1a1a] text-sm focus:outline-none focus:border-[#e8ff47]"
  const labelClass = "block font-barlow font-bold text-xs uppercase tracking-wide text-[#1a1a1a] mb-1"

  if (caricamento) return (
    <div className="min-h-screen bg-[#f5f2eb] flex items-center justify-center">
      <p className="font-barlow font-bold text-2xl uppercase text-[#1a1a1a]">Caricamento...</p>
    </div>
  )

  if (!partita) return (
    <div className="min-h-screen bg-[#f5f2eb] flex items-center justify-center">
      <p className="font-barlow font-bold text-2xl uppercase text-[#1a1a1a]">Partita non trovata</p>
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
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-6">
          <Link to="/dashboard" className="text-[#6b6b6b] text-sm font-dm hover:text-[#1a1a1a] transition-colors">
            Torna alle partite
          </Link>
        </div>

        <div className="bg-white border border-[#e0ddd6] rounded p-8 mb-6">
          {modificando ? (
            <div className="flex flex-col gap-4">
              <h2 className="font-barlow font-black text-2xl uppercase text-[#1a1a1a]">Modifica partita</h2>
              <div>
                <label className={labelClass}>Sport</label>
                <div className="flex gap-2 flex-wrap">
                  {SPORT.map((s) => (
                    <button key={s} type="button" onClick={() => setFormModifica({ ...formModifica, sport: s })}
                      className={`font-barlow font-bold text-xs uppercase px-3 py-1 rounded transition-colors ${
                        formModifica.sport === s ? 'bg-[#1a1a1a] text-[#e8ff47]' : 'bg-[#f5f2eb] text-[#1a1a1a] border border-[#e0ddd6] hover:border-[#1a1a1a]'
                      }`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className={labelClass}>Luogo</label>
                <input type="text" value={formModifica.luogo} onChange={(e) => setFormModifica({ ...formModifica, luogo: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Data e ora</label>
                <input type="datetime-local" value={formModifica.data} onChange={(e) => setFormModifica({ ...formModifica, data: e.target.value })} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Max giocatori</label>
                <input type="number" value={formModifica.maxGiocatori} onChange={(e) => setFormModifica({ ...formModifica, maxGiocatori: e.target.value })} min={partita.giocatori?.length} max={22} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Aggiungi giocatore</label>
                <input type="text" placeholder="Cerca per nome..." value={cercaNome} onChange={(e) => cercaUtenti(e.target.value)} className={inputClass} />
                {cercando && <p className="text-[#6b6b6b] text-xs font-dm mt-1">Ricerca in corso...</p>}
                {risultatiRicerca.length > 0 && (
                  <div className="bg-white border border-[#e0ddd6] rounded mt-1 shadow-lg">
                    {risultatiRicerca.map((u) => (
                      <div key={u._id} className="flex items-center justify-between px-4 py-3 hover:bg-[#f5f2eb] transition-colors border-b border-[#e0ddd6] last:border-0">
                        <div>
                          <p className="font-barlow font-bold text-sm uppercase text-[#1a1a1a]">{u.nome}</p>
                          <p className="text-[#6b6b6b] text-xs font-dm">{u.sport} — Rating: {Number(u.rating).toFixed(1)}</p>
                        </div>
                        <button onClick={() => invitaGiocatore(u._id)} className="bg-[#e8ff47] text-[#1a1a1a] font-barlow font-bold text-xs uppercase px-3 py-1 rounded hover:bg-[#c8df27] transition-colors">Aggiungi</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setModificando(false); setCercaNome(''); setRisultatiRicerca([]) }} className="border border-[#1a1a1a] text-[#1a1a1a] font-barlow font-bold text-sm uppercase px-4 py-2 rounded hover:bg-[#1a1a1a] hover:text-white transition-colors">Annulla</button>
                <button onClick={modificaPartita} className="bg-[#e8ff47] text-[#1a1a1a] font-barlow font-bold text-sm uppercase px-4 py-2 rounded hover:bg-[#c8df27] transition-colors">Salva modifiche</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="bg-[#1a1a1a] text-[#e8ff47] font-barlow font-bold text-xs uppercase px-3 py-1 rounded-sm tracking-wider">
                    {partita.sport}
                  </span>
                  <h1 className="font-barlow font-black text-4xl uppercase tracking-tight text-[#1a1a1a] mt-3">
                    {partita.luogo}
                  </h1>
                  <p className="text-[#6b6b6b] text-sm font-dm mt-1">{formatData(partita.data)}</p>
                  <p className="text-[#6b6b6b] text-sm font-dm mt-1">
                    Organizzatore: <span className="text-[#1a1a1a] font-semibold">{partita.organizzatore?.nome}</span>
                  </p>
                  {partita.risultato && (
                    <p className="font-barlow font-black text-2xl text-[#1a1a1a] mt-2 bg-[#e8ff47] px-3 py-1 rounded inline-block">
                      {partita.risultato}
                    </p>
                  )}
                  {partita.stato === 'terminata' && sonoGiocatore && (
                    <div className={`mt-3 px-4 py-2 rounded font-barlow font-bold text-sm uppercase ${
                      ePareggio ? 'bg-[#fff8e1] text-[#b8860b]' :
                      hoVinto ? 'bg-[#e8fff5] text-[#1a8a5a]' :
                      'bg-[#ffeaea] text-[#cc3333]'
                    }`}>
                      {ePareggio ? 'Pareggio!' : hoVinto ? 'Hai vinto questa partita!' : 'Hai perso questa partita'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`font-barlow font-bold text-xs uppercase px-3 py-1 rounded-sm tracking-wider ${
                    partita.stato === 'aperta' ? 'bg-[#e8fff5] text-[#1a8a5a]' :
                    partita.stato === 'in corso' ? 'bg-[#fff8e1] text-[#b8860b]' :
                    'bg-[#ffeaea] text-[#cc3333]'
                  }`}>
                    {partita.stato}
                  </span>
                  {sonoOrganizzatore && (
                    <div className="flex gap-2">
                      <button onClick={() => setModificando(true)} className="border border-[#1a1a1a] text-[#1a1a1a] font-barlow font-bold text-xs uppercase px-3 py-1 rounded hover:bg-[#1a1a1a] hover:text-white transition-colors">Modifica</button>
                      <button onClick={eliminaPartita} className="border border-[#cc3333] text-[#cc3333] font-barlow font-bold text-xs uppercase px-3 py-1 rounded hover:bg-[#cc3333] hover:text-white transition-colors">Elimina</button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 flex-wrap">
                {possoUnirmi && (
                  <button onClick={unisciti} className="bg-[#e8ff47] text-[#1a1a1a] font-barlow font-bold text-sm uppercase px-6 py-2 rounded hover:bg-[#c8df27] transition-colors">
                    Unisciti alla partita
                  </button>
                )}
                {sonoOrganizzatore && partita.stato === 'aperta' && (
                  <button onClick={() => cambiaStato('in corso')} className="bg-[#1a1a1a] text-white font-barlow font-bold text-sm uppercase px-6 py-2 rounded hover:opacity-80 transition-opacity">
                    Inizia partita
                  </button>
                )}
                {sonoOrganizzatore && partita.stato === 'in corso' && (
                  <div className="w-full">
                    {mostraRisultato ? (
                      <div className="bg-[#f5f2eb] border border-[#e0ddd6] rounded p-4">
                        <p className="font-barlow font-bold text-sm uppercase text-[#1a1a1a] mb-3">Seleziona il risultato</p>
                        <label className="flex items-center gap-3 cursor-pointer mb-4">
                          <input type="checkbox" checked={pareggio} onChange={(e) => { setPareggio(e.target.checked); if (e.target.checked) setSquadraVincitrice([]) }} className="w-4 h-4 accent-[#e8ff47]" />
                          <span className="font-dm text-sm font-semibold text-[#1a1a1a]">Pareggio</span>
                        </label>
                        {!pareggio && (
                          <div className="flex flex-col gap-2 mb-3">
                            <p className="text-[#6b6b6b] text-xs font-dm mb-1">Seleziona i vincitori:</p>
                            {partita.giocatori?.map((g) => (
                              <label key={g._id} className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={squadraVincitrice.includes(g._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) { setSquadraVincitrice([...squadraVincitrice, g._id]) }
                                    else { setSquadraVincitrice(squadraVincitrice.filter(i => i !== g._id)) }
                                  }}
                                  className="w-4 h-4 accent-[#e8ff47]" />
                                <span className="font-dm text-sm text-[#1a1a1a]">{g.nome}</span>
                              </label>
                            ))}
                          </div>
                        )}
                        <input type="text" placeholder="Risultato es. 3-2" value={risultato} onChange={(e) => setRisultato(e.target.value)} className="w-full bg-white border border-[#e0ddd6] rounded px-3 py-2 font-dm text-sm focus:outline-none focus:border-[#e8ff47] mb-3" />
                        <div className="flex gap-2">
                          <button onClick={() => setMostraRisultato(false)} className="border border-[#1a1a1a] text-[#1a1a1a] font-barlow font-bold text-xs uppercase px-4 py-2 rounded hover:bg-[#1a1a1a] hover:text-white transition-colors">Annulla</button>
                          <button onClick={() => cambiaStato('terminata')} className="bg-[#cc3333] text-white font-barlow font-bold text-xs uppercase px-4 py-2 rounded hover:opacity-80 transition-opacity">Conferma e termina</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setMostraRisultato(true)} className="bg-[#cc3333] text-white font-barlow font-bold text-sm uppercase px-6 py-2 rounded hover:opacity-80 transition-opacity">
                        Termina partita
                      </button>
                    )}
                  </div>
                )}
              </div>

              {sonoOrganizzatore && (
                <div className="mt-6 pt-6 border-t border-[#e0ddd6]">
                  <p className="font-barlow font-bold text-sm uppercase text-[#1a1a1a] mb-3">Invita un giocatore</p>
                  <div className="relative">
                    <input type="text" placeholder="Cerca per nome..." value={cercaNome} onChange={(e) => cercaUtenti(e.target.value)} className="w-full bg-[#f5f2eb] border border-[#e0ddd6] rounded px-4 py-2 font-dm text-sm focus:outline-none focus:border-[#e8ff47]" />
                    {cercando && <p className="text-[#6b6b6b] text-xs font-dm mt-1">Ricerca in corso...</p>}
                    {risultatiRicerca.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-[#e0ddd6] rounded mt-1 z-10 shadow-lg">
                        {risultatiRicerca.map((u) => (
                          <div key={u._id} className="flex items-center justify-between px-4 py-3 hover:bg-[#f5f2eb] transition-colors border-b border-[#e0ddd6] last:border-0">
                            <div>
                              <p className="font-barlow font-bold text-sm uppercase text-[#1a1a1a]">{u.nome}</p>
                              <p className="text-[#6b6b6b] text-xs font-dm">{u.sport} — Rating: {Number(u.rating).toFixed(1)}</p>
                            </div>
                            <button onClick={() => invitaGiocatore(u._id)} className="bg-[#e8ff47] text-[#1a1a1a] font-barlow font-bold text-xs uppercase px-3 py-1 rounded hover:bg-[#c8df27] transition-colors">Invita</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white border border-[#e0ddd6] rounded p-8">
          <h2 className="font-barlow font-black text-2xl uppercase tracking-tight text-[#1a1a1a] mb-2">
            Giocatori ({partita.giocatori?.length}/{partita.maxGiocatori})
          </h2>
          {partita.stato === 'terminata' && sonoGiocatore && (
            <p className="text-[#6b6b6b] text-xs font-dm mb-6">Vota la prestazione e scegli il tuo MVP</p>
          )}
          <div className="flex flex-col gap-2">
            {partita.giocatori?.map((giocatore) => {
              const votoGiaDato = getVotoGiocatore(giocatore._id)
              const media = getMediaVoti(giocatore._id)
              const sonoIo = giocatore._id === utente?.id
              const haVinto = vinciId.includes(giocatore._id?.toString())
              const eMvp = partita?.mvp?.toString() === giocatore._id?.toString()

              return (
                <div key={giocatore._id} className="flex items-center justify-between py-4 border-b border-[#e0ddd6] last:border-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-barlow font-bold text-lg uppercase text-[#1a1a1a]">
                        {giocatore.nome}
                        {sonoIo && <span className="text-[#6b6b6b] text-sm normal-case font-dm ml-2">(tu)</span>}
                      </p>
                      {eMvp && (
                        <span className="text-yellow-500 text-xl" title="MVP della partita">★</span>
                      )}
                      {partita.stato === 'terminata' && (
                        <span className={`font-barlow font-bold text-xs uppercase px-2 py-0.5 rounded-sm ${
                          ePareggio ? 'bg-[#fff8e1] text-[#b8860b]' :
                          haVinto ? 'bg-[#e8fff5] text-[#1a8a5a]' :
                          'bg-[#ffeaea] text-[#cc3333]'
                        }`}>
                          {ePareggio ? 'P' : haVinto ? 'V' : 'S'}
                        </span>
                      )}
                    </div>
                    <p className="text-[#6b6b6b] text-sm font-dm">Rating: {Number(giocatore.rating).toFixed(1)}</p>
                    {media && (
                      <p className="text-sm font-dm mt-1">
                        Voto partita: <span className="bg-[#e8ff47] font-barlow font-bold px-2 rounded">{media}</span>
                      </p>
                    )}
                  </div>

                  {partita.stato === 'terminata' && sonoGiocatore && !sonoIo && (
                    <div className="flex flex-col items-end gap-2">
                      {votoGiaDato ? (
                        <span className="bg-[#e8fff5] text-[#1a8a5a] font-barlow font-bold text-sm uppercase px-3 py-1 rounded-sm">
                          Votato: {votoGiaDato.punteggio}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={1}
                            max={10}
                            placeholder="1-10"
                            value={mioVoto[giocatore._id] || ''}
                            onChange={(e) => setMioVoto({ ...mioVoto, [giocatore._id]: e.target.value })}
                            className="w-16 bg-[#f5f2eb] border border-[#e0ddd6] rounded px-2 py-1 text-center font-dm text-sm focus:outline-none focus:border-[#e8ff47]"
                          />
                          <button onClick={() => inviaVoto(giocatore._id)} className="bg-[#e8ff47] text-[#1a1a1a] font-barlow font-bold text-xs uppercase px-3 py-1 rounded hover:bg-[#c8df27] transition-colors">
                            Vota
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => votaMvp(giocatore._id)}
                        className={`font-barlow font-bold text-xs uppercase px-3 py-1 rounded transition-colors ${
                          mvpVotato === giocatore._id
                            ? 'bg-[#1a1a1a] text-[#e8ff47]'
                            : 'border border-[#e0ddd6] text-[#6b6b6b] hover:border-[#1a1a1a] hover:text-[#1a1a1a]'
                        }`}
                      >
                        {mvpVotato === giocatore._id ? '★ MVP scelto' : 'Vota MVP'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Partita