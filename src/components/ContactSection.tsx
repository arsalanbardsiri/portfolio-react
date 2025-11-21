import { FC } from 'react'
import data from '../data/portfolioData.json'

export const ContactSection: FC = () => {
  const c = data.contact
  return (
    <section id="contact" className="container" style={{ textAlign: 'center' }}>
      <h2 className="section-title">Get in Touch</h2>
      <div className="glass-card" style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
        <p className="muted" style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
          Feel free to reach out for collaborations or just a friendly hello!
        </p>
        <a href={`mailto:${c.email}`} className="btn btn-primary" style={{ fontSize: '1.2rem', padding: '12px 32px' }}>
          {c.email}
        </a>
        <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
          <a href={c.github} target="_blank" rel="noreferrer" className="btn btn-secondary">GitHub</a>
          <a href={c.linkedin} target="_blank" rel="noreferrer" className="btn btn-secondary">LinkedIn</a>
          <a href={c.twitter} target="_blank" rel="noreferrer" className="btn btn-secondary">Twitter</a>
        </div>
      </div>
    </section>
  )
}
