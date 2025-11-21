import { FC } from 'react'

export const Footer: FC = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="footer" style={{ borderTop: '1px solid var(--glass-border)', padding: '40px 0', marginTop: '40px', background: 'var(--bg-alt)' }}>
      <div className="container" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
        © {year} Arsalan — Built with React + TypeScript
      </div>
    </footer>
  )
}
