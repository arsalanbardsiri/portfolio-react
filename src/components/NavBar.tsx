
import { FC } from 'react'

interface NavBarProps {
  onNavigate: (id: string) => void
  onToggleTheme: () => void
}

export const NavBar: FC<NavBarProps> = ({ onNavigate, onToggleTheme }) => {
  return (
    <header className="navbar">
      <div className="container nav-inner">
        <div className="brand">Arsalan.dev</div>
        <nav className="nav-links">
          <a className="nav-link" onClick={() => onNavigate('home')}>Home</a>
          <a className="nav-link" onClick={() => onNavigate('about')}>About</a>
          <a className="nav-link" onClick={() => onNavigate('projects')}>Projects</a>
          <a className="nav-link" onClick={() => onNavigate('skills')}>Skills</a>
          <a className="nav-link" onClick={() => onNavigate('contact')}>Contact</a>
          <button className="btn secondary" onClick={onToggleTheme}>Toggle Theme</button>
        </nav>
      </div>
    </header>
  )
}
