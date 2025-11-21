import { FC } from 'react'

interface NavBarProps {
  onNavigate: (id: string) => void
}

export const NavBar: FC<NavBarProps> = ({ onNavigate }) => {
  return (
    <header className="navbar glass" style={{ position: 'sticky', top: 20, zIndex: 100, margin: '0 auto', width: '90%', maxWidth: '1200px', borderRadius: '16px', marginTop: '20px' }}>
      <div className="nav-inner" style={{ padding: '10px 24px' }}>
        <div className="brand text-gradient" style={{ fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => onNavigate('home')}>
          Arsalan.dev
        </div>
        <nav className="nav-links">
          {['Home', 'About', 'Projects', 'Skills', 'Contact'].map((item) => (
            <a
              key={item}
              className="nav-link"
              onClick={() => onNavigate(item.toLowerCase())}
              style={{ cursor: 'pointer', fontSize: '0.95rem' }}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
