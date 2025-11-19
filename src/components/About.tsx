
import { FC } from 'react'
import data from '../data/portfolioData.json'
import { ExperienceTimeline } from './ExperienceTimeline'

export const About: FC = () => {
  return (
    <section id="about" className="container fade-up">
      <h2 className="section-title">About</h2>
      <div className="card" style={{ marginBottom: 18 }}>
        <p className="muted" style={{ lineHeight: 1.7 }}>{data.bio}</p>
      </div>
      <ExperienceTimeline />
    </section>
  )
}
