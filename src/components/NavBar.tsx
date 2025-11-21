import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavBarProps {
  onNavigate: (id: string) => void
  onToggleTheme?: () => void
  isDarkMode?: boolean
}

export const NavBar: FC<NavBarProps> = ({ onNavigate, onToggleTheme, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => setIsOpen(!isOpen)

  const navLinks = ['Home', 'About', 'Projects', 'Skills', 'Contact']

  return (
    <header
      className={`navbar ${scrolled ? 'glass' : ''}`}
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        width: '95%',
        maxWidth: '1400px',
        borderRadius: '24px',
        transition: 'all 0.3s ease',
        background: scrolled ? 'var(--glass-bg)' : 'transparent',
        border: scrolled ? '1px solid var(--glass-border)' : 'none',
        backdropFilter: scrolled ? 'blur(12px)' : 'none'
      }}
    >
      <div className="nav-inner" style={{ padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="brand text-gradient" style={{ fontSize: '1.8rem', cursor: 'pointer', fontWeight: 700 }} onClick={() => onNavigate('home')}>
          Arsalan.dev
        </div>

        {/* Desktop Menu */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          {navLinks.map((item) => (
            <a
              key={item}
              className="nav-link"
              onClick={() => onNavigate(item.toLowerCase())}
              style={{ cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, transition: 'color 0.3s ease' }}
            >
              {item}
            </a>
          ))}
          {onToggleTheme && (
            <button onClick={onToggleTheme} className="btn-icon" aria-label="Toggle Theme" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1.2rem' }}>
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button className="mobile-toggle" onClick={toggleMenu} style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.5rem', cursor: 'pointer' }}>
          {isOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mobile-nav glass"
            style={{
              overflow: 'hidden',
              borderRadius: '0 0 24px 24px',
              marginTop: '10px'
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', padding: '20px', gap: '20px', alignItems: 'center' }}>
              {navLinks.map((item) => (
                <a
                  key={item}
                  onClick={() => {
                    onNavigate(item.toLowerCase())
                    setIsOpen(false)
                  }}
                  style={{ cursor: 'pointer', fontSize: '1.2rem', fontWeight: 500, color: 'var(--text)' }}
                >
                  {item}
                </a>
              ))}
              {onToggleTheme && (
                <button onClick={onToggleTheme} style={{ background: 'none', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '20px', color: 'var(--text)', cursor: 'pointer' }}>
                  {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                </button>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
          .navbar {
            background: var(--glass-bg) !important;
            backdrop-filter: blur(12px) !important;
            border: 1px solid var(--glass-border) !important;
          }
        }
      `}</style>
    </header>
  )
}
