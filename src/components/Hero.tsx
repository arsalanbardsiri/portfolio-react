import { FC } from "react";
import Typewriter from "typewriter-effect";
import data from "../data/portfolioData.json";

interface HeroProps {
  onNavigate: (id: string) => void;
}

export const Hero: FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section id="home" className="container hero fade-up">
      <div className="hero-card">
        <h1 className="hero-title">{data.name}</h1>
        <div style={{ fontWeight: 700, fontSize: "18px", opacity: 0.9 }}>
          <Typewriter
            options={{
              strings: data.typewriterTexts,
              autoStart: true,
              loop: true,
            }}
          />
        </div>
        <p className="hero-sub">{data.bio}</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="btn" onClick={() => onNavigate("projects")}>
            View Projects
          </button>
          <a
            className="btn secondary"
            href={data.contact.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="avatar-wrap fade-up" style={{ animationDelay: "500ms" }}>
        <div className="avatar">
          <img src="./assets/images/IMG_2155.jpeg" alt="Profile" />
        </div>
      </div>
    </section>
  );
};
