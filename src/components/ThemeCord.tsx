import { FC, useState } from 'react'
import { motion, useSpring, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface ThemeCordProps {
    isDarkMode: boolean
    onToggle: () => void
}

export const ThemeCord: FC<ThemeCordProps> = ({ isDarkMode, onToggle }) => {
    const [hasInteracted, setHasInteracted] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    // Physics values
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Spring physics for the "floppy" swing return
    // Lower stiffness = looser/floppier feel
    const springX = useSpring(x, { stiffness: 150, damping: 10 })
    const springY = useSpring(y, { stiffness: 150, damping: 10 })

    // SVG Line coordinates (attached to handle)
    // Container is 40px wide, center is 20px.
    // Handle is centered at 20px (left: 50%).
    // Line ends at handle's top center (20 + x, 60 + y).
    const lineX = useTransform(springX, (val) => val + 20)
    const lineY = useTransform(springY, (val) => val + 60)

    // Glow colors based on theme
    const glowColor = isDarkMode ? '#00f2ff' : '#7000ff'
    const cordColor = isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false)
        setHasInteracted(true)
        const draggedDistance = info.offset.y

        // Trigger toggle if pulled down enough
        if (draggedDistance > 50) {
            if (navigator.vibrate) navigator.vibrate(50)
            onToggle()
        }

        // Reset position (springs will handle the animation back to 0,0)
        x.set(0)
        y.set(0)
    }

    return (
        <div style={{ position: 'relative', width: '40px', height: '300px', display: 'flex', justifyContent: 'center', zIndex: 50, pointerEvents: 'none' }}>
            {/* Animated Chevron Hint */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: hasInteracted ? 0 : 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                style={{
                    position: 'absolute',
                    top: '30px',
                    right: '35px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '-5px',
                    pointerEvents: 'none'
                }}
            >
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.2,
                            ease: "easeInOut"
                        }}
                        style={{
                            color: isDarkMode ? 'var(--primary)' : 'var(--secondary)',
                            lineHeight: 0.5,
                            fontSize: '1.2rem',
                            fontWeight: 'bold'
                        }}
                    >
                        ⌄
                    </motion.div>
                ))}
            </motion.div>

            {/* SVG Chain Cord */}
            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'visible' }}>
                <motion.line
                    x1="20"
                    y1="0"
                    x2={lineX}
                    y2={lineY}
                    stroke={cordColor}
                    strokeWidth="3"
                    strokeDasharray="1 3"
                    strokeLinecap="round"
                />
            </svg>

            {/* The Handle (Neon Ring) */}
            <motion.div
                drag
                dragSnapToOrigin
                dragConstraints={{ top: 0, bottom: 100, left: -50, right: 50 }}
                dragElastic={0.2}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                onDrag={(_, info) => {
                    x.set(info.offset.x)
                    y.set(info.offset.y)
                }}
                style={{
                    x: springX,
                    y: springY,
                    position: 'absolute',
                    top: 60, // Initial cord length
                    left: '50%', // Explicitly center
                    marginLeft: '-12px', // Offset by half width to center
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `3px solid ${glowColor}`,
                    background: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
                    boxShadow: `0 0 15px ${glowColor}, inset 0 0 10px ${glowColor}`,
                    cursor: 'grab',
                    touchAction: 'none',
                    pointerEvents: 'auto',
                }}
                whileHover={{ scale: 1.1, cursor: 'grab' }}
                whileTap={{ cursor: 'grabbing', scale: 0.95 }}
            />
        </div>
    )
}
