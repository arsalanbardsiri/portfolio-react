import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from './data/portfolioData';
import { RecursiveBloomCanvas } from './components/RecursiveBloomCanvas';
import { SurrealEye } from './components/SurrealEye';

// Decorative SVG Foliage Leaves peeking behind panels (inspired by leaf-eye artwork)
const FoliageLeavesLeft = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible', zIndex: -1 }}>
    <path 
      d="M50,90 Q15,50 50,10 Q85,50 50,90 Z" 
      className="foliage-leaf-path" 
      transform="rotate(-35, 50, 90) scale(0.9)" 
    />
    <path 
      d="M50,90 Q25,45 50,15 Q75,45 50,90 Z" 
      className="foliage-leaf-path-alt" 
      transform="rotate(15, 50, 90) scale(0.75)" 
    />
  </svg>
);

const FoliageLeavesRight = () => (
  <svg width="60" height="60" viewBox="0 0 100 100" style={{ position: 'absolute', pointerEvents: 'none', overflow: 'visible', zIndex: -1 }}>
    <path 
      d="M50,90 Q15,50 50,10 Q85,50 50,90 Z" 
      className="foliage-leaf-path" 
      transform="rotate(35, 50, 90) scale(0.9)" 
    />
    <path 
      d="M50,90 Q25,45 50,15 Q75,45 50,90 Z" 
      className="foliage-leaf-path-alt" 
      transform="rotate(-15, 50, 90) scale(0.75)" 
    />
  </svg>
);

export default function App() {
  const [scrollPercent, setScrollPercent] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isSystemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      if (isSystemLight) return 'light';
    }
    return 'dark';
  });

  // Track page scroll coordinates to map camera flythrough progress
  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const totalScroll = docHeight - winHeight;
      if (totalScroll > 0) {
        setScrollPercent(window.scrollY / totalScroll);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.documentElement.setAttribute('data-theme', theme);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const skillsData = [
    { name: 'JavaScript', percentage: 90, color: 'var(--color-terracotta)' },
    { name: 'Three.js', percentage: 85, color: 'var(--color-navy)' },
    { name: 'Docker', percentage: 70, color: 'var(--color-mustard)' },
    { name: 'Kubernetes', percentage: 80, color: 'var(--color-navy)' },
    { name: 'TypeScript', percentage: 90, color: 'var(--color-rose)' },
    { name: 'Playwright & QA', percentage: 85, color: 'var(--color-sage)' }
  ];

  return (
    <div>
      
      {/* Fixed WebGL Background Plunge Void */}
      <RecursiveBloomCanvas scrollPercent={scrollPercent} theme={theme} />

      {/* Foreground Scrollable Portfolio Layout */}
      <div className="foreground-scroll-container">
        
        {/* Global theme switcher toggle button - Eyes thematic */}
        <button
          onClick={toggleTheme}
          style={{
            position: 'fixed',
            top: '30px',
            right: '30px',
            background: 'var(--card-bg)',
            border: '1.5px solid var(--border)',
            borderRadius: '8px',
            padding: '8px 16px',
            fontFamily: 'var(--font-code)',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            color: 'var(--text)',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 150
          }}
        >
          {theme === 'light' ? '👁️ ENTER THE VOID' : '👁️ RE-ENTER REALITY'}
        </button>

        {/* ========================================================
            SECTION 1: HERO PORTAL & TITLE
            ======================================================== */}
        <section className="portfolio-section" style={{ minHeight: '100vh' }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', zIndex: 10 }}
          >
            <div 
              style={{
                background: 'var(--color-navy)',
                color: '#ffffff',
                border: '1.5px solid var(--border)',
                borderRadius: '4px',
                padding: '4px 12px',
                fontFamily: 'var(--font-code)',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '14px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.04)'
              }}
            >
              Surreal Recursive Portfolio Dashboard
            </div>
            
            <h1 
              className="melting-header"
              style={{
                fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                color: 'var(--text)',
                textShadow: '3px 3px 0 var(--color-terracotta)',
                margin: 0,
                lineHeight: 1.0,
                letterSpacing: '-2px',
                fontWeight: 800
              }}
            >
              ARSALAN BARSIRI
            </h1>
            
            <div 
              className="jolly-subtitle"
              style={{
                fontSize: '1.2rem',
                color: 'var(--color-sage)',
                fontFamily: 'var(--font-code)',
                fontWeight: 700,
                marginTop: '12px',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}
            >
              Creative Developer | Full-Stack Engineer
            </div>

            {/* Surreal Hand-Eye Portal Centerpiece (Inspired by red hand-eye artwork) */}
            <div 
              style={{ 
                position: 'relative', 
                width: '180px', 
                height: '220px', 
                margin: '35px auto', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
            >
              <svg width="180" height="220" viewBox="0 0 100 120" style={{ position: 'absolute', overflow: 'visible' }}>
                <path 
                  d="M30,90 C30,90 20,80 15,65 C10,50 22,25 25,15 C26,10 32,10 32,15 C32,25 35,45 35,45 C35,45 38,15 40,8 C42,2 47,2 49,8 C51,18 52,42 52,42 C52,42 56,12 59,10 C62,8 66,10 66,15 C66,25 64,48 64,48 C64,48 69,25 72,22 C75,19 79,21 78,28 C76,40 68,68 68,68 C68,68 76,68 82,72 C88,76 86,85 82,88 C74,94 62,105 50,105 C38,105 30,90 30,90 Z" 
                  fill="rgba(140, 110, 201, 0.08)"
                  stroke="var(--color-navy)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <SurrealEye 
                size={70} 
                irisColor="var(--color-terracotta)" 
                style={{ 
                  position: 'absolute', 
                  top: '52px',
                  boxShadow: '0 0 25px rgba(214, 60, 118, 0.45)' 
                }} 
              />
            </div>

            {/* Scroll Down Instructions panel */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="comic-panel-card"
              style={{
                background: 'var(--bg-alt)',
                border: '1px solid rgba(140, 110, 201, 0.35)',
                padding: '12px 24px',
                maxWidth: '460px',
                display: 'inline-block',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
              }}
            >
              <p className="legible-fira-text" style={{ fontWeight: 600, textAlign: 'center', margin: 0 }}>
                👁️ Scroll to plunge down the Z-axis vector void
              </p>
            </motion.div>
          </motion.div>
        </section>

        {/* ========================================================
            SECTION 2: PROJECTS BLOCK
            ======================================================== */}
        <section className="portfolio-section" style={{ background: 'var(--bg-trans)' }}>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="melting-header"
            style={{
              fontSize: '2.8rem',
              color: 'var(--text)',
              textShadow: '2px 2px 0 var(--color-terracotta)',
              zIndex: 10
            }}
          >
            PROJECT ARCHITECTURES
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="jolly-subtitle" 
            style={{ fontSize: '0.9rem', color: 'var(--color-sage)', zIndex: 10, marginTop: '4px' }}
          >
            Fusing distributed backends with surreal aesthetics
          </motion.p>

          <div className="projects-grid">
            
            {/* Project 1: Blog Lounge */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: 0, ease: [0.16, 1, 0.3, 1] }}
              className="comic-panel-card"
            >
              {/* Peeking foliage eye behind the card top border */}
              <div style={{ position: 'absolute', top: '-26px', right: '20px', zIndex: -1, width: '60px', height: '60px', overflow: 'visible' }}>
                <FoliageLeavesRight />
                <SurrealEye size={36} irisColor="var(--color-navy)" style={{ position: 'relative', top: '10px', right: '-12px' }} />
              </div>

              <div className="card-header-bar">
                <span className="card-dot-marker red" />
                <span className="card-dot-marker yellow" />
                <span className="card-dot-marker green" />
                <span>bloglounge://dist-sys</span>
              </div>
              <div className="card-content-area">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-main)' }}>Blog Lounge</h3>
                  <span style={{ fontSize: '1.2rem' }}>🌐</span>
                </div>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--color-terracotta)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                  Distributed Content Platform
                </div>
                <p className="legible-fira-text" style={{ marginBottom: '20px', fontSize: '0.82rem', opacity: 0.9 }}>
                  {portfolioData.projects[0].description}
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <a 
                    href={portfolioData.projects[0].links.live} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-orange-resume"
                    style={{ padding: '8px 16px', fontSize: '0.78rem', width: 'auto', textDecoration: 'none' }}
                  >
                    Demo Link
                  </a>
                  <a 
                    href={portfolioData.projects[0].links.github} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-orange-resume"
                    style={{ padding: '8px 16px', fontSize: '0.78rem', width: 'auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid rgba(140, 110, 201, 0.3)', boxShadow: 'none', textDecoration: 'none' }}
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Project 2: ProjectIt */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="comic-panel-card"
            >
              {/* Peeking foliage eye behind the card top border */}
              <div style={{ position: 'absolute', top: '-26px', left: '20px', zIndex: -1, width: '60px', height: '60px', overflow: 'visible' }}>
                <FoliageLeavesLeft />
                <SurrealEye size={36} irisColor="var(--color-sage)" style={{ position: 'relative', top: '10px', left: '-12px' }} />
              </div>

              <div className="card-header-bar">
                <span className="card-dot-marker red" />
                <span className="card-dot-marker yellow" />
                <span className="card-dot-marker green" />
                <span>projectit://realtime-jobs</span>
              </div>
              <div className="card-content-area">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-main)' }}>ProjectIt</h3>
                  <span style={{ fontSize: '1.2rem' }}>📋</span>
                </div>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--color-sage)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                  Real-time Collaboration
                </div>
                <p className="legible-fira-text" style={{ marginBottom: '20px', fontSize: '0.82rem', opacity: 0.9 }}>
                  {portfolioData.projects[1].description}
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <a 
                    href={portfolioData.projects[1].links.live} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-orange-resume"
                    style={{ padding: '8px 16px', fontSize: '0.78rem', width: 'auto', textDecoration: 'none' }}
                  >
                    Demo Link
                  </a>
                  <a 
                    href={portfolioData.projects[1].links.github} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-orange-resume"
                    style={{ padding: '8px 16px', fontSize: '0.78rem', width: 'auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid rgba(140, 110, 201, 0.3)', boxShadow: 'none', textDecoration: 'none' }}
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Project 3: Catlender */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="comic-panel-card"
            >
              {/* Peeking foliage eye behind the card top border */}
              <div style={{ position: 'absolute', top: '-26px', right: '35px', zIndex: -1, width: '60px', height: '60px', overflow: 'visible' }}>
                <FoliageLeavesRight />
                <SurrealEye size={36} irisColor="var(--color-mustard)" style={{ position: 'relative', top: '10px', right: '-12px' }} />
              </div>

              <div className="card-header-bar">
                <span className="card-dot-marker red" />
                <span className="card-dot-marker yellow" />
                <span className="card-dot-marker green" />
                <span>catlender://agent-ai</span>
              </div>
              <div className="card-content-area">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-main)' }}>Catlender</h3>
                  <span style={{ fontSize: '1.2rem' }}>🌐</span>
                </div>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.72rem', color: 'var(--color-mustard)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
                  AI Scheduling Agent
                </div>
                <p className="legible-fira-text" style={{ marginBottom: '20px', fontSize: '0.82rem', opacity: 0.9 }}>
                  {portfolioData.projects[2].description}
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <a 
                    href={portfolioData.projects[2].links.live} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-orange-resume"
                    style={{ padding: '8px 16px', fontSize: '0.78rem', width: 'auto', textDecoration: 'none' }}
                  >
                    Demo Link
                  </a>
                  <a 
                    href={portfolioData.projects[2].links.github} 
                    target="_blank" 
                    rel="noreferrer"
                    className="btn-orange-resume"
                    style={{ padding: '8px 16px', fontSize: '0.78rem', width: 'auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid rgba(140, 110, 201, 0.3)', boxShadow: 'none', textDecoration: 'none' }}
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </motion.div>

          </div>
        </section>

        {/* ========================================================
            SECTION 3: SKILLS & STATS
            ======================================================== */}
        <section className="portfolio-section" style={{ background: 'var(--bg-trans-alt)' }}>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="melting-header"
            style={{
              fontSize: '2.8rem',
              color: 'var(--text)',
              textShadow: '2px 2px 0 var(--color-navy)',
              zIndex: 10
            }}
          >
            PSYCHE STATISTICS
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="jolly-subtitle" 
            style={{ fontSize: '0.9rem', color: 'var(--color-navy)', zIndex: 10, marginTop: '4px' }}
          >
            System stats &amp; core abstractions
          </motion.p>

          <div className="skills-grid">
            
            {/* Left Box: Bio & stats */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="comic-panel-card"
            >
              <div className="card-header-bar">
                <span className="card-dot-marker red" />
                <span className="card-dot-marker yellow" />
                <span className="card-dot-marker green" />
                <span>bio://arsalan-bardsiri</span>
              </div>
              <div className="card-content-area" style={{ background: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <span className="jolly-subtitle" style={{ fontSize: '1.2rem', color: 'var(--color-terracotta)', display: 'block', margin: 0 }}>
                    BIOGRAPHICAL ANCHOR
                  </span>
                  <SurrealEye size={30} irisColor="var(--color-terracotta)" style={{ border: '1px solid rgba(140, 110, 201, 0.35)' }} />
                </div>
                <p className="legible-fira-text" style={{ marginBottom: '24px', opacity: 0.95, fontSize: '0.84rem' }}>
                  {portfolioData.about.bio}
                </p>

                {/* Stats indicators */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {portfolioData.about.stats.map((s, idx) => (
                    <motion.div 
                      key={s.label}
                      initial={{ opacity: 0, scale: 0.85 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: 0.2 + idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="comic-panel-card"
                      style={{
                        padding: '12px',
                        background: 'rgba(140,110,201,0.06)',
                        textAlign: 'center',
                        border: '1px solid rgba(140,110,201,0.25)',
                        boxShadow: 'none'
                      }}
                    >
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-terracotta)', fontFamily: 'var(--font-main)' }}>
                        {s.value}
                      </div>
                      <div style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', opacity: 0.8 }}>
                        {s.label}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right Box: Skills progress bars */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="comic-panel-card"
            >
              <div className="card-header-bar">
                <span className="card-dot-marker red" />
                <span className="card-dot-marker yellow" />
                <span className="card-dot-marker green" />
                <span>skills://linear-bars</span>
              </div>
              <div className="card-content-area" style={{ background: 'var(--card-bg)' }}>
                <span className="jolly-subtitle" style={{ fontSize: '1.2rem', color: 'var(--color-navy)', display: 'block', marginBottom: '16px' }}>
                  SKILLS LINEAR BARS
                </span>

                {skillsData.map((skill, idx) => (
                  <div key={skill.name} className="linear-skill-container">
                    <div className="linear-skill-label">
                      <span>{skill.name}</span>
                      <span>{skill.percentage}%</span>
                    </div>
                    <div className="linear-skill-track">
                      <motion.div 
                        className="linear-skill-fill" 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.percentage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.1 + idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                        style={{ backgroundColor: skill.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </section>

        {/* ========================================================
            SECTION 4: LEGACY TRANSMISSION (CONTACT & RESUME)
            ======================================================== */}
        <section className="portfolio-section" style={{ minHeight: '100vh', background: 'var(--bg-trans)' }}>
          
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="comic-panel-card"
            style={{
              width: 'min(520px, 92%)',
              zIndex: 10
            }}
          >
            <div className="card-header-bar">
              <span className="card-dot-marker red" />
              <span className="card-dot-marker yellow" />
              <span className="card-dot-marker green" />
              <span>contact://transmission</span>
            </div>
            <div className="card-content-area" style={{ background: 'var(--card-bg)', padding: '30px', textAlign: 'center' }}>
              
              {/* Center contact eye tracking the cursor */}
              <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 16px' }}>
                <SurrealEye size={60} irisColor="var(--color-navy)" style={{ border: '1.5px solid var(--border)' }} />
              </div>

              <span className="jolly-subtitle" style={{ fontSize: '1.8rem', color: 'var(--color-terracotta)', display: 'block', marginBottom: '12px' }}>
                LEGACY TRANSMISSION
              </span>
              <p className="legible-fira-text" style={{ marginBottom: '24px', opacity: 0.95, fontSize: '0.84rem' }}>
                I am actively seeking full-time and contract software development opportunities. Reach out via email or follow my logs.
              </p>

              <div className="contact-grid">
                <div>📧 <a href={`mailto:${portfolioData.contact.email}`} style={{ color: 'var(--color-navy)', textDecoration: 'none', fontWeight: 600 }}>{portfolioData.contact.email}</a></div>
                <div>🐙 <a href={portfolioData.contact.github} target="_blank" rel="noreferrer" style={{ color: 'var(--color-navy)', textDecoration: 'none', fontWeight: 600 }}>GitHub</a></div>
                <div>🔗 <a href={portfolioData.contact.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--color-navy)', textDecoration: 'none', fontWeight: 600 }}>LinkedIn</a></div>
                <div>📝 <a href={portfolioData.contact.devto} target="_blank" rel="noreferrer" style={{ color: 'var(--color-navy)', textDecoration: 'none', fontWeight: 600 }}>Dev.to Blog</a></div>
              </div>

              <a 
                href={portfolioData.resumeUrl}
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <button className="btn-orange-resume">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  DOWNLOAD RESUME (Legacy Transmission)
                </button>
              </a>
            </div>
          </motion.div>
        </section>

        {/* Interaction Hints overlay at bottom */}
        <div className="interaction-bubble">
          <div className="interaction-item">
            <span className="interaction-tag">SCROLL</span>
            <span>Zoom Parallax Void Background ({Math.round(scrollPercent * 100)}%)</span>
          </div>
          <div className="interaction-item">
            <span className="interaction-tag">HOVER</span>
            <span>Drift Solid avoidance</span>
          </div>
        </div>

      </div>

    </div>
  );
}
