import { FC, useState } from 'react'
import { motion, useSpring, useMotionValue, useTransform, PanInfo } from 'framer-motion'

interface ThemeCordProps {
    isDarkMode: boolean
    onToggle: () => void
}

export const ThemeCord: FC<ThemeCordProps> = ({ isDarkMode, onToggle }) => {
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
