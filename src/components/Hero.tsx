import { FC } from "react";
import Typewriter from "typewriter-effect";
import data from "../data/portfolioData.json";
import { motion } from "framer-motion";

interface HeroProps {
  onNavigate: (id: string) => void;
}

export const Hero: FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section id="home" className="container hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', minHeight: '80vh', position: 'relative' }}>
      {/* Background Gradient Blob */}
      <div style={{
        position: 'absolute',
        top: '-20%',
        right: '-10%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(0, 242, 255, 0.15) 0%, rgba(112, 0, 255, 0.05) 50%, transparent 70%)',
        filter: 'blur(60px)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <div className="hero-content" style={{ zIndex: 1 }}>
        <h1 className="hero-title" style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', marginBottom: '1rem', lineHeight: 1.1 }}>
          Hi, I'm <span className="text-gradient">{data.name}</span>
        </h1>
        <div style={{ fontWeight: 700, fontSize: "1.5rem", opacity: 0.9, color: 'var(--primary)', marginBottom: '1.5rem', height: '30px' }}>
          <Typewriter
            options={{
              strings: data.typewriterTexts,
              autoStart: true,
              loop: true,
              delay: 50,
              deleteSpeed: 30,
            }}
          />
        </div>
        <p className="hero-sub" style={{ fontSize: '1.1rem', maxWidth: '500px', lineHeight: 1.8, marginBottom: '2rem' }}>
          {data.bio}
        </p>
        <div style={{ display: "flex", gap: 16 }}>
          <button className="btn btn-primary" onClick={() => onNavigate("projects")}>
            View Projects
          </button>
          <a
            className="btn btn-secondary"
            href={data.contact.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>

      <div className="avatar-wrap" style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
        <div className="avatar animate-float" style={{
          width: '350px',
          height: '350px',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '4px solid rgba(255,255,255,0.1)',
          boxShadow: '0 0 40px rgba(0, 242, 255, 0.2)',
          position: 'relative',
          zIndex: 2
        }}>
          <img src="./assets/images/IMG_2155.jpeg" alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Decorative Elements behind avatar */}
        <div style={{
          position: 'absolute',
          width: '380px',
          height: '380px',
          border: '2px dashed rgba(255,255,255,0.1)',
          borderRadius: '50%',
          animation: 'spin 20s linear infinite',
          zIndex: 1
        }} />
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          #home {
            grid-template-columns: 1fr !important;
            text-align: center;
            padding-top: 120px;
          }
          .hero-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            order: 2;
          }
          .avatar-wrap {
            order: 1;
            margin-bottom: 40px;
          }
          .avatar {
            width: 250px !important;
            height: 250px !important;
          }
        }
      `}</style>
    </section>
  );
};
