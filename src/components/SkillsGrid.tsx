
import { FC } from "react";
import { portfolioData as data } from '../data/portfolioData';
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export const SkillsGrid: FC = () => {
  return (
    <section id="skills" className="container">
      <h2 className="section-title">Technical Skills</h2>
      <motion.div
        className="grid grid-cols-3"
        style={{ gap: '40px' }}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {data.skills.map((s, i) => (
          <motion.div
            key={i}
            variants={item}
            whileHover={{
              y: -5,
              borderColor: 'var(--primary)',
              boxShadow: '0 0 20px rgba(0, 242, 255, 0.2)'
            }}
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
          </motion.div>
        ))}
      </motion.div>
      <style>{`
@media(max - width: 600px) {
          .grid - cols - 3 {
    grid - template - columns: repeat(2, 1fr)!important;
  }
}
`}</style>
    </section>
  );
};
