
import { FC } from 'react'
import data from '../data/portfolioData.json'

export const ContactSection: FC = () => {
  const c = data.contact
  return (
    <section id="contact" className="container fade-up">
      <h2 className="section-title">Get in touch</h2>
      <div className="card" style={{ display: 'grid', gap: 10 }}>
        <a href={`mailto:${c.email}`}>{c.email}</a>
        <a href={c.github} target="_blank" rel="noreferrer">GitHub</a>
        <a href={c.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>
        <a href={c.twitter} target="_blank" rel="noreferrer">Twitter</a>
      </div>
    </section>
  )
}
