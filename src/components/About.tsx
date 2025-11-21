import { FC } from 'react'
import data from '../data/portfolioData.json'
import { ExperienceTimeline } from './ExperienceTimeline'
import { motion } from 'framer-motion'

export const About: FC = () => {
  return (
    <section id="about" className="container">
      <h2 className="section-title">About Me</h2>
      <div className="grid grid-cols-2" style={{ gap: '40px' }}>
        <motion.div
          className="glass-card"
          style={{ padding: '30px', height: 'fit-content' }}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <p className="muted" style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '20px' }}>
            {data.bio}
          </p>
          <p className="muted" style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            I believe in the power of technology to transform ideas into reality. My approach combines technical expertise with a keen eye for design, ensuring that every project I work on is not only functional but also visually appealing and user-friendly.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <ExperienceTimeline />
        </motion.div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
