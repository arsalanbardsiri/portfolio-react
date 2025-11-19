import { FC } from "react";
import data from "../data/portfolioData.json";

export const SkillsGrid: FC = () => {
  return (
    <section id="skills" className="container fade-up">
      <h2 className="section-title">Skills</h2>
      <div className="card">
        <div className="grid cols-3">
          {data.skills.map((s, i) => (
            <div
              key={i}
              className="tag"
              style={{ fontSize: 14, padding: "10px 12px" }}
            >
              {s}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
