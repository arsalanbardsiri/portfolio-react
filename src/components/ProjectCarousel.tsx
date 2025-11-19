
import { FC } from 'react'
import data from '../data/portfolioData.json'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

export const ProjectCarousel: FC = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true
  }

  return (
    <section id="projects" className="container fade-up">
      <h2 className="section-title">Projects</h2>
      <div className="card">
        <Slider {...settings}>
          {data.projects.map((p) => (
            <div key={p.id} style={{ padding: 8 }}>
              <div className="grid cols-2">
                <div>
                  <img src={p.imageUrl} alt={p.title} style={{ borderRadius: '12px' }} />
                </div>
                <div>
                  <h3 style={{ marginTop: 0 }}>{p.title}</h3>
                  <p className="muted">{p.description}</p>
                  <div style={{ marginBottom: 12 }}>
                    {p.tech.map((t: string) => (<span key={t} className="tag">{t}</span>))}
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a className="btn" href={p.links.live} target="_blank" rel="noreferrer">Live</a>
                    <a className="btn secondary" href={p.links.github} target="_blank" rel="noreferrer">Source</a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  )
}
