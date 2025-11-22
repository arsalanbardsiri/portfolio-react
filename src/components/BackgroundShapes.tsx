import { FC, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const BackgroundShapes: FC = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"]
    });

    // Parallax transforms
    const y1 = useTransform(scrollYProgress, [0, 1], [0, 500]);
    const y2 = useTransform(scrollYProgress, [0, 1], [0, -300]);
    const y3 = useTransform(scrollYProgress, [0, 1], [0, 200]);
    const rotate1 = useTransform(scrollYProgress, [0, 1], [0, 180]);
    const rotate2 = useTransform(scrollYProgress, [0, 1], [0, -90]);

    return (
        <div ref={ref} style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            pointerEvents: 'none',
            overflow: 'hidden'
        }}>
            {/* Floating Diamond - Top Left */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '10%',
                    left: '5%',
                    width: '100px',
                    height: '100px',
                    border: '2px solid rgba(0, 242, 255, 0.05)',
                    rotate: 45,
                    y: y1,
                    rotateZ: rotate1
                }}
            />

            {/* Floating Square - Middle Right */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '40%',
                    right: '8%',
                    width: '150px',
                    height: '150px',
                    background: 'rgba(112, 0, 255, 0.03)',
                    y: y2,
                    rotateZ: rotate2
                }}
            />

            {/* Floating Circle - Bottom Left */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '70%',
                    left: '15%',
                    width: '80px',
                    height: '80px',
                    border: '2px dashed rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%',
                    y: y3
                }}
            />

            {/* Small Dots Cluster */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: '25%',
                    right: '20%',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '10px',
                    y: y1
                }}
            >
                {[...Array(9)].map((_, i) => (
                    <div key={i} style={{
                        width: '4px',
                        height: '4px',
                        background: 'rgba(0, 242, 255, 0.1)',
                        borderRadius: '50%'
                    }} />
                ))}
            </motion.div>
        </div>
    );
};
