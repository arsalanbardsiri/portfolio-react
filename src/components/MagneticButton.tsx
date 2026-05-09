import { useRef, useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    href?: string;
    target?: string;
    rel?: string;
    style?: React.CSSProperties;
    as?: 'button' | 'a';
    "aria-label"?: string;
}

export default function MagneticButton({ 
    children, 
    className = "", 
    onClick, 
    href, 
    target, 
    rel, 
    style,
    as = 'button',
    ...props 
}: MagneticButtonProps) {
    const ref = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouse = (e: React.MouseEvent<HTMLElement>) => {
        // Only apply magnetic effect on devices that support hover (not touch screens)
        if (window.matchMedia("(hover: none)").matches) return;

        const { clientX, clientY } = e;
        if (!ref.current) return;
        
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        
        // Adjust the multiplier to increase/decrease the magnetic pull strength
        setPosition({ x: middleX * 0.2, y: middleY * 0.2 });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
        setIsHovered(false);
    };

    const mouseEnter = () => {
        if (window.matchMedia("(hover: none)").matches) return;
        setIsHovered(true);
    };

    const MotionComponent = as === 'a' ? motion.a : motion.button;

    return (
        <MotionComponent
            // @ts-ignore
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            onMouseEnter={mouseEnter}
            animate={{ 
                x: position.x, 
                y: position.y,
                scale: isHovered ? 1.05 : 1
            }}
            transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 15, 
                mass: 0.1 
            }}
            whileTap={{ scale: 0.95 }}
            className={`btn ${className}`}
            onClick={onClick}
            href={href}
            target={target}
            rel={rel}
            style={style}
            {...props}
        >
            {children}
        </MotionComponent>
    );
}
