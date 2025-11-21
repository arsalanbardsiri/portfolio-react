import { FC } from 'react'
import data from '../data/portfolioData.json'
import { motion } from 'framer-motion'

export const ContactSection: FC = () => {
  return (
    <section id="contact" className="container" style={{ paddingBottom: '120px' }}>
      <h2 className="section-title">Get in Touch</h2>
      <motion.div
        className="glass-card"
        style={{ padding: '60px', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        whileHover={{
          y: -5,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 242, 255, 0.15)",
          borderColor: "rgba(0, 242, 255, 0.3)"
        }}
        transition={{ duration: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <p className="muted" style={{ fontSize: '1.2rem', marginBottom: '30px', lineHeight: 1.6 }}>
          I'm currently open to new opportunities and collaborations. Whether you have a question or just want to say hi, feel free to reach out!
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href={`mailto:${data.contact.email}`}
            className="btn btn-primary"
            style={{ fontSize: '1.2rem', padding: '12px 30px' }}
          >
            Say Hello
          </motion.a>
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <motion.a whileHover={{ y: -3 }} href={data.contact.github} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>
              <i className="fab fa-github"></i> GitHub
            </motion.a>
            <motion.a whileHover={{ y: -3 }} href={data.contact.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>
              <i className="fab fa-linkedin"></i> LinkedIn
            </motion.a>
            <motion.a whileHover={{ y: -3 }} href={data.contact.twitter} target="_blank" rel="noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>
              <i className="fab fa-twitter"></i> Twitter
            </motion.a>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
