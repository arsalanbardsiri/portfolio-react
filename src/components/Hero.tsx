import { FC } from "react";
import Typewriter from "typewriter-effect";
import { portfolioData as data } from '../data/portfolioData';
import { motion } from "framer-motion";

interface HeroProps {
  onNavigate: (id: string) => void;
}

export const Hero: FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section id="home" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '120px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Gradient Blob */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(0, 242, 255, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <div className="container">
        <div className="grid" style={{
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '40px',
          alignItems: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 500 }}>Hello, I'm</h2>
            <h1 className="text-gradient" style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
              {data.name}
            </h1>
            <div style={{ fontSize: '2rem', marginBottom: '1.5rem', height: '60px', color: 'var(--text-muted)' }}>
              <Typewriter
                options={{
                  strings: data.typewriterTexts,
                  autoStart: true,
                  loop: true,
                  delay: 75,
                }}
              />
            </div>
            <p className="muted" style={{ fontSize: '1.2rem', maxWidth: '500px', marginBottom: '2.5rem', lineHeight: 1.6 }}>
              {data.about.bio}
            </p>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
                onClick={() => onNavigate('projects')}
              >
                View Projects
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary"
                href="/resume.pdf"
                target="_blank"
                rel="noreferrer"
              >
                Download Resume
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary"
                href={data.contact.github}
                target="_blank"
                rel="noreferrer"
                style={{ border: 'none', padding: '12px' }}
                aria-label="GitHub Profile"
              >
                <i className="fab fa-github" style={{ fontSize: '1.5rem' }}></i>
              </motion.a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}
          >
            <div className="animate-float" style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                width: '350px',
                height: '350px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '4px solid rgba(0, 242, 255, 0.3)',
                boxShadow: '0 0 40px rgba(0, 242, 255, 0.2)',
                background: 'var(--bg-alt)'
              }}>
                <img src={data.profile} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* Decorative Circles */}
            <div style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              border: '2px dashed rgba(0, 242, 255, 0.1)',
              borderRadius: '50%',
              animation: 'spin 20s linear infinite',
              zIndex: 1
            }} />
            <div style={{
              position: 'absolute',
              width: '450px',
              height: '450px',
              border: '1px solid rgba(157, 0, 255, 0.1)',
              borderRadius: '50%',
              animation: 'spin 30s linear infinite reverse',
              zIndex: 1
            }} />
          </motion.div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr !important;
            text-align: center;
          }
          .muted {
            margin: 0 auto 2.5rem auto;
          }
          div[style*="display: flex"] {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  );
};
