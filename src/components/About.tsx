import { FC } from 'react'
import data from '../data/portfolioData.json'
import { ExperienceTimeline } from './ExperienceTimeline'

export const About: FC = () => {
  return (
    <section id="about" className="container">
      <h2 className="section-title">About Me</h2>
      <div className="glass-card" style={{ padding: '40px', marginBottom: '40px' }}>
        <p className="muted" style={{ fontSize: '1.1rem', lineHeight: 1.8, maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          {data.bio}
        </p>
      </div>
      <ExperienceTimeline />
    </section>
  )
}
