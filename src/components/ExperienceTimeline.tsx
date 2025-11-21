import { FC } from 'react'
import data from '../data/portfolioData.json'

export const ExperienceTimeline: FC = () => {
  return (
    <div className="glass-card" style={{ padding: '30px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '1.8rem' }}>Experience</h3>
      <div style={{ display: 'grid', gap: 30 }}>
        {data.experience.map((e, idx) => (
          <div key={idx} style={{ borderLeft: '2px solid var(--primary)', paddingLeft: 20, position: 'relative' }}>
            {/* Dot on the timeline */}
            <div style={{
              position: 'absolute',
              left: '-6px',
              top: '0',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--primary)',
              boxShadow: '0 0 10px var(--primary)'
            }} />

            <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#fff' }}>{e.title}</div>
            <div style={{ fontSize: '1rem', color: 'var(--primary)', marginBottom: '8px' }}>{e.company}</div>
            <div className="muted" style={{ fontSize: '0.9rem', marginBottom: '12px' }}>{e.period}</div>
            <p className="muted" style={{ marginBottom: '12px', lineHeight: 1.6 }}>{e.summary}</p>
            <ul style={{ paddingLeft: '20px' }}>
              {e.achievements.map((a, i) => (<li key={i} className="muted" style={{ marginBottom: '6px' }}>{a}</li>))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}
