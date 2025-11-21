import { FC } from 'react'

interface NavBarProps {
  onNavigate: (id: string) => void
}

export const NavBar: FC<NavBarProps> = ({ onNavigate }) => {
  return (
    <header className="navbar glass" style={{ position: 'sticky', top: 20, zIndex: 100, margin: '0 auto', width: '95%', maxWidth: '1400px', borderRadius: '24px', marginTop: '20px' }}>
      <div className="nav-inner" style={{ padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="brand text-gradient" style={{ fontSize: '1.8rem', cursor: 'pointer', fontWeight: 700 }} onClick={() => onNavigate('home')}>
          Arsalan.dev
        </div>
        <nav className="nav-links" style={{ display: 'flex', gap: '40px' }}>
          {['Home', 'About', 'Projects', 'Skills', 'Contact'].map((item) => (
            <a
              key={item}
              className="nav-link"
              onClick={() => onNavigate(item.toLowerCase())}
              style={{ cursor: 'pointer', fontSize: '1.1rem', fontWeight: 500, transition: 'color 0.3s ease' }}
            >
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  )
}
