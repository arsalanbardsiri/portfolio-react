import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from './data/portfolioData';
import { RecursiveBloomCanvas, ScrollState } from './components/RecursiveBloomCanvas';
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
  const [returnTrigger, setReturnTrigger] = useState(0);
  const [isReturning, setIsReturning] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const isSystemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      if (isSystemLight) return 'light';
    }
    return 'dark';
  });

  const [scrollState, setScrollState] = useState<ScrollState>({
    activeSection: 'hero',
    activeProjectIndex: -1,
    lerpedPercent: 0
  });

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 520 || windowSize.height < 720;
  const isTablet = !isMobile && (windowSize.width < 992 || windowSize.height < 850);
  const scale = isMobile ? 0.7 : isTablet ? 0.85 : 1.0;

  const handWidth = Math.round(180 * scale);
  const handHeight = Math.round(220 * scale);
  const eyeSize = Math.round(70 * scale);
  const eyeTop = Math.round(52 * scale);

  const handleReenterReality = () => {
    setIsReturning(true);
    window.scrollTo({ top: 0 });
    setReturnTrigger(prev => prev + 1);
  };

  const handleReturnComplete = () => {
    setIsReturning(false);
  };

  // Lock scroll when returning to start via cinematic animation
  useEffect(() => {
    if (isReturning) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isReturning]);

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
      <RecursiveBloomCanvas 
        scrollPercent={scrollPercent} 
        theme={theme} 
        onScrollStateChange={setScrollState}
        returnTrigger={returnTrigger}
        onReturnComplete={handleReturnComplete}
      />

      {/* Viewport-locked Scrollytelling Panels Overlay */}
      <main 
        className="scrollytelling-overlay"
        style={{
          opacity: isReturning ? 0 : 1,
          pointerEvents: isReturning ? 'none' : 'auto',
          transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        
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
            zIndex: 150,
            pointerEvents: 'auto' // Make button clickable in overlay
          }}
        >
          {theme === 'light' ? '👁️ ENTER THE VOID' : '👁️ RE-ENTER REALITY'}
        </button>

        {/* ========================================================
            SECTION 1: HERO PORTAL & TITLE (scroll 0% to 18%)
            ======================================================== */}
        <section 
          className={`journey-section ${scrollState.activeSection === 'hero' ? 'active' : ''}`}
          aria-hidden={scrollState.activeSection !== 'hero'}
          aria-labelledby="hero-title"
        >
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
              Interactive Developer Portfolio & System Dashboard
            </div>
            
            <h1 
              id="hero-title"
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

            {/* Surreal Hand-Eye Portal Centerpiece */}
            <div 
              style={{ 
                position: 'relative', 
                width: `${handWidth}px`, 
                height: `${handHeight}px`, 
                margin: '35px auto', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}
            >
              <svg width={handWidth} height={handHeight} viewBox="0 0 100 120" style={{ position: 'absolute', overflow: 'visible' }}>
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
                size={eyeSize} 
                irisColor="var(--color-terracotta)" 
                style={{ 
                  position: 'absolute', 
                  top: `${eyeTop}px`,
                  boxShadow: '0 0 25px rgba(214, 60, 118, 0.45)' 
                }} 
              />
            </div>

            {/* Scroll Down Instructions panel */}
            <div 
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
                👁️ Scroll down to view projects & system metrics
              </p>
            </div>
          </motion.div>
        </section>

        {/* ========================================================
            SECTION 2: PROJECTS BLOCK (scroll 18% to 52%) - Left Aligned
            ======================================================== */}
        <section 
          className={`journey-section left-aligned-panel ${scrollState.activeSection === 'projects' ? 'active' : ''}`}
          aria-hidden={scrollState.activeSection !== 'projects'}
          aria-labelledby="projects-title"
        >
          {scrollState.activeProjectIndex >= 0 && scrollState.activeProjectIndex < portfolioData.projects.length && (
            <div className="comic-panel-card" style={{ width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
              {/* Peeking foliage eye behind the card top border */}
              <div style={{ position: 'absolute', top: '-26px', right: '35px', zIndex: -1, width: '60px', height: '60px', overflow: 'visible' }}>
                <FoliageLeavesRight />
                <SurrealEye size={36} irisColor="var(--color-navy)" style={{ position: 'relative', top: '10px', right: '-12px' }} />
              </div>

              <div className="card-header-bar">
                <span className="card-dot-marker red" />
                <span className="card-dot-marker yellow" />
                <span className="card-dot-marker green" />
                <span>project-architectures://{portfolioData.projects[scrollState.activeProjectIndex].title.toLowerCase().replace(/\s+/g, '-')}</span>
              </div>
              
              <div className="card-content-area" style={{ padding: '20px 24px 24px', overflowY: 'auto' }}>
                <h2 id="projects-title" className="melting-header" style={{ fontSize: '1.9rem', color: 'var(--text)', textShadow: '2px 2px 0 var(--color-terracotta)', marginBottom: '4px' }}>
                  PROJECTS & ARCHITECTURES
                </h2>
                <p className="jolly-subtitle" style={{ fontSize: '0.75rem', color: 'var(--color-sage)', marginBottom: '20px' }}>
                  Fusing Distributed Backends with Interactive User Interfaces
                </p>

                <motion.div 
                  key={scrollState.activeProjectIndex}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  style={{ padding: '14px', border: '1px solid rgba(140, 110, 201, 0.25)', borderRadius: '8px', background: 'rgba(140, 110, 201, 0.05)' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-main)' }}>
                      {portfolioData.projects[scrollState.activeProjectIndex].title}
                    </h3>
                    <span style={{ fontSize: '1.1rem' }}>
                      {scrollState.activeProjectIndex === 0 ? '🌐' : scrollState.activeProjectIndex === 1 ? '📋' : '🐱'}
                    </span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.68rem', color: scrollState.activeProjectIndex === 0 ? 'var(--color-terracotta)' : scrollState.activeProjectIndex === 1 ? 'var(--color-sage)' : 'var(--color-mustard)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px' }}>
                    {scrollState.activeProjectIndex === 0 ? 'Distributed Content Platform' : scrollState.activeProjectIndex === 1 ? 'Real-time Collaboration' : 'AI Scheduling Agent'}
                  </div>
                  <p className="legible-fira-text" style={{ fontSize: '0.78rem', opacity: 0.9, marginBottom: '12px' }}>
                    {portfolioData.projects[scrollState.activeProjectIndex].description}
                  </p>

                  {/* Tech stack tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                    {portfolioData.projects[scrollState.activeProjectIndex].tech.map(t => (
                      <span key={t} style={{
                        fontSize: '0.65rem',
                        fontFamily: 'var(--font-code)',
                        background: 'rgba(140, 110, 201, 0.12)',
                        border: '1px solid rgba(140, 110, 201, 0.25)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        color: 'var(--text)'
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <a 
                      href={portfolioData.projects[scrollState.activeProjectIndex].links.live} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-orange-resume" 
                      style={{ padding: '6px 12px', fontSize: '0.72rem', width: 'auto', textDecoration: 'none' }}
                      aria-label={`View live demo of ${portfolioData.projects[scrollState.activeProjectIndex].title}`}
                    >
                      Demo Link
                    </a>
                    <a 
                      href={portfolioData.projects[scrollState.activeProjectIndex].links.github} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn-orange-resume" 
                      style={{ padding: '6px 12px', fontSize: '0.72rem', width: 'auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid rgba(140, 110, 201, 0.3)', boxShadow: 'none', textDecoration: 'none' }}
                      aria-label={`View GitHub repository for ${portfolioData.projects[scrollState.activeProjectIndex].title}`}
                    >
                      GitHub
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </section>

        {/* ========================================================
            SECTION 3: SKILLS & STATS (scroll 55% to 82%) - Right Aligned
            ======================================================== */}
        <section 
          className={`journey-section right-aligned-panel ${scrollState.activeSection === 'skills' ? 'active' : ''}`}
          aria-hidden={scrollState.activeSection !== 'skills'}
          aria-labelledby="skills-title"
        >
          <div className="comic-panel-card" style={{ width: '100%', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="card-header-bar">
              <span className="card-dot-marker red" />
              <span className="card-dot-marker yellow" />
              <span className="card-dot-marker green" />
              <span>technical-specs://core-abstractions</span>
            </div>

            <div className="card-content-area" style={{ padding: '20px 24px 24px', overflowY: 'auto' }}>
              <h2 id="skills-title" className="melting-header" style={{ fontSize: '1.9rem', color: 'var(--text)', textShadow: '2px 2px 0 var(--color-navy)', marginBottom: '4px' }}>
                TECHNICAL PROFILE &amp; CORE METRICS
              </h2>
              <p className="jolly-subtitle" style={{ fontSize: '0.75rem', color: 'var(--color-navy)', marginBottom: '20px' }}>
                Core Metrics &amp; Professional Biography
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Bio & Stats */}
                <div style={{ padding: '14px', border: '1px solid rgba(140, 110, 201, 0.25)', borderRadius: '8px', background: 'rgba(140, 110, 201, 0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <h3 className="jolly-subtitle" style={{ fontSize: '0.9rem', color: 'var(--color-terracotta)', display: 'block', margin: 0 }}>
                      PROFESSIONAL BIOGRAPHY
                    </h3>
                    <SurrealEye size={24} irisColor="var(--color-terracotta)" style={{ border: '1px solid rgba(140, 110, 201, 0.35)' }} />
                  </div>
                  <p className="legible-fira-text" style={{ fontSize: '0.78rem', opacity: 0.95, marginBottom: '14px' }}>
                    {portfolioData.about.bio}
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {portfolioData.about.stats.map((s) => (
                      <div 
                        key={s.label}
                        className="comic-panel-card"
                        style={{
                          padding: '8px',
                          background: 'rgba(140,110,201,0.06)',
                          textAlign: 'center',
                          border: '1px solid rgba(140,110,201,0.25)',
                          boxShadow: 'none',
                          borderRadius: '6px'
                        }}
                      >
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-terracotta)', fontFamily: 'var(--font-main)' }}>
                          {s.value}
                        </div>
                        <div style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text)', opacity: 0.8 }}>
                          {s.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress bars */}
                <div style={{ padding: '14px', border: '1px solid rgba(140, 110, 201, 0.25)', borderRadius: '8px', background: 'rgba(140, 110, 201, 0.05)' }}>
                  <h3 className="jolly-subtitle" style={{ fontSize: '0.9rem', color: 'var(--color-navy)', display: 'block', marginBottom: '12px' }}>
                    CORE METRICS (Linear Bars)
                  </h3>

                  {skillsData.map((skill) => (
                    <div key={skill.name} className="linear-skill-container" style={{ marginBottom: '10px' }}>
                      <div className="linear-skill-label" style={{ fontSize: '0.75rem' }}>
                        <span>{skill.name}</span>
                        <span>{skill.percentage}%</span>
                      </div>
                      <div className="linear-skill-track" style={{ height: '7px' }}>
                        <div 
                          className="linear-skill-fill" 
                          style={{ width: `${skill.percentage}%`, backgroundColor: skill.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            SECTION 4: CONTACT & NETWORKING (scroll 82% to 100%) - Centered
            ======================================================== */}
        <section 
          className={`journey-section ${scrollState.activeSection === 'transmission' ? 'active' : ''}`}
          aria-hidden={scrollState.activeSection !== 'transmission'}
          aria-labelledby="transmission-title"
        >
          <div className="comic-panel-card" style={{ width: 'min(500px, 92%)' }}>
            <div className="card-header-bar">
              <span className="card-dot-marker red" />
              <span className="card-dot-marker yellow" />
              <span className="card-dot-marker green" />
              <span>contact://networking</span>
            </div>
            <div className="card-content-area" style={{ background: 'var(--card-bg)', padding: '24px', textAlign: 'center' }}>
              
              {/* Center contact eye */}
              <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 12px' }}>
                <SurrealEye size={50} irisColor="var(--color-navy)" style={{ border: '1.5px solid var(--border)' }} />
              </div>

              <h2 id="transmission-title" className="jolly-subtitle" style={{ fontSize: '1.5rem', color: 'var(--color-terracotta)', display: 'block', marginBottom: '8px' }}>
                CONTACT &amp; NETWORKING
              </h2>
              <p className="legible-fira-text" style={{ marginBottom: '18px', opacity: 0.95, fontSize: '0.78rem' }}>
                I am actively seeking full-time and contract software development opportunities. Reach out via email or follow my logs.
              </p>

              <div className="contact-grid" style={{ marginBottom: '20px', fontSize: '0.76rem' }}>
                <div>📧 <a href={`mailto:${portfolioData.contact.email}`} style={{ color: 'var(--color-navy)', textDecoration: 'none', fontWeight: 600 }} aria-label="Send email to Arsalan Bardsiri">arsalanbardsiri@gmail.com</a></div>
                <div>🐙 <a href={portfolioData.contact.github} target="_blank" rel="noreferrer" style={{ color: 'var(--color-navy)', textDecoration: 'none', fontWeight: 600 }} aria-label="Visit Arsalan Bardsiri's GitHub profile">GitHub</a></div>
                <div>🔗 <a href={portfolioData.contact.linkedin} target="_blank" rel="noreferrer" style={{ color: 'var(--color-navy)', textDecoration: 'none', fontWeight: 600 }} aria-label="Visit Arsalan Bardsiri's LinkedIn profile">LinkedIn</a></div>
                <div>📝 <a href={portfolioData.contact.devto} target="_blank" rel="noreferrer" style={{ color: 'var(--color-navy)', textDecoration: 'none', fontWeight: 600 }} aria-label="Read Arsalan Bardsiri's technical blog posts on Dev.to">Dev.to Blog</a></div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                <a 
                  href={portfolioData.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ textDecoration: 'none', pointerEvents: 'auto', width: '100%' }}
                  aria-label="Download Arsalan Bardsiri's Resume in PDF format"
                >
                  <button className="btn-orange-resume" style={{ fontSize: '0.84rem', width: '100%' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    DOWNLOAD RESUME (CV)
                  </button>
                </a>

                <button 
                  className="btn-orange-resume" 
                  onClick={handleReenterReality}
                  style={{ 
                    fontSize: '0.84rem', 
                    width: '100%', 
                    background: 'var(--color-navy)', 
                    color: '#ffffff', 
                    border: '1.5px solid var(--border)',
                    boxShadow: '0 4px 12px rgba(140, 110, 201, 0.25)',
                    pointerEvents: 'auto'
                  }}
                  aria-label="Re-enter reality and return to initial starting screen"
                >
                  👁️ RE-ENTER REALITY (Return to Start)
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Interaction Hints overlay at bottom */}
        <div className="interaction-bubble">
          <div className="interaction-item" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="interaction-tag">SYSTEM INDEX</span>
            <span>Active Node Path ({Math.round(scrollState.lerpedPercent * 100)}%)</span>
          </div>
        </div>

      </main>

      {/* Dummy scroll height container to capture standard wheel event */}
      <div className="scroll-dummy-spacer" />

    </div>
  );
}
