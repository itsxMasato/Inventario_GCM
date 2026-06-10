import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import auth from '../lib/auth'

export default function WelcomeScreen() {
  const navigate = useNavigate()
  const user = auth.getCurrentUser()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    // Simular barra de progreso
    const interval = setInterval(() => {
      setProgress(prev => Math.min(100, prev + Math.floor(Math.random() * 4) + 1))
    }, 55)

    // Redirigir después de 3 segundos
    const redirectTimer = setTimeout(() => {
      if (user.forcePasswordReset) {
        navigate('/change-password')
      } else {
        navigate('/')
      }
    }, 3000)

    return () => {
      clearInterval(interval)
      clearTimeout(redirectTimer)
    }
  }, [user, navigate])

  // Generar destellos
  useEffect(() => {
    const particles = document.getElementById('particles')
    if (!particles) return

    for (let i = 0; i < 22; i++) {
      const s = document.createElement('div')
      s.className = 'spark'
      const sz = Math.random() * 5 + 2
      s.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random() * 100}%;top:${Math.random() * 100}%;animation-duration:${Math.random() * 4 + 3}s;animation-delay:${Math.random() * 3}s;`
      if (Math.random() > 0.5) s.style.background = 'rgba(207,48,29,0.6)'
      particles.appendChild(s)
    }
  }, [])

  const firstName = user?.firstName || 'Usuario'
  const lastName = user?.lastName || ''
  const displayName = `${firstName} ${lastName}`.trim()

  return (
    <div className="screen">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .screen {
          min-height: 100vh;
          background: #071D4C;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', sans-serif;
          position: relative;
          overflow: hidden;
        }

        .particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .waves {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 180px;
          overflow: hidden;
        }

        .wave {
          position: absolute;
          bottom: 0;
          left: -50%;
          width: 200%;
          height: 160px;
          border-radius: 43% 57% 46% 54% / 30% 30% 70% 70%;
        }

        .w1 {
          background: rgba(22, 172, 228, 0.18);
          animation: wv 6s ease-in-out infinite;
        }

        .w2 {
          background: rgba(22, 172, 228, 0.11);
          animation: wv 8s ease-in-out infinite reverse;
          bottom: 8px;
        }

        .w3 {
          background: rgba(68, 73, 123, 0.25);
          animation: wv 10s ease-in-out infinite;
          bottom: 16px;
        }

        @keyframes wv {
          0%, 100% {
            transform: translateX(0) rotate(-1.5deg);
          }
          50% {
            transform: translateX(4%) rotate(1.5deg);
          }
        }

        .logo-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 2px solid rgba(22, 172, 228, 0.3);
          animation: ringPulse 2s ease-out forwards;
        }

        .logo-ring2 {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          border-radius: 50%;
          border: 1px solid rgba(22, 172, 228, 0.15);
          animation: ringPulse2 2.2s ease-out 0.2s forwards;
        }

        @keyframes ringPulse {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }

        @keyframes ringPulse2 {
          0% {
            width: 0;
            height: 0;
            opacity: 0.8;
          }
          100% {
            width: 380px;
            height: 380px;
            opacity: 0;
          }
        }

        .content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0;
          text-align: center;
          padding: 2rem;
        }

        .logo-wrap {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          box-shadow: 0 0 0 4px rgba(22, 172, 228, 0.3), 0 0 40px rgba(22, 172, 228, 0.2);
          animation: logoIn 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both;
          margin-bottom: 1.8rem;
        }

        .logo-wrap img {
          width: 108px;
          height: 108px;
          object-fit: contain;
          border-radius: 50%;
        }

        .logo-fallback {
          font-size: 2rem;
          font-weight: 800;
          color: #071D4C;
          letter-spacing: 0.05em;
        }

        @keyframes logoIn {
          from {
            opacity: 0;
            transform: scale(0.3);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .bienvenido {
          font-size: 1rem;
          font-weight: 400;
          color: #16ACE4;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          animation: fadeSlideUp 0.6s ease 0.6s both;
          margin-bottom: 0.4rem;
        }

        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        .username {
          font-size: 2.4rem;
          font-weight: 800;
          color: #F7F9FC;
          letter-spacing: 0.02em;
          animation: fadeSlideUp 0.7s ease 0.85s both;
          margin-bottom: 0.5rem;
          line-height: 1.1;
        }

        .empresa {
          font-size: 0.78rem;
          font-weight: 600;
          color: #44497B;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          animation: fadeSlideUp 0.6s ease 1.05s both;
          margin-bottom: 2rem;
        }

        .progress-wrap {
          width: 260px;
          animation: fadeSlideUp 0.5s ease 1.2s both;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: rgba(247, 249, 252, 0.45);
          margin-bottom: 0.4rem;
          letter-spacing: 0.05em;
        }

        .progress-track {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #16ACE4, #CF301D);
          border-radius: 99px;
          animation: fillBar 2s cubic-bezier(0.4, 0, 0.2, 1) 1.4s forwards;
        }

        @keyframes fillBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .redirecting {
          margin-top: 1rem;
          font-size: 0.78rem;
          color: rgba(247, 249, 252, 0.35);
          letter-spacing: 0.06em;
          animation: fadeSlideUp 0.5s ease 1.6s both;
        }

        .spark {
          position: absolute;
          border-radius: 50%;
          background: #16ACE4;
          opacity: 0;
          animation: sparkle linear infinite;
        }

        @keyframes sparkle {
          0% {
            opacity: 0;
            transform: scale(0);
          }
          20% {
            opacity: 0.8;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0) translateY(-60px);
          }
        }

        .deco-line {
          width: 0;
          height: 1px;
          background: rgba(22, 172, 228, 0.35);
          margin: 0.8rem auto 0.8rem;
          animation: lineExpand 0.7s ease 0.95s forwards;
        }

        @keyframes lineExpand {
          from {
            width: 0;
          }
          to {
            width: 140px;
          }
        }
      `}</style>

      <div className="particles" id="particles"></div>
      <div className="waves">
        <div className="wave w1"></div>
        <div className="wave w2"></div>
        <div className="wave w3"></div>
      </div>
      <div className="logo-ring"></div>
      <div className="logo-ring2"></div>

      <div className="content">
        <div className="logo-wrap">
          <img
            src="/logo.png"
            alt="GCM"
            onError={(e) => {
              e.target.style.display = 'none'
              const fallback = document.getElementById('lf')
              if (fallback) fallback.style.display = 'block'
            }}
          />
          <div id="lf" className="logo-fallback" style={{ display: 'none' }}>
            GCM
          </div>
        </div>

        <div className="bienvenido">Bienvenido</div>
        <div className="username">{displayName}</div>
        <div className="deco-line"></div>
        <div className="empresa">Grupo Milcien · S.A. de C.V.</div>

        <div className="progress-wrap">
          <div className="progress-label">
            <span>Cargando sistema</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill"></div>
          </div>
        </div>
        <div className="redirecting">Redirigiendo al panel principal...</div>
      </div>
    </div>
  )
}
