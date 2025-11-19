
import { FC } from 'react'

export const Footer: FC = () => {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="container">
        © {year} Arsalan — Built with React + TypeScript
      </div>
    </footer>
  )
}
