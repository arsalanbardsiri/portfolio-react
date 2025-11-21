import { FC, useState } from 'react'
import { motion, useSpring, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface ThemeCordProps {
    isDarkMode: boolean
    onToggle: () => void
}

export const ThemeCord: FC<ThemeCordProps> = ({ isDarkMode, onToggle }) => {
    const [hasInteracted, setHasInteracted] = useState(false)
    const [isDragging, setIsDragging] = useState(false)

    // Motion values for the pull physics
    const y = useMotionValue(0)
    const springY = useSpring(y, { stiffness: 400, damping: 15 })

    // Transform the cord height based on the drag
    const height = useTransform(springY, [0, 150], [60, 210])

    // Glow colors based on theme
    const glowColor = isDarkMode ? '#00f2ff' : '#7000ff'
    const cordColor = isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'

    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setIsDragging(false)
        setHasInteracted(true)
        const draggedDistance = info.offset.y

        // Trigger toggle if pulled down enough
        if (draggedDistance > 50) {
            // Haptic feedback pattern if supported
            if (navigator.vibrate) navigator.vibrate(50)
            onToggle()
        }

        // Reset position
        y.set(0)
    }

    return (
        <div style={{ position: 'relative', width: '40px', height: '60px', display: 'flex', justifyContent: 'center', zIndex: 50 }}>
            {/* Hint Tooltip */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{
                    opacity: hasInteracted ? 0 : 1,
                    y: hasInteracted ? -10 : [0, -5, 0]
                }}
                transition={{
                    opacity: { delay: 1, duration: 0.5 },
                    y: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                }}
                style={{
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 'max-content',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'var(--primary)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    pointerEvents: 'none',
                    marginTop: '10px',
                    border: '1px solid var(--primary)'
                }}
            >
                Pull me!
            </motion.div>

            {/* The Cord Line */}
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    width: '2px',
                    height: height,
                    background: cordColor,
                    originY: 0,
                    boxShadow: isDragging ? `0 0 10px ${glowColor}` : 'none'
                }}
            />

            {/* The Handle (Neon Ring) */}
            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 150 }}
                dragElastic={0.1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={handleDragEnd}
                onDrag={(_, info) => y.set(info.offset.y)}
                animate={{
                    y: isDragging ? undefined : [0, 5, 0] // Subtle bobbing when idle
                }}
                transition={{
                    y: {
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut",
                        repeatType: "reverse"
                    }
                }}
                style={{
                    y: springY,
                    position: 'absolute',
                    bottom: 0, // Starts at the bottom of the container, but controlled by 'y'
                    top: 60, // Initial cord length
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `3px solid ${glowColor}`,
                    background: isDarkMode ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)',
                    boxShadow: `0 0 15px ${glowColor}, inset 0 0 10px ${glowColor}`,
                    cursor: 'grab',
                    touchAction: 'none'
                }}
                whileHover={{ scale: 1.1, cursor: 'grab' }}
                whileTap={{ cursor: 'grabbing', scale: 0.95 }}
            />
        </div>
    )
}
