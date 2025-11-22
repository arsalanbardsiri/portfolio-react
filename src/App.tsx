import { useRef } from 'react'
import { NavBar } from './components/NavBar'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { ProjectCarousel } from './components/ProjectCarousel'
import { SkillsGrid } from './components/SkillsGrid'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'
import { BackgroundShapes } from './components/BackgroundShapes'
import { useTheme } from './hooks/useTheme'

export default function App() {
  const homeRef = useRef<HTMLElement | null>(null)
  const aboutRef = useRef<HTMLElement | null>(null)
  const projectsRef = useRef<HTMLElement | null>(null)
  const skillsRef = useRef<HTMLElement | null>(null)
  const contactRef = useRef<HTMLElement | null>(null)

  const { theme, toggle } = useTheme()

  const onNavigate = (id: string) => {
    const map: Record<string, HTMLElement | null> = {
      home: document.getElementById('home'),
      about: document.getElementById('about'),
      projects: document.getElementById('projects'),
      skills: document.getElementById('skills'),
      contact: document.getElementById('contact'),
    }
    const el = map[id]
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <NavBar onNavigate={onNavigate} onToggleTheme={toggle} isDarkMode={theme === 'dark'} />
      <main>
        <Hero onNavigate={onNavigate} />
        <About />
        <ProjectCarousel />
        <SkillsGrid />
        <ContactSection />
      </main>
      <Footer />
      <BackgroundShapes />
    </div>
  )
}
