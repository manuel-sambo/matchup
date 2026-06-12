import { useEffect, useState } from 'react'

function SplashScreen({ onComplete }) {
  const [fase, setFase] = useState('entra')

  useEffect(() => {
    const t1 = setTimeout(() => setFase('esce'), 1800)
    const t2 = setTimeout(() => onComplete(), 2600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className={`fixed inset-0 bg-[#1a1a1a] z-50 flex items-center justify-center transition-opacity duration-700 ${
      fase === 'esce' ? 'opacity-0 pointer-events-none' : 'opacity-100'
    }`}>
      <div className="text-center">
        <div className={`transition-all duration-700 ${
          fase === 'entra' ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <h1 className="font-barlow font-black text-8xl uppercase tracking-tight text-white mb-2">
            Match<span className="bg-[#e8ff47] text-[#1a1a1a] px-3">Up</span>
          </h1>
          <div className="flex justify-center gap-2 mt-8">
            <div className="w-2 h-2 bg-[#e8ff47] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-[#e8ff47] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-[#e8ff47] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SplashScreen