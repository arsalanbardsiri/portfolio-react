import { FC } from 'react'
import data from '../data/portfolioData.json'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import { motion } from 'framer-motion'

export const ProjectCarousel: FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    autoplay: true,
    autoplaySpeed: 4000,
  }

  return (
    <section id="projects" className="container">
      <h2 className="section-title">Featured Projects</h2>
      <motion.div
        className="glass-card"
        style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto' }}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        whileHover={{
          y: -5,
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 242, 255, 0.15)",
          borderColor: "rgba(0, 242, 255, 0.3)"
        }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <Slider {...settings}>
          {data.projects.map((p) => (
            <div key={p.id} style={{ outline: 'none' }}>
              <div className="grid grid-cols-2" style={{ gap: '40px', alignItems: 'center' }}>
                <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
                  <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.5s ease' }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text)' }}>{p.title}</h3>
                  <p className="muted" style={{ fontSize: '1.1rem', marginBottom: '1.5rem', lineHeight: 1.7 }}>{p.description}</p>
                  <div style={{ marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {p.tech.map((t: string) => (
                      <span key={t} className="tag" style={{
                        background: 'rgba(0, 242, 255, 0.1)',
                        color: 'var(--primary)',
                        border: '1px solid rgba(0, 242, 255, 0.2)',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '0.9rem'
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-primary"
                      href={p.links.live}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live Demo
                    </motion.a>
                    <motion.a
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-secondary"
                      href={p.links.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source Code
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </motion.div>

      <style>{`
        .slick-dots li button:before {
          color: var(--text-muted);
          font-size: 12px;
        }
        .slick-dots li.slick-active button:before {
          color: var(--primary);
        }
        .slick-prev:before, .slick-next:before {
          color: var(--primary);
        }
        @media (max-width: 768px) {
          .grid-cols-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  )
}
