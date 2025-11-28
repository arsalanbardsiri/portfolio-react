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
      <h2 className="section-title">Technical Arsenal</h2>
      <motion.div
        className="bento-grid"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {data.skills.map((category: any, i: number) => (
          <motion.div
            key={i}
            variants={item}
            className={`glass-card bento-item item-${i}`}
            whileHover={{ y: -5 }}
          >
            <h3 style={{
              fontSize: '1.5rem',
              marginBottom: '1.5rem',
              color: 'var(--primary)',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              paddingBottom: '10px'
            }}>
              {category.category}
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {category.items.map((skill: string) => (
                <span key={skill} style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '0.95rem',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--text)'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, auto);
          gap: 24px;
        }
        
        .bento-item {
          padding: 30px;
          display: flex;
          flex-direction: column;
        }

        /* Bento Layout Logic */
        .item-0 {
          grid-column: span 2; /* Frontend spans 2 columns */
          grid-row: span 2;    /* And 2 rows for prominence */
          background: linear-gradient(135deg, rgba(20,20,20,0.8) 0%, rgba(0, 242, 255, 0.05) 100%);
        }

        .item-1 {
          grid-column: span 1; /* Backend */
        }

        .item-2 {
          grid-column: span 1; /* Tools */
        }

        @media (max-width: 900px) {
          .bento-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }
          .item-0, .item-1, .item-2 {
            grid-column: span 1;
            grid-row: span 1;
          }
        }
      `}</style>
    </section>
  );
};
