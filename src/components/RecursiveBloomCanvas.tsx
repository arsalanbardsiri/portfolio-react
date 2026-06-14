import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// ------------------------------------------------------------------
// Sanity Check Physics: AntiGravitySimulation
// ------------------------------------------------------------------
class AntiGravitySimulation {
    particles: Array<{
        mesh: THREE.Mesh;
        initialPos: THREE.Vector3;
        velocity: THREE.Vector3;
        floatSpeed: number;
        floatAmp: number;
        phase: number;
        avoidRadius: number;
        baseRot: THREE.Vector3;
    }> = [];

    addParticle(mesh: THREE.Mesh, avoidRadius = 20) {
        this.particles.push({
            mesh,
            initialPos: mesh.position.clone(),
            velocity: new THREE.Vector3(0, 0, 0),
            floatSpeed: 0.5 + Math.random() * 0.8,
            floatAmp: 1.0 + Math.random() * 1.5,
            phase: Math.random() * Math.PI * 2,
            avoidRadius,
            baseRot: new THREE.Vector3(
                (Math.random() - 0.5) * 0.015,
                (Math.random() - 0.5) * 0.015,
                (Math.random() - 0.5) * 0.008
            )
        });
    }

    update(cameraPos: THREE.Vector3, time: number) {
        this.particles.forEach(p => {
            const pos = p.mesh.position;
            const start = p.initialPos;

            // Slow buoyant drift
            const driftY = Math.sin(time * p.floatSpeed + p.phase) * p.floatAmp * 0.012;
            const driftX = Math.cos(time * p.floatSpeed * 0.6 + p.phase) * p.floatAmp * 0.010;

            // Push particles away from camera flight line
            const toCam = new THREE.Vector3().copy(pos).sub(cameraPos);
            const dist = toCam.length();
            const push = new THREE.Vector3();

            if (dist < p.avoidRadius && dist > 0.1) {
                const strength = (p.avoidRadius - dist) / p.avoidRadius;
                push.copy(toCam).normalize().multiplyScalar(strength * 1.6);
            }

            // Spring restoring force back to coordinate base
            const toStart = new THREE.Vector3().copy(start).sub(pos);
            const spring = toStart.multiplyScalar(0.018);

            p.velocity.add(spring);
            p.velocity.add(push);
            p.velocity.multiplyScalar(0.9); // Damping drag
            pos.add(p.velocity);

            pos.y += driftY;
            pos.x += driftX;

            p.mesh.rotation.x += p.baseRot.x;
            p.mesh.rotation.y += p.baseRot.y;
            p.mesh.rotation.z += p.baseRot.z;
        });
    }
}

// Custom Rock Procedural Generator (Phase 1 Rocks)
function createOrganicRockGeometry(radius: number, detail: number): THREE.BufferGeometry {
    const geom = new THREE.DodecahedronGeometry(radius, detail);
    const posAttr = geom.attributes.position;
    const v = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
        v.fromBufferAttribute(posAttr, i);
        const noise = Math.sin(v.x * 2.5) * Math.cos(v.y * 2.5) * 0.16;
        v.x += noise;
        v.y += noise;
        v.z += noise;

        // Melted downward stalactite formation (bottom perturbation)
        if (v.y < 0) {
            v.y *= 1.4 + Math.abs(Math.sin(v.x * 3.5)) * 0.3;
            const taper = 1.0 - Math.abs(v.y) * 0.07;
            v.x *= Math.max(0.2, taper);
            v.z *= Math.max(0.2, taper);
        }
        posAttr.setXYZ(i, v.x, v.y, v.z);
    }
    geom.computeVertexNormals();
    return geom;
}

// Flat Panel shape geometry with an elegant Archway cutout in the center (Steppenwolf style)
function createArchCutoutGeometry(width: number, height: number, archRadius: number): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    // Outer border rectangular box
    const outerW = width * 1.6;
    const outerH = height * 1.6;
    shape.moveTo(-outerW / 2, -outerH / 2);
    shape.lineTo(outerW / 2, -outerH / 2);
    shape.lineTo(outerW / 2, outerH / 2);
    shape.lineTo(-outerW / 2, outerH / 2);
    shape.closePath();

    // Inner arch cutout hole
    const hole = new THREE.Path();
    const startX = -archRadius;
    const endX = archRadius;
    const bottomY = -height / 2;
    const topY = height / 2 - archRadius;

    hole.moveTo(startX, bottomY);
    hole.lineTo(startX, topY);
    // Draw semi-circle arch cap at the top
    hole.absarc(0, topY, archRadius, Math.PI, 0, true);
    hole.lineTo(endX, bottomY);
    hole.closePath();

    shape.holes.push(hole);
    return new THREE.ShapeGeometry(shape);
}

// Custom Shader Material for melting wax arches on scroll
function createMeltingMaterial(color: THREE.Color): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: color },
            uCameraZ: { value: 100.0 },
            uTime: { value: 0 },
            uArchZ: { value: 0 }
        },
        vertexShader: `
            uniform float uCameraZ;
            uniform float uArchZ;
            uniform float uTime;
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // Calculate distance to camera Z coordinate
                float dist = abs(uCameraZ - uArchZ);
                
                // As the camera gets closer than 45 units, the arch starts to melt down like wax
                if (dist < 45.0) {
                    float meltFactor = smoothstep(45.0, 10.0, dist);
                    
                    // Create organic drip waves using sin/cos noise
                    float drip = sin(pos.x * 0.4 + uTime * 1.5) * cos(pos.x * 0.15) * 0.8;
                    // Drip downward (negative Y displacement)
                    pos.y -= meltFactor * (5.5 + drip * 2.0);
                    
                    // Taper the columns slightly as they stretch
                    if (pos.y < 0.0) {
                        pos.x *= 1.0 - (meltFactor * 0.16);
                    }
                }

                vPosition = pos;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                vec3 col = uColor;
                // Subtle shadow gradient on the Y position to add organic depth
                col *= 0.82 + 0.18 * sin(vPosition.y * 0.15);
                gl_FragColor = vec4(col, 1.0);
            }
        `,
        side: THREE.DoubleSide
    });
}

// Custom Shader Material for melting outlines (Uses exact same vertex offset logic to avoid desync)
function createMeltingOutlineMaterial(color: THREE.Color): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: color },
            uCameraZ: { value: 100.0 },
            uTime: { value: 0 },
            uArchZ: { value: 0 }
        },
        vertexShader: `
            uniform float uCameraZ;
            uniform float uArchZ;
            uniform float uTime;
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                vUv = uv;
                // Scale outline coordinates slightly outward in vertex shader
                vec3 pos = position;
                pos.x *= 1.025;
                pos.y *= 1.025;
                
                float dist = abs(uCameraZ - uArchZ);
                if (dist < 45.0) {
                    float meltFactor = smoothstep(45.0, 10.0, dist);
                    float drip = sin(pos.x * 0.4 + uTime * 1.5) * cos(pos.x * 0.15) * 0.8;
                    pos.y -= meltFactor * (5.5 + drip * 2.0);
                    if (pos.y < 0.0) {
                        pos.x *= 1.0 - (meltFactor * 0.16);
                    }
                }

                vPosition = pos;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            void main() {
                gl_FragColor = vec4(uColor, 1.0);
            }
        `,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1.1,
        polygonOffsetUnits: 4.0
    });
}

interface RecursiveBloomCanvasProps {
    scrollPercent: number; // Values 0 to 1
    theme: 'light' | 'dark';
}

export const RecursiveBloomCanvas: React.FC<RecursiveBloomCanvasProps> = ({ scrollPercent, theme }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const frameRef = useRef<number | null>(null);
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

    // Swap targets for feedback portal
    const fboARef = useRef<THREE.WebGLRenderTarget | null>(null);
    const fboBRef = useRef<THREE.WebGLRenderTarget | null>(null);
    const feedbackMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

    const simulationRef = useRef<AntiGravitySimulation>(new AntiGravitySimulation());

    // Hold refs to materials to swap colors dynamically without tearing down scene
    const materialsRef = useRef<{
        terracotta: THREE.ShaderMaterial;
        navy: THREE.ShaderMaterial;
        sage: THREE.ShaderMaterial;
        mustard: THREE.ShaderMaterial;
        rose: THREE.ShaderMaterial;
    } | null>(null);

    const rockMaterialsRef = useRef<{
        terracotta: THREE.MeshPhongMaterial;
        navy: THREE.MeshPhongMaterial;
        sage: THREE.MeshPhongMaterial;
        mustard: THREE.MeshPhongMaterial;
        rose: THREE.MeshPhongMaterial;
    } | null>(null);

    const scrollPercentRef = useRef(scrollPercent);
    useEffect(() => {
        scrollPercentRef.current = scrollPercent;
    }, [scrollPercent]);

    useEffect(() => {
        if (!mountRef.current) return;

        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;

        // Disposal trackers
        const geometriesToDispose: THREE.BufferGeometry[] = [];
        const materialsToDispose: THREE.Material[] = [];

        // 1. Scene & Camera Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(theme === 'dark' ? 0x0b0a14 : 0x121124); // Midnight backdrop
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 1000);
        camera.position.set(0, 0, 100);
        cameraRef.current = camera;

        // 2. WebGL Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 3. FBO feedback buffer targets
        const rtOptions = {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
            type: THREE.UnsignedByteType
        };
        const fboA = new THREE.WebGLRenderTarget(512, 512, rtOptions);
        const fboB = new THREE.WebGLRenderTarget(512, 512, rtOptions);
        fboARef.current = fboA;
        fboBRef.current = fboB;

        // 4. Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambient);

        const light = new THREE.DirectionalLight(0xfff5e6, 0.85);
        light.position.set(20, 30, 35);
        scene.add(light);

        // 5. Materials (Midnight foliage & neon colors)
        const isDark = theme === 'dark';
        const outlineColor = new THREE.Color(isDark ? 0x0b0a14 : 0x121124);
        
        // Define color hex objects
        const terracottaColor = new THREE.Color(isDark ? 0xf82a72 : 0xd63c76);
        const navyColor = new THREE.Color(isDark ? 0xa482ff : 0x8c6ec9);
        const sageColor = new THREE.Color(isDark ? 0x1ee3bd : 0x207a6e);
        const mustardColor = new THREE.Color(isDark ? 0xffc844 : 0xe3ac34);
        const roseColor = new THREE.Color(isDark ? 0xffafc0 : 0xf89fb3);
        
        // Melting materials for the arches
        const terracottaMat = createMeltingMaterial(terracottaColor);
        const navyMat = createMeltingMaterial(navyColor);
        const sageMat = createMeltingMaterial(sageColor);
        const mustardMat = createMeltingMaterial(mustardColor);
        const roseMat = createMeltingMaterial(roseColor);
        
        materialsRef.current = {
            terracotta: terracottaMat,
            navy: navyMat,
            sage: sageMat,
            mustard: mustardMat,
            rose: roseMat
        };
        materialsToDispose.push(terracottaMat, navyMat, sageMat, mustardMat, roseMat);

        // Solid Phong materials for the floating rocks
        const terracottaRockMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xf82a72 : 0xd63c76, flatShading: true, side: THREE.DoubleSide });
        const navyRockMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xa482ff : 0x8c6ec9, flatShading: true, side: THREE.DoubleSide });
        const sageRockMat = new THREE.MeshPhongMaterial({ color: isDark ? 0x1ee3bd : 0x207a6e, flatShading: true, side: THREE.DoubleSide });
        const mustardRockMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xffc844 : 0xe3ac34, flatShading: true, side: THREE.DoubleSide });
        const roseRockMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xffafc0 : 0xf89fb3, flatShading: true, side: THREE.DoubleSide });

        rockMaterialsRef.current = {
            terracotta: terracottaRockMat,
            navy: navyRockMat,
            sage: sageRockMat,
            mustard: mustardRockMat,
            rose: roseRockMat
        };
        materialsToDispose.push(terracottaRockMat, navyRockMat, sageRockMat, mustardRockMat, roseRockMat);

        // 6. BUILD NESTED ARCHWAY TUNNEL (Droste archways receding along Z)
        const archZCoords = [70, 30, -10, -50, -90];
        const archColors = [navyMat, terracottaMat, sageMat, mustardMat, roseMat];

        const archesGroup = new THREE.Group();
        archesGroup.name = 'archesGroup'; // Named so we can query it easily
        scene.add(archesGroup);

        archZCoords.forEach((zPos, index) => {
            const width = 36;
            const height = 26;
            const archRadius = 8.5; // inner cutout radius

            const archGeom = createArchCutoutGeometry(width, height, archRadius);
            geometriesToDispose.push(archGeom);

            const mesh = new THREE.Mesh(archGeom, archColors[index]);
            mesh.position.set(0, 0, zPos);
            
            // Pass the uArchZ uniform to track current arch depth coordinate
            mesh.material.uniforms.uArchZ.value = zPos;
            
            archesGroup.add(mesh);

            // Outlines (Melting and offset to prevent Z-fighting at deep distances)
            const outlineMat = createMeltingOutlineMaterial(outlineColor);
            outlineMat.uniforms.uArchZ.value = zPos;
            materialsToDispose.push(outlineMat);

            const outline = new THREE.Mesh(archGeom, outlineMat);
            outline.position.set(0, 0, -0.2); // Slipped slightly behind the arch plane
            mesh.add(outline);
        });

        // 7. FLOATING SURREAL ROCK PLATFORMS (Phong solid materials)
        const rockGroup = new THREE.Group();
        scene.add(rockGroup);

        const rockPositions = [
            { x: -18, y: 12, z: 80, r: 4.5, mat: sageRockMat },
            { x: 19, y: -10, z: 50, r: 5.0, mat: terracottaRockMat },
            { x: -22, y: -14, z: 20, r: 6.0, mat: mustardRockMat },
            { x: 20, y: 14, z: -20, r: 5.5, mat: roseRockMat },
            { x: -20, y: 10, z: -60, r: 5.0, mat: navyRockMat }
        ];

        rockPositions.forEach(pos => {
            const geom = createOrganicRockGeometry(pos.r, 1);
            geometriesToDispose.push(geom);

            const rock = new THREE.Mesh(geom, pos.mat);
            rock.position.set(pos.x, pos.y, pos.z);
            rockGroup.add(rock);

            // Outline Mesh
            const outlineMat = new THREE.MeshBasicMaterial({ 
                color: isDark ? 0x0b0a14 : 0x121124, 
                side: THREE.BackSide,
                polygonOffset: true,
                polygonOffsetFactor: 1.1,
                polygonOffsetUnits: 4.0
            });
            materialsToDispose.push(outlineMat);

            const outline = new THREE.Mesh(geom, outlineMat);
            outline.scale.setScalar(1.08);
            rock.add(outline);
        });

        // 8. IRIDESCENT SPLINE TENDRIL (Winding spline vein down center void)
        const splinePoints = [
            new THREE.Vector3(-12, 12, 85),
            new THREE.Vector3(-8, -12, 45),
            new THREE.Vector3(10, 10, 5),
            new THREE.Vector3(-5, -10, -35),
            new THREE.Vector3(8, 12, -75),
            new THREE.Vector3(0, 0, -105)
        ];

        const curve = new THREE.CatmullRomCurve3(splinePoints);
        const tubeGeom = new THREE.TubeGeometry(curve, 64, 0.4, 8, false);
        geometriesToDispose.push(tubeGeom);

        // Custom GLSL shader for iridescent flow
        const iridescentShader = {
            uniforms: {
                uTime: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                varying vec2 vUv;

                void main() {
                    // Slow, smooth moving gradient shift
                    float grad = vUv.x * 2.0 - (uTime * 0.8);
                    vec3 col = 0.5 + 0.5 * cos(grad + vec3(0.0, 2.09, 4.18));
                    
                    // Mix with retro terracotta and navy
                    vec3 brandT = vec3(0.84, 0.24, 0.46);
                    vec3 brandN = vec3(0.55, 0.43, 0.79);
                    vec3 finalCol = mix(col, mix(brandT, brandN, sin(grad)*0.5 + 0.5), 0.3);

                    // Add dark ridges
                    float ridges = step(0.9, sin(vUv.y * 24.0));
                    finalCol = mix(finalCol, vec3(0.07, 0.06, 0.14), ridges * 0.2);

                    gl_FragColor = vec4(finalCol, 1.0);
                }
            `
        };

        const iridescentMat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(iridescentShader.uniforms),
            vertexShader: iridescentShader.vertexShader,
            fragmentShader: iridescentShader.fragmentShader
        });
        materialsToDispose.push(iridescentMat);

        const tubeMesh = new THREE.Mesh(tubeGeom, iridescentMat);
        scene.add(tubeMesh);

        // Spline outline stroke
        const tubeOutlineGeom = new THREE.TubeGeometry(curve, 64, 0.48, 8, false);
        geometriesToDispose.push(tubeOutlineGeom);

        const blackOutlineSideMat = new THREE.MeshBasicMaterial({ 
            color: isDark ? 0x0b0a14 : 0x121124, 
            side: THREE.BackSide,
            polygonOffset: true,
            polygonOffsetFactor: 1.1,
            polygonOffsetUnits: 4.0
        });
        materialsToDispose.push(blackOutlineSideMat);

        const tubeOutline = new THREE.Mesh(tubeOutlineGeom, blackOutlineSideMat);
        scene.add(tubeOutline);

        // 9. DRIFTING PHYSICS PARTICLES (Anti-gravity solids)
        const simulation = simulationRef.current;
        for (let i = 0; i < 35; i++) {
            const pGeom = new THREE.OctahedronGeometry(0.3 + Math.random() * 0.4);
            geometriesToDispose.push(pGeom);

            const pMat = (index: number) => index % 2 === 0 ? terracottaRockMat : mustardRockMat;
            const pMesh = new THREE.Mesh(pGeom, pMat(i));
            
            pMesh.position.set(
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 160 + 20
            );

            // Outline
            const pOutline = new THREE.Mesh(pGeom, blackOutlineSideMat);
            pOutline.scale.setScalar(1.25);
            pMesh.add(pOutline);

            scene.add(pMesh);
            simulation.addParticle(pMesh);
        }

        // 10. RECURSIVE FEEDBACK PLANE (Droste anchor at Z depth)
        const targetZPos = -105;
        const screenGeom = new THREE.PlaneGeometry(16, 11);
        geometriesToDispose.push(screenGeom);
        
        const feedbackShader = {
            uniforms: {
                uTexture: { value: null as THREE.Texture | null },
                uTime: { value: 0 },
                uScroll: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uTexture;
                uniform float uTime;
                uniform float uScroll;
                varying vec2 vUv;

                void main() {
                    vec2 uv = vUv;
                    vec2 center = vec2(0.5, 0.5);
                    vec2 toCenter = uv - center;
                    float dist = length(toCenter);

                    // Evolving fractal Zoom / spiral warp Droste effect
                    float angle = atan(toCenter.y, toCenter.x);
                    float spiral = angle + dist * 9.0 - (uTime * 0.55) - (uScroll * 3.0);
                    vec2 spiralUv = center + vec2(cos(spiral), sin(spiral)) * dist * 0.94;

                    // Psychedelic chromatic aberration shifts
                    float shift = 0.004 * sin(uTime * 2.2 + uScroll * 12.0);
                    float r = texture2D(uTexture, spiralUv + vec2(shift, 0.0)).r;
                    float g = texture2D(uTexture, spiralUv).g;
                    float b = texture2D(uTexture, spiralUv - vec2(shift, 0.0)).b;
                    vec3 feedback = vec3(r, g, b);
                    
                    // Dark center core representing infinite depth void
                    vec3 finalRgb = mix(vec3(0.07, 0.06, 0.14), feedback, smoothstep(0.05, 0.35, dist));

                    gl_FragColor = vec4(finalRgb, 1.0);
                }
            `
        };

        const feedbackMat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(feedbackShader.uniforms),
            vertexShader: feedbackShader.vertexShader,
            fragmentShader: feedbackShader.fragmentShader
        });
        materialsToDispose.push(feedbackMat);
        feedbackMaterialRef.current = feedbackMat;

        const feedbackMesh = new THREE.Mesh(screenGeom, feedbackMat);
        feedbackMesh.position.set(0, 0, targetZPos);
        scene.add(feedbackMesh);

        // Detailed border outline for the deepest window
        const feedbackOutlineMat = new THREE.MeshBasicMaterial({ 
            color: isDark ? 0x0b0a14 : 0x121124, 
            side: THREE.DoubleSide,
            polygonOffset: true,
            polygonOffsetFactor: 1.1,
            polygonOffsetUnits: 4.0
        });
        materialsToDispose.push(feedbackOutlineMat);

        const feedbackOutline = new THREE.Mesh(screenGeom, feedbackOutlineMat);
        feedbackOutline.position.set(0, 0, -0.05);
        feedbackMesh.add(feedbackOutline); // Add outline as child of feedbackMesh

        // 11. Mouse move tracker for parallax pan
        const handleMouseMove = (event: MouseEvent) => {
            const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
            const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;
            mouseRef.current.set(ndcX, ndcY);
        };
        window.addEventListener('mousemove', handleMouseMove);

        // 12. Frame render loop
        const clock = new THREE.Clock();

        const tick = () => {
            const time = clock.getElapsedTime();
            const currentScroll = scrollPercentRef.current;
            const cameraZ = cameraRef.current ? cameraRef.current.position.z : 100.0;

            // Update melting wax shader uniforms for each arch and its outline
            archesGroup.children.forEach((mesh) => {
                if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.ShaderMaterial) {
                    mesh.material.uniforms.uCameraZ.value = cameraZ;
                    mesh.material.uniforms.uTime.value = time;
                }
                mesh.children.forEach((child) => {
                    if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                        child.material.uniforms.uCameraZ.value = cameraZ;
                        child.material.uniforms.uTime.value = time;
                    }
                });
            });

            // Rotate floating rock islands
            rockGroup.children.forEach((rock, idx) => {
                rock.rotation.y += 0.003 * (idx % 2 === 0 ? 1 : -1);
                rock.position.y += Math.sin(time * 0.5 + idx) * 0.003;
                const scaleSwell = 1.0 + Math.sin(time * 0.8 + idx) * 0.05;
                rock.scale.setScalar(scaleSwell);
            });

            // Alternating slow rotation over scroll & time for dynamic spiral tunnel
            archesGroup.children.forEach((mesh, index) => {
                const rotDir = index % 2 === 0 ? 1 : -1;
                mesh.rotation.z = rotDir * (Math.sin(time * 0.35 + index) * 0.08 + currentScroll * 0.65);
            });

            // Smooth Z flight scroll interpolation
            if (cameraRef.current) {
                // Map scroll percent to Z depth path (from Z = 95 down to Z = -95)
                const startZ = 95;
                const endZ = -95;
                const targetZ = startZ + currentScroll * (endZ - startZ);

                // ULTRA-SMOOTH LAG LERP (Lerp coeff 0.025 to ensure no stutters)
                cameraRef.current.position.z += (targetZ - cameraRef.current.position.z) * 0.025;

                // Mouse drift parallax pan
                const targetX = mouseRef.current.x * 2.5;
                const targetY = mouseRef.current.y * 1.8;
                cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.04;
                cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.04;

                // Add dreamy camera roll rotation along Z-axis
                cameraRef.current.rotation.z = Math.sin(time * 0.4) * 0.04 + currentScroll * 0.15;

                // Look slightly ahead of camera
                cameraRef.current.lookAt(new THREE.Vector3(0, 0, cameraRef.current.position.z - 45));

                // Feed physics particle updates
                simulation.update(cameraRef.current.position, time);
            }

            // Update shader uniforms
            if (iridescentMat) iridescentMat.uniforms.uTime.value = time;
            if (feedbackMaterialRef.current) {
                feedbackMaterialRef.current.uniforms.uTime.value = time;
                feedbackMaterialRef.current.uniforms.uScroll.value = currentScroll;
            }

            // Double Render feedback loop (Mise en abyme)
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
                if (feedbackMaterialRef.current) {
                    feedbackMaterialRef.current.uniforms.uTexture.value = fboA.texture;
                }

                rendererRef.current.setRenderTarget(fboB);
                rendererRef.current.render(sceneRef.current, cameraRef.current);

                const temp = fboA;
                fboARef.current = fboB;
                fboBRef.current = temp;

                if (feedbackMaterialRef.current) {
                    feedbackMaterialRef.current.uniforms.uTexture.value = fboARef.current.texture;
                }

                rendererRef.current.setRenderTarget(null);
                rendererRef.current.render(sceneRef.current, cameraRef.current);
            }

            frameRef.current = requestAnimationFrame(tick);
        };
        tick();

        // Handle Resizes
        const handleResize = () => {
            if (!mountRef.current || !renderer || !camera) return;
            const wWidth = mountRef.current.clientWidth;
            const wHeight = mountRef.current.clientHeight;

            camera.aspect = wWidth / wHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(wWidth, wHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanups
        return () => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                try {
                    mountRef.current.removeChild(renderer.domElement);
                } catch (e) {
                    // console.error(e);
                }
            }

            // Dispose Geometries and Materials gathered in lists
            geometriesToDispose.forEach(g => g.dispose());
            materialsToDispose.forEach(m => m.dispose());
            materialsRef.current = null;
            rockMaterialsRef.current = null;

            fboA.dispose();
            fboB.dispose();
            renderer.dispose();
        };
    }, []);

    // 13. Dynamic Theme updates without scene reconstruction
    useEffect(() => {
        if (!sceneRef.current) return;
        const isDark = theme === 'dark';
        sceneRef.current.background = new THREE.Color(isDark ? 0x0b0a14 : 0x121124);
        
        const outlineHex = isDark ? 0x0b0a14 : 0x121124;
        
        if (materialsRef.current) {
            materialsRef.current.terracotta.uniforms.uColor.value.setHex(isDark ? 0xf82a72 : 0xd63c76);
            materialsRef.current.navy.uniforms.uColor.value.setHex(isDark ? 0xa482ff : 0x8c6ec9);
            materialsRef.current.sage.uniforms.uColor.value.setHex(isDark ? 0x1ee3bd : 0x207a6e);
            materialsRef.current.mustard.uniforms.uColor.value.setHex(isDark ? 0xffc844 : 0xe3ac34);
            materialsRef.current.rose.uniforms.uColor.value.setHex(isDark ? 0xffafc0 : 0xf89fb3);
        }

        if (rockMaterialsRef.current) {
            rockMaterialsRef.current.terracotta.color.setHex(isDark ? 0xf82a72 : 0xd63c76);
            rockMaterialsRef.current.navy.color.setHex(isDark ? 0xa482ff : 0x8c6ec9);
            rockMaterialsRef.current.sage.color.setHex(isDark ? 0x1ee3bd : 0x207a6e);
            rockMaterialsRef.current.mustard.color.setHex(isDark ? 0xffc844 : 0xe3ac34);
            rockMaterialsRef.current.rose.color.setHex(isDark ? 0xffafc0 : 0xf89fb3);
        }

        // Update arches outlines color dynamically
        const arches = sceneRef.current.getObjectByName('archesGroup');
        if (arches) {
            arches.children.forEach((mesh) => {
                mesh.children.forEach((child) => {
                    if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                        child.material.uniforms.uColor.value.setHex(outlineHex);
                    }
                });
            });
        }
    }, [theme]);

    return (
        <div 
            ref={mountRef} 
            className="webgl-canvas-container"
        />
    );
};
