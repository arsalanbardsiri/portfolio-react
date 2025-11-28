import { FC, useEffect, useRef } from 'react';

export const DotGrid: FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let mouseX = -1000;
        let mouseY = -1000;

        // Dot configuration
        const spacing = 30;
        const dotSize = 1.5;
        const baseOpacity = 0.1;
        const hoverRadius = 200;

        // Blinking logic
        const blinkCount = 10;
        const blinks: { x: number; y: number; opacity: number; speed: number }[] = [];

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        const initBlinks = () => {
            for (let i = 0; i < blinkCount; i++) {
                blinks.push({
                    x: Math.floor(Math.random() * (width / spacing)) * spacing,
                    y: Math.floor(Math.random() * (height / spacing)) * spacing,
                    opacity: 0,
                    speed: 0.02 + Math.random() * 0.03
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw Grid
            for (let x = 0; x < width; x += spacing) {
                for (let y = 0; y < height; y += spacing) {
                    const dx = x - mouseX;
                    const dy = y - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    let opacity = baseOpacity;
                    let color = '150, 150, 150'; // Default grey

                    // Spotlight Effect
                    if (dist < hoverRadius) {
                        const intensity = 1 - dist / hoverRadius;
                        opacity = baseOpacity + intensity * 0.6; // Boost opacity
                        color = '0, 242, 255'; // Cyan glow
                    }

                    ctx.fillStyle = `rgba(${color}, ${opacity})`;
                    ctx.beginPath();
                    ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Draw Blinking Dots
            blinks.forEach((blink) => {
                blink.opacity += blink.speed;
                if (blink.opacity > 1 || blink.opacity < 0) {
                    blink.speed = -blink.speed; // Reverse fade
                    if (blink.opacity < 0) {
                        // Reset to new random location when fully faded out
                        blink.x = Math.floor(Math.random() * (width / spacing)) * spacing;
                        blink.y = Math.floor(Math.random() * (height / spacing)) * spacing;
                        blink.opacity = 0;
                        blink.speed = 0.02 + Math.random() * 0.03;
                    }
                }

                ctx.fillStyle = `rgba(0, 242, 255, ${Math.max(0, blink.opacity)})`;
                ctx.beginPath();
                ctx.arc(blink.x, blink.y, dotSize * 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Glow for blinking dots
                if (blink.opacity > 0.5) {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = 'rgba(0, 242, 255, 0.8)';
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            });

            requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        initBlinks();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0 // Behind content but in front of gradient
            }}
        />
    );
};
