
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ParticleImageProps {
    src: string;
    scale?: number;
    threshold?: number; // Brightness threshold to spawn a particle
    particleSize?: number;
    hoverRadius?: number; // How far particles scatter
    hoverStrength?: number; // Force of scatter
}

export default function ParticleImage({
    src,
    scale = 1,
    threshold = 0.1,
    particleSize = 2.0,
    hoverRadius = 30, // Reduced radius for tighter control
    hoverStrength = 20, // Reduced strength
}: ParticleImageProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const particlesRef = useRef<THREE.Points | null>(null);
    const mouseRef = useRef(new THREE.Vector2(-9999, -9999));
    const rafRef = useRef<number>();

    useEffect(() => {
        if (!containerRef.current) return;

        // 1. Setup Scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;

        const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.z = 330; // Wide angle close-up
        cameraRef.current = camera;

        const renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 2. Load Image & Create Particles
        const img = new Image();
        img.src = src;
        // img.crossOrigin = "Anonymous"; // Often causes issues with local assets in Vite

        img.onload = () => {
            // Create canvas to read pixels
            const canvas = document.createElement('canvas');
            // Higher resolution for more particles (smoother look)
            const size = 350;
            const aspect = img.width / img.height;

            canvas.width = size;
            canvas.height = size / aspect;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imgData.data;

            const positions: number[] = [];
            const colors: number[] = [];
            const originalPositions: number[] = [];

            const numParticles = pixels.length / 4;

            // Calculate centering offset
            const startX = -(canvas.width * scale) / 2;
            const startY = -(canvas.height * scale) / 2;

            // Define circular mask radius (use the smallest dimension to ensure fit)
            // Reduced to 85% to ensure it fits within camera frustum at high zoom
            const maskRadius = (Math.min(canvas.width, canvas.height) * scale) / 2;

            for (let i = 0; i < numParticles; i++) {
                // Skip pixels to create "separated" look (Formation style)
                // Skip 2 out of every 3 pixels (keep index 0, skip 1, 2)
                if (i % 3 !== 0) continue;

                const r = pixels[i * 4] / 255;
                const g = pixels[i * 4 + 1] / 255;
                const b = pixels[i * 4 + 2] / 255;
                const a = pixels[i * 4 + 3] / 255;

                // Roughly calculate brightness
                const brightness = r * 0.299 + g * 0.587 + b * 0.114;

                // Calculate position relative to center
                const col = i % canvas.width;
                const row = Math.floor(i / canvas.width);

                const x = col * scale + startX;
                const y = -(row * scale) - startY;
                const z = 0;

                // Circular Mask & Blend Logic
                const dist = Math.sqrt(x * x + y * y);

                // If outside radius, skip (Hard Cut for perfect circle shape)
                if (dist > maskRadius) continue;

                // Calculate opacity fade at edges (Soft Blend)
                // Fade out last 40% of the radius for very smooth blend
                const fadeStart = maskRadius * 0.6;
                let alpha = 1.0;
                if (dist > fadeStart) {
                    alpha = 1.0 - ((dist - fadeStart) / (maskRadius - fadeStart));
                    if (alpha < 0) alpha = 0;
                }

                if (a > 0.5 && brightness > threshold && alpha > 0.01) {
                    positions.push(x, y, z);
                    originalPositions.push(x, y, z);
                    // Multiply color intensity by alpha for "fade" effect since we use additive blending?
                    // Or control opacity in material? 
                    // Simpler: Pre-multiply color darkness
                    colors.push(r * alpha, g * alpha, b * alpha);
                }
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
            geometry.setAttribute('initialPosition', new THREE.Float32BufferAttribute(originalPositions, 3));

            // Use standard material 
            const material = new THREE.PointsMaterial({
                size: particleSize * 1.2, // Slightly larger individual dots since fewer of them
                vertexColors: true,
                transparent: true,
                opacity: 0.9,
                sizeAttenuation: true,
                blending: THREE.AdditiveBlending // Adds glowy feel
            });

            const points = new THREE.Points(geometry, material);
            scene.add(points);
            particlesRef.current = points;
        };

        img.onerror = (e) => {
            console.error("ParticleImage: Failed to load image", e);
        };

        // 3. Animation Loop
        const animate = () => {
            rafRef.current = requestAnimationFrame(animate);

            if (particlesRef.current && cameraRef.current) {
                // Raycasting to get world mouse position
                // We actually need to project the mouse 2D coords into 3D world space at Z=0

                // Convert screen mouse (-1 to 1) to world pos at z=0 plane
                let vec = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0.5);
                vec.unproject(cameraRef.current);
                vec.sub(cameraRef.current.position).normalize();

                let distance = -cameraRef.current.position.z / vec.z;
                let pos = new THREE.Vector3();
                pos.copy(cameraRef.current.position).add(vec.multiplyScalar(distance));

                // Update Shader Uniforms
                // const material = particlesRef.current.material as THREE.ShaderMaterial;
                // material.uniforms.uMouse.value.x = pos.x;
                // material.uniforms.uMouse.value.y = pos.y;

                // CPU-side interaction for standard material
                const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
                const initials = particlesRef.current.geometry.attributes.initialPosition.array as Float32Array;

                const smoothRadius = hoverRadius * 1.2; // Wider interaction area

                for (let i = 0; i < positions.length; i += 3) {
                    const ix = initials[i];
                    const iy = initials[i + 1];

                    const dx = pos.x - ix;
                    const dy = pos.y - iy;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < smoothRadius) {
                        const force = (smoothRadius - dist) / smoothRadius;
                        const angle = Math.atan2(dy, dx);

                        // Gentler push
                        const targetX = ix - Math.cos(angle) * force * hoverStrength;
                        const targetY = iy - Math.sin(angle) * force * hoverStrength;

                        // Lerp towards target for "smooth" entry (Slower = Smoother)
                        positions[i] += (targetX - positions[i]) * 0.1; // Reduced from 0.2
                        positions[i + 1] += (targetY - positions[i + 1]) * 0.1;
                    } else {
                        // Slower return to home for "liquid" feel (Reduced from 0.08)
                        positions[i] += (ix - positions[i]) * 0.05;
                        positions[i + 1] += (iy - positions[i + 1]) * 0.05;
                    }
                }
                particlesRef.current.geometry.attributes.position.needsUpdate = true;
            }

            renderer.render(scene, camera);
        };
        animate();

        // 4. Handle Resize
        const handleResize = () => {
            if (!containerRef.current || !camera) return;
            const w = containerRef.current.clientWidth;
            const h = containerRef.current.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', handleResize);

        // 5. Handle Mouse
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            mouseRef.current.set(x, y);
        };

        const handleMouseLeave = () => {
            mouseRef.current.set(-9999, -9999);
        }

        // Attach to window or container? Container is safer for this scoped effect
        containerRef.current.addEventListener('mousemove', handleMouseMove);
        containerRef.current.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cancelAnimationFrame(rafRef.current!);
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) {
                containerRef.current.removeChild(renderer.domElement);
                // Clean up listeners
                containerRef.current.removeEventListener('mousemove', handleMouseMove);
                containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
            }
            if (particlesRef.current) {
                particlesRef.current.geometry.dispose();
                (particlesRef.current.material as THREE.Material).dispose();
            }
            renderer.dispose();
        };
    }, [src, scale, threshold, particleSize, hoverRadius, hoverStrength]);

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                // cursor: 'crosshair', // Removed per user request
                overflow: 'hidden'
            }}
        />
    );
}
