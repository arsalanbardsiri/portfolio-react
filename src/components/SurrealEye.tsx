import React, { useEffect, useRef, useState } from 'react';

interface SurrealEyeProps {
  size?: number;
  irisColor?: string;
  style?: React.CSSProperties;
  className?: string;
  lookAtMouse?: boolean;
}

export const SurrealEye: React.FC<SurrealEyeProps> = ({
  size = 60,
  irisColor = 'var(--color-navy)',
  style,
  className,
  lookAtMouse = true
}) => {
  const eyeRef = useRef<HTMLDivElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!lookAtMouse) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!eyeRef.current) return;
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;
      
      const dx = e.clientX - eyeX;
      const dy = e.clientY - eyeY;
      const angle = Math.atan2(dy, dx);
      
      // Limit pupil movement inside sclera boundary
      const maxDist = size * 0.20;
      const dist = Math.min(maxDist, Math.hypot(dx, dy) * 0.08); // responsive factor
      
      setPupilPos({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [size, lookAtMouse]);

  const scleraWidth = size;
  const scleraHeight = size * 0.62;
  const irisSize = size * 0.46;
  const pupilSize = size * 0.22;

  return (
    <div
      ref={eyeRef}
      className={className}
      style={{
        width: scleraWidth,
        height: scleraHeight,
        borderRadius: '50%',
        background: '#ffffff',
        border: '1.8px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Iris */}
      <div
        style={{
          width: irisSize,
          height: irisSize,
          borderRadius: '50%',
          background: irisColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)`,
          transition: 'transform 0.08s ease-out',
          border: '1.2px solid var(--border)'
        }}
      >
        {/* Pupil */}
        <div
          style={{
            width: pupilSize,
            height: pupilSize,
            borderRadius: '50%',
            background: '#121124',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Highlight glint */}
          <div
            style={{
              width: pupilSize * 0.35,
              height: pupilSize * 0.35,
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '15%',
              left: '15%'
            }}
          />
        </div>
      </div>
    </div>
  );
};
