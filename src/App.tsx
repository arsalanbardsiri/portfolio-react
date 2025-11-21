import { useRef } from 'react'
import { NavBar } from './components/NavBar'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { ProjectCarousel } from './components/ProjectCarousel'
import { SkillsGrid } from './components/SkillsGrid'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'

export default function App() {
  const onNavigate = (id: string) => {
    const element = document.getElementById(id)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <NavBar onNavigate={onNavigate} />
      <main>
        <Hero onNavigate={onNavigate} />
        <About />
        <ProjectCarousel />
        <SkillsGrid />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
