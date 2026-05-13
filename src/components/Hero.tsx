import { FC } from "react";
import Typewriter from "typewriter-effect";
import { portfolioData as data } from '../data/portfolioData';
import { motion } from "framer-motion";
import ParticleImage from "./ParticleImage";
import MagneticButton from "./MagneticButton";

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
      overflow: 'hidden',
    }}>
      {/* Background Gradient Blob */}
      {/* Aurora Mesh Gradient Background */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -1,
        pointerEvents: 'none'
      }}>
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, var(--aurora-1) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(60px)',
          }}
        />
        <motion.div
          animate={{
            x: [0, -100, 0],
            y: [0, 50, 0],
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          style={{
            position: 'absolute',
            top: '20%',
            right: '-10%',
            width: '700px',
            height: '700px',
            background: 'radial-gradient(circle, var(--aurora-2) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(80px)',
          }}
        />
        <motion.div
          animate={{
            x: [0, 50, 0],
            y: [0, 100, 0],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.4, 0.1]
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          style={{
            position: 'absolute',
            bottom: '-20%',
            left: '30%',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, var(--aurora-3) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Floating Geometric Shapes */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: '15%',
          left: '10%',
          width: '60px',
          height: '60px',
          border: '2px solid rgba(0, 242, 255, 0.2)',
          transform: 'rotate(45deg)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '10%',
          width: '80px',
          height: '80px',
          background: 'rgba(112, 0, 255, 0.1)',
          zIndex: 0
        }}
      />
      <motion.div
        animate={{ x: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: 'absolute',
          top: '40%',
          right: '20%',
          width: '20px',
          height: '20px',
          background: 'var(--primary)',
          borderRadius: '50%',
          zIndex: 0
        }}
      />



      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div className="grid" style={{
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '40px',
          alignItems: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <h2 style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '1rem', fontWeight: 500 }}>Hello, I'm</h2>
            <h1 className="text-gradient" style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1rem', lineHeight: 1.1 }}>
              {data.name}
            </h1>
            <div style={{ fontSize: '2rem', marginBottom: '1.5rem', minHeight: '60px', color: 'var(--text-muted)' }}>
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
            <div className="hero-buttons" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
              <MagneticButton
                className="btn-primary"
                onClick={() => onNavigate('projects')}
              >
                View Projects
              </MagneticButton>
              <MagneticButton
                as="a"
                className="btn-secondary"
                href={data.resumeUrl}
                target="_blank"
                rel="noreferrer"
              >
                Download Resume
              </MagneticButton>
              <MagneticButton
                as="a"
                className="btn-secondary"
                href={data.contact.github}
                target="_blank"
                rel="noreferrer"
                style={{ border: 'none', padding: '12px' }}
                aria-label="GitHub Profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </MagneticButton>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
            style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}
          >
            <div className="animate-float" style={{ position: 'relative', zIndex: 2 }}>
              <div style={{
                width: '350px',
                height: '350px',
                // Removed borderRadius and overflow to let particles blend naturally
                // borderRadius: '50%',
                // overflow: 'hidden',

                // Subtle glow behind the "energy field" but no hard edges
                // background: 'radial-gradient(circle, rgba(0, 242, 255, 0.1) 0%, rgba(0,0,0,0) 70%)',
              }}>
                <div style={{
                  width: '100%',
                  height: '100%',
                  // overflow: 'hidden' // Remove overflow hidden to let particles spill slightly?
                  // Keeping clean for now
                }}>
                  <ParticleImage
                    src={data.profile}
                    scale={1.3} // Increased scale for impact
                    particleSize={2.8}
                    hoverRadius={60} // Increased interaction radius
                    hoverStrength={50}
                  />
                </div>
              </div>
            </div>

            {/* Orbit 1 with Satellite */}
            <div style={{
              position: 'absolute',
              width: '400px',
              height: '400px',
              border: '1px solid rgba(0, 242, 255, 0.2)',
              borderRadius: '50%',
              animation: 'spin 20s linear infinite',
              zIndex: 1
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '-5px',
                width: '10px',
                height: '10px',
                background: 'var(--primary)',
                borderRadius: '50%',
                boxShadow: '0 0 10px var(--primary)'
              }} />
            </div>

            {/* Orbit 2 with Satellite */}
            <div style={{
              position: 'absolute',
              width: '500px',
              height: '500px',
              border: '1px solid rgba(112, 0, 255, 0.2)',
              borderRadius: '50%',
              animation: 'spin 30s linear infinite reverse',
              zIndex: 1
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                left: '50%',
                width: '12px',
                height: '12px',
                background: 'var(--secondary)',
                borderRadius: '50%',
                boxShadow: '0 0 15px var(--secondary)'
              }} />
            </div>
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
            justify-content: center !important;
            align-items: center !important;
          }
          /* Fix Typewriter overlap on mobile */
          div[style*="min-height: 60px"] {
            min-height: 80px !important;
            margin-bottom: 2rem !important;
          }
          /* Force vertical stack for buttons */
          .hero-buttons {
            flex-direction: column !important;
            gap: 1rem !important;
            width: 100%;
          }
          .hero-buttons .btn {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </section>
  );
};
