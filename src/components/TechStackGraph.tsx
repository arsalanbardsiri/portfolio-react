import { FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { portfolioData } from '../data/portfolioData';

export const TechStackGraph: FC = () => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const categories = portfolioData.skills;

    return (
        <section id="skills" style={{
            position: 'relative',
            minHeight: '100vh',
            overflow: 'hidden',
            padding: '100px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>

            {/* Header - Standard Centering */}
            <div style={{
                width: 'fit-content', // Force Flexbox centering
                margin: '0 auto 80px auto', // Auto margins
                textAlign: 'center',
                zIndex: 10,
                position: 'relative'
            }}>
                <h2 className="section-title" style={{ margin: '0', display: 'block' }}>Technical Ecosystem</h2>
            </div>

            {/* Graph Container */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth: '1200px',
                margin: '0 auto', // Ensure this container is also centered
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                perspective: '1000px'
            }}>

                {/* --- BLACK HOLE CORE --- */}
                {/* Fixed height container to prevent layout shifts */}
                <div style={{
                    position: 'relative',
                    zIndex: 20,
                    height: isMobile ? '100px' : '140px',
                    width: isMobile ? '100px' : '140px',
                    marginBottom: isMobile ? '50px' : '100px' // Explicit Gap via Margin
                }}>
                    <motion.div
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            width: '100%', height: '100%',
                            borderRadius: '50%',
                            background: '#000',
                            boxShadow: `
                                0 0 60px var(--primary), 
                                inset 0 0 40px var(--primary),
                                0 0 100px rgba(0,0,0,0.8)
                            `,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'relative'
                        }}
                    >
                        {/* Accretion Disk - Pointer Events None to avoid interaction issues */}
                        <div style={{
                            position: 'absolute',
                            top: '-20%', left: '-20%',
                            width: '140%', height: '140%',
                            borderRadius: '50%',
                            border: '2px solid var(--glass-border)', // Theme-aware border
                            borderTopColor: 'var(--primary)',
                            animation: 'spin 10s linear infinite',
                            opacity: 0.5,
                            pointerEvents: 'none'
                        }} />

                        {/* Inner Void */}
                        <div style={{
                            width: '90%', height: '90%',
                            borderRadius: '50%',
                            background: '#000',
                            zIndex: 2
                        }} />
                    </motion.div>
                </div>

                {/* --- PIPES LAYER --- */}
                {/* Positioned absolute relative to the Graph Container */}
                <div style={{
                    position: 'absolute',
                    top: isMobile ? '50px' : '70px', // Start at center of Core
                    left: 0,
                    width: '100%',
                    height: '100%', // Covers the whole area down to cards
                    pointerEvents: 'none',
                    zIndex: 0
                }}>
                    <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                        <defs>
                            <linearGradient id="pipe-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
                                <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {!isMobile && (
                            <>
                                {/* 
                                    Coordinates Logic:
                                    Start: (50%, 0) -> Center of Core
                                    End Y: 100px (Gap) + 70px (Half Core) = 170px? 
                                    Actually, the SVG starts at 70px (Center of Core).
                                    The Cards start at 140px (Core Height) + 100px (Margin) = 240px from top of container.
                                    So relative to SVG top (70px), the Cards start at 240 - 70 = 170px.
                                    Let's extend the pipes a bit more to be safe, say 180px.
                                */}
                                {/* Left Pipe -> 1/6 width (approx 16.66%) */}
                                <PipePath fromX="50%" fromY="0" toX="16.66%" toY="180" />
                                {/* Center Pipe -> 50% width */}
                                <PipePath fromX="50%" fromY="0" toX="50%" toY="180" />
                                {/* Right Pipe -> 5/6 width (approx 83.33%) */}
                                <PipePath fromX="50%" fromY="0" toX="83.33%" toY="180" />
                            </>
                        )}

                        {isMobile && (
                            // Mobile: Short vertical pipe to bridge the gap
                            <PipePath fromX="50%" fromY="0" toX="50%" toY="50" />
                        )}
                    </svg>
                </div>

                {/* --- CARDS ROW --- */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: '30px',
                    width: '100%',
                    position: 'relative',
                    zIndex: 10
                }}>
                    {categories.map((cat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.2 }}
                            className="tech-card"
                            style={{
                                background: 'var(--bg-alt)',
                                borderRadius: '20px',
                                border: '1px solid var(--glass-border)',
                                padding: '30px',
                                position: 'relative',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '20px',
                                backdropFilter: 'blur(10px)',
                                transformStyle: 'preserve-3d',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                            }}
                        >
                            {/* Animated Border (Snake Effect) */}
                            <div className="card-border" />

                            {/* Header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '10px',
                                borderBottom: '1px solid var(--glass-border)', paddingBottom: '15px',
                                position: 'relative', zIndex: 2
                            }}>
                                <div style={{
                                    width: '10px', height: '10px', borderRadius: '50%',
                                    background: 'var(--primary)', boxShadow: '0 0 10px var(--primary)'
                                }} />
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>{cat.category}</h3>
                            </div>

                            {/* Skills Grid */}
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', position: 'relative', zIndex: 2 }}>
                                {cat.items.map((skill, j) => (
                                    <span
                                        key={j}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--glass-border)',
                                            fontSize: '0.9rem',
                                            color: 'var(--text-muted)',
                                            cursor: 'default',
                                            display: 'inline-block',
                                            transition: 'all 0.2s ease'
                                        }}
                                        className="skill-tag"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                /* Card Hover Effects */
                .tech-card:hover {
                    transform: translateY(-10px) scale(1.02);
                    box-shadow: 0 20px 40px -10px rgba(0,0,0,0.5), 0 0 30px var(--primary-glow);
                    border-color: var(--primary);
                }

                /* Simpler Snake Border using moving background */
                .card-border {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    pointer-events: none;
                    z-index: 1;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    background: linear-gradient(90deg, var(--primary), transparent) top left / 50% 2px no-repeat,
                                linear-gradient(90deg, transparent, var(--primary)) bottom right / 50% 2px no-repeat,
                                linear-gradient(0deg, var(--primary), transparent) top right / 2px 50% no-repeat,
                                linear-gradient(0deg, transparent, var(--primary)) bottom left / 2px 50% no-repeat;
                    background-size: 0% 2px, 0% 2px, 2px 0%, 2px 0%;
                    transition: background-size 0.5s ease, opacity 0.3s ease;
                }
                .tech-card:hover .card-border {
                    opacity: 1;
                    background-size: 100% 2px, 100% 2px, 2px 100%, 2px 100%;
                }

                /* Skill Tag Hover */
                .skill-tag:hover {
                    background: var(--primary) !important;
                    color: var(--bg) !important;
                    box-shadow: 0 0 15px var(--primary);
                    border-color: var(--primary) !important;
                    transform: translateY(-2px);
                }
            `}</style>
        </section>
    );
};

const PipePath: FC<{ fromX: string, fromY: string, toX: string, toY: number | string }> = ({ fromX, fromY, toX, toY }) => {
    return (
        <g>
            <line
                x1={fromX} y1={fromY}
                x2={toX} y2={toY}
                stroke="var(--glass-border)"
                strokeWidth="2"
                opacity="0.3"
            />
            <motion.line
                x1={fromX} y1={fromY}
                x2={toX} y2={toY}
                stroke="var(--primary)" // Solid color for visibility debugging
                strokeWidth="3"
                strokeDasharray="10 10"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -100 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
        </g>
    );
};
