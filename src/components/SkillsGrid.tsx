import { FC } from "react";
import data from "../data/portfolioData.json";

export const SkillsGrid: FC = () => {
  return (
    <section id="skills" className="container">
      <h2 className="section-title">Technical Skills</h2>
      <div className="grid grid-cols-3" style={{ gap: '20px' }}>
        {data.skills.map((s, i) => (
          <div
            key={i}
            className="glass-card"
            style={{
              padding: "20px",
              textAlign: 'center',
              fontSize: '1.1rem',
              fontWeight: 500,
              color: 'var(--text)',
              cursor: 'default'
            }}
          >
            {s}
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 600px) {
          .grid-cols-3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </section>
  );
};
