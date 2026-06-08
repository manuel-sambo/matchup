import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [utente, setUtente] = useState(
    JSON.parse(localStorage.getItem('utente')) || null
  )
  const [token, setToken] = useState(
    localStorage.getItem('token') || null
  )

  const login = (datiUtente, tokenRicevuto) => {
    setUtente(datiUtente)
    setToken(tokenRicevuto)
    localStorage.setItem('utente', JSON.stringify(datiUtente))
    localStorage.setItem('token', tokenRicevuto)
  }

  const aggiornaUtente = (nuoviDati) => {
    const utenteAggiornato = { ...utente, ...nuoviDati }
    setUtente(utenteAggiornato)
    localStorage.setItem('utente', JSON.stringify(utenteAggiornato))
  }

  const logout = () => {
    setUtente(null)
    setToken(null)
    localStorage.removeItem('utente')
    localStorage.removeItem('token')
  }

  return (
    <AuthContext.Provider value={{ utente, token, login, logout, aggiornaUtente }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)