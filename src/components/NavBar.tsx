import { FC, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeCord } from './ThemeCord'

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
        border: scrolled ? '1px solid var(--glass-border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none'
      }}
    >
      <div className="nav-inner" style={{ padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="brand text-gradient" style={{ fontSize: '1.8rem', cursor: 'pointer', fontWeight: 700 }} onClick={() => onNavigate('home')}>
          Arsalanbardsiri.dev
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
            <div style={{ position: 'relative', marginLeft: '10px' }}>
              <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)' }}>
                <ThemeCord isDarkMode={!!isDarkMode} onToggle={onToggleTheme} />
              </div>
            </div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="mobile-toggle"
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          style={{ display: 'none', background: 'none', border: 'none', color: 'var(--text)', fontSize: '1.5rem', cursor: 'pointer' }}
        >
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
                <button
                  onClick={onToggleTheme}
                  style={{
                    background: 'none',
                    border: '1px solid var(--border)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {isDarkMode ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                      <span>Switch to Light Mode</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                      </svg>
                      <span>Switch to Dark Mode</span>
                    </>
                  )}
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
          .brand {
            display: none !important;
          }
          .nav-inner {
            justify-content: center !important;
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
