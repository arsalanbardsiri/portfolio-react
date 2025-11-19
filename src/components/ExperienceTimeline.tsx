
import { FC } from 'react'
import data from '../data/portfolioData.json'

export const ExperienceTimeline: FC = () => {
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Experience</h3>
      <div style={{ display: 'grid', gap: 18 }}>
        {data.experience.map((e, idx) => (
          <div key={idx} style={{ borderLeft: '2px solid var(--border)', paddingLeft: 12 }}>
            <div style={{ fontWeight: 700 }}>{e.title} · {e.company}</div>
            <div className="muted" style={{ fontSize: 13 }}>{e.period}</div>
            <p className="muted">{e.summary}</p>
            <ul>
              {e.achievements.map((a, i) => (<li key={i} className="muted">{a}</li>))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
