import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Partita from './pages/Partita'
import Classifica from './pages/Classifica'
import Profilo from './pages/Profilo'
import CreaPartita from './pages/CreaPartita'
import ProfiloUtente from './pages/ProfiloUtente'
import { AuthProvider } from './context/AuthContext'
import Splashscreen from './components/Splashscreen'

function App() {
  const [splashFinito, setSplashFinito] = useState(false)

  return (
    <AuthProvider>
      {!splashFinito && <Splashscreen onComplete={() => setSplashFinito(true)} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/partita/:id" element={<Partita />} />
          <Route path="/classifica" element={<Classifica />} />
          <Route path="/profilo" element={<Profilo />} />
          <Route path="/crea-partita" element={<CreaPartita />} />
          <Route path="/utente/:id" element={<ProfiloUtente />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App