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

    // Pre-allocated scratch vectors to avoid GC allocation in tick loop
    private toCam = new THREE.Vector3();
    private push = new THREE.Vector3();
    private toStart = new THREE.Vector3();
    private spring = new THREE.Vector3();

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
            this.toCam.copy(pos).sub(cameraPos);
            const dist = this.toCam.length();
            this.push.set(0, 0, 0);

            if (dist < p.avoidRadius && dist > 0.1) {
                const strength = (p.avoidRadius - dist) / p.avoidRadius;
                this.push.copy(this.toCam).normalize().multiplyScalar(strength * 1.6);
            }

            // Spring restoring force back to coordinate base
            this.toStart.copy(start).sub(pos);
            this.spring.copy(this.toStart).multiplyScalar(0.018);

            p.velocity.add(this.spring);
            p.velocity.add(this.push);
            p.velocity.multiplyScalar(0.9); // Damping drag
            pos.add(p.velocity);

            pos.y += driftY;
            pos.x += driftX;
            
            // Constrain particles to remain inside the central corridor (prevent clipping through frames/walls)
            pos.x = Math.max(-9.0, Math.min(9.0, pos.x));

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

// Procedural 3D Cog Generator with teeth and center hole cutout
function createCogGeometry(innerRadius: number, outerRadius: number, teeth: number, depth: number): THREE.BufferGeometry {
    const shape = new THREE.Shape();
    const toothAngle = (Math.PI * 2) / teeth;
    for (let i = 0; i < teeth; i++) {
        const angle = i * toothAngle;
        
        let r = innerRadius;
        let x = Math.cos(angle - toothAngle * 0.25) * r;
        let y = Math.sin(angle - toothAngle * 0.25) * r;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);

        r = outerRadius;
        x = Math.cos(angle - toothAngle * 0.12) * r;
        y = Math.sin(angle - toothAngle * 0.12) * r;
        shape.lineTo(x, y);

        x = Math.cos(angle + toothAngle * 0.12) * r;
        y = Math.sin(angle + toothAngle * 0.12) * r;
        shape.lineTo(x, y);

        r = innerRadius;
        x = Math.cos(angle + toothAngle * 0.25) * r;
        y = Math.sin(angle + toothAngle * 0.25) * r;
        shape.lineTo(x, y);
    }
    shape.closePath();

    // Central circular hollow shaft cutout
    const hole = new THREE.Path();
    hole.absarc(0, 0, innerRadius * 0.35, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const geom = new THREE.ExtrudeGeometry(shape, {
        depth: depth,
        bevelEnabled: true,
        bevelThickness: 0.15,
        bevelSize: 0.08,
        bevelSegments: 2
    });
    geom.center();
    return geom;
}

// Custom Lorenz Attractor geometry generator (procedural Butterfly Effect)
function createLorenzAttractorGeometry(): THREE.BufferGeometry {
    const points: THREE.Vector3[] = [];
    let x = 0.1;
    let y = 0.0;
    let z = 0.0;
    const sigma = 10.0;
    const rho = 28.0;
    const beta = 8.0 / 3.0;
    const dt = 0.015;

    for (let i = 0; i < 350; i++) {
        const dx = sigma * (y - x) * dt;
        const dy = (x * (rho - z) - y) * dt;
        const dz = (x * y - beta * z) * dt;
        x += dx;
        y += dy;
        z += dz;
        // Scale and center the attractor points
        points.push(new THREE.Vector3(x * 0.12, y * 0.12, (z - 25.0) * 0.12));
    }

    const curve = new THREE.CatmullRomCurve3(points);
    return new THREE.TubeGeometry(curve, 100, 0.12, 6, false);
}



// Procedural 3D Antler Branch Generator
function createAntlerBranch(length: number, scaleFactor: number, geometriesToDispose: THREE.BufferGeometry[]): THREE.Group {
    const group = new THREE.Group();
    
    // Base trunk
    const trunkGeom = new THREE.CylinderGeometry(0.10 * scaleFactor, 0.16 * scaleFactor, length, 5);
    trunkGeom.translate(0, length / 2, 0);
    geometriesToDispose.push(trunkGeom);
    const trunk = new THREE.Mesh(trunkGeom);
    group.add(trunk);
    
    // Branch 1
    const b1 = new THREE.Group();
    b1.position.set(0, length * 0.6, 0);
    b1.rotation.z = 0.5;
    const b1Geom = new THREE.CylinderGeometry(0.06 * scaleFactor, 0.10 * scaleFactor, length * 0.6, 5);
    b1Geom.translate(0, length * 0.3, 0);
    geometriesToDispose.push(b1Geom);
    const b1Mesh = new THREE.Mesh(b1Geom);
    b1.add(b1Mesh);
    group.add(b1);
    
    // Branch 2
    const b2 = new THREE.Group();
    b2.position.set(0, length * 0.8, 0);
    b2.rotation.z = -0.4;
    const b2Geom = new THREE.CylinderGeometry(0.04 * scaleFactor, 0.07 * scaleFactor, length * 0.5, 5);
    b2Geom.translate(0, length * 0.25, 0);
    geometriesToDispose.push(b2Geom);
    const b2Mesh = new THREE.Mesh(b2Geom);
    b2.add(b2Mesh);
    group.add(b2);
    
    // Little twigs / cherry blossom points
    const tipGeom = new THREE.SphereGeometry(0.20 * scaleFactor, 4, 4);
    geometriesToDispose.push(tipGeom);
    
    const tip1 = new THREE.Mesh(tipGeom);
    tip1.position.set(0, length * 0.6, 0);
    b1.add(tip1);
    
    const tip2 = new THREE.Mesh(tipGeom);
    tip2.position.set(0, length * 0.5, 0);
    b2.add(tip2);

    const tipBase = new THREE.Mesh(tipGeom);
    tipBase.position.set(0, length, 0);
    group.add(tipBase);
    
    return group;
}

// Draw playing card textures dynamically
function createPlayingCardTexture(suit: 'heart' | 'spade' | 'diamond' | 'club', value: string, isDark: boolean): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 192;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        // Card Background: White/Cream
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 128, 192);
        
        // Card Border: Thin dark line
        ctx.strokeStyle = '#0b0a14';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 124, 188);
        
        // Suit Color
        const color = (suit === 'heart' || suit === 'diamond') ? '#d63c76' : '#207a6e';
        ctx.fillStyle = color;
        
        // Draw Value text in top-left and bottom-right
        ctx.font = 'bold 24px "Space Grotesk"';
        ctx.fillText(value, 10, 30);
        
        ctx.save();
        ctx.translate(128, 192);
        ctx.rotate(Math.PI);
        ctx.fillText(value, 10, 30);
        ctx.restore();
        
        // Draw center suit symbol
        ctx.translate(64, 96);
        ctx.fillStyle = color;
        if (suit === 'heart') {
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.bezierCurveTo(-15, -25, -25, 0, 0, 20);
            ctx.bezierCurveTo(25, 0, 15, -25, 0, -10);
            ctx.fill();
        } else if (suit === 'spade') {
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.bezierCurveTo(-15, 0, -20, 10, 0, 15);
            ctx.bezierCurveTo(20, 10, 15, 0, 0, -20);
            ctx.fill();
            // stem
            ctx.beginPath();
            ctx.moveTo(-4, 10);
            ctx.lineTo(4, 10);
            ctx.lineTo(8, 22);
            ctx.lineTo(-8, 22);
            ctx.closePath();
            ctx.fill();
        } else if (suit === 'diamond') {
            ctx.beginPath();
            ctx.moveTo(0, -20);
            ctx.lineTo(-15, 0);
            ctx.lineTo(0, 20);
            ctx.lineTo(15, 0);
            ctx.closePath();
            ctx.fill();
        } else { // club
            ctx.beginPath();
            ctx.arc(-8, -2, 9, 0, Math.PI * 2);
            ctx.arc(8, -2, 9, 0, Math.PI * 2);
            ctx.arc(0, -12, 9, 0, Math.PI * 2);
            ctx.fill();
            // stem
            ctx.beginPath();
            ctx.moveTo(-3, 2);
            ctx.lineTo(3, 2);
            ctx.lineTo(6, 16);
            ctx.lineTo(-6, 16);
            ctx.closePath();
            ctx.fill();
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
}

// Procedural 3D Pocket Watch Mesh
function createPocketWatchMesh(isDark: boolean, geometriesToDispose: THREE.BufferGeometry[], materialsToDispose: THREE.Material[]): THREE.Group {
    const watchGroup = new THREE.Group();
    
    // Gold/Brass Rim material
    const brassMat = new THREE.MeshPhongMaterial({
        color: isDark ? 0xffc844 : 0xe3ac34,
        shininess: 90,
        specular: 0xffffff
    });
    
    const rimGeom = new THREE.TorusGeometry(0.7, 0.09, 8, 24);
    geometriesToDispose.push(rimGeom);
    const rim = new THREE.Mesh(rimGeom, brassMat);
    watchGroup.add(rim);
    
    const loopGeom = new THREE.TorusGeometry(0.18, 0.04, 6, 12);
    geometriesToDispose.push(loopGeom);
    const loop = new THREE.Mesh(loopGeom, brassMat);
    loop.position.y = 0.76;
    watchGroup.add(loop);
    
    // Face
    const faceGeom = new THREE.CylinderGeometry(0.64, 0.64, 0.06, 24);
    faceGeom.rotateX(Math.PI / 2);
    geometriesToDispose.push(faceGeom);
    
    // Watch Face Texture
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#fefdf9';
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#0b0a14';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(64, 64, 60, 0, Math.PI * 2);
        ctx.stroke();
        
        // Hour ticks
        ctx.translate(64, 64);
        ctx.fillStyle = '#0b0a14';
        for (let i = 0; i < 12; i++) {
            ctx.rotate(Math.PI / 6);
            ctx.fillRect(-1.5, -56, 3, 10);
        }
        // Hands
        ctx.fillStyle = '#0b0a14';
        ctx.fillRect(-2, -35, 4, 35); // Hour hand
        ctx.rotate(1.2);
        ctx.fillRect(-1, -48, 2, 48); // Minute hand
    }
    const faceTex = new THREE.CanvasTexture(canvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;
    const faceMat = new THREE.MeshBasicMaterial({ map: faceTex });
    materialsToDispose.push(faceMat);
    
    const face = new THREE.Mesh(faceGeom, faceMat);
    face.position.z = 0.03;
    watchGroup.add(face);
    
    // Backing outline
    const outlineMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x0b0a14 : 0x121124, side: THREE.BackSide });
    materialsToDispose.push(outlineMat);
    const outline = new THREE.Mesh(rimGeom, outlineMat);
    outline.scale.setScalar(1.12);
    outline.position.z = -0.02;
    rim.add(outline);
    
    return watchGroup;
}

// Procedural 3D Melting Clock Mesh (Dalí style)
function createMeltingClockMesh(isDark: boolean, geometriesToDispose: THREE.BufferGeometry[], materialsToDispose: THREE.Material[]): THREE.Group {
    const clockGroup = new THREE.Group();
    
    // Distorted torus rim
    const torusGeom = new THREE.TorusGeometry(0.8, 0.10, 8, 32);
    const pos = torusGeom.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        // Distort vertices downward and stretch them along Y
        if (v.y < 0) {
            v.y *= 1.8;
            v.x *= 0.75;
        } else {
            v.y *= 1.1;
        }
        // Add a melting curve
        v.z += Math.sin(v.y * 2.0) * 0.15;
        pos.setXYZ(i, v.x, v.y, v.z);
    }
    torusGeom.computeVertexNormals();
    geometriesToDispose.push(torusGeom);
    
    // Gold/Brass material
    const brassMat = new THREE.MeshPhongMaterial({
        color: isDark ? 0xffc844 : 0xe3ac34,
        shininess: 90,
        specular: 0xffffff,
        side: THREE.DoubleSide
    });
    
    const rim = new THREE.Mesh(torusGeom, brassMat);
    clockGroup.add(rim);
    
    // Distorted Watch Face Shape
    const faceShape = new THREE.Shape();
    const pointsCount = 32;
    for (let i = 0; i <= pointsCount; i++) {
        const theta = (i / pointsCount) * Math.PI * 2;
        let rx = 0.65 * Math.cos(theta);
        let ry = 0.65 * Math.sin(theta);
        if (ry < 0) {
            ry *= 1.8;
            rx *= 0.75;
        } else {
            ry *= 1.1;
        }
        if (i === 0) faceShape.moveTo(rx, ry);
        else faceShape.lineTo(rx, ry);
    }
    const faceGeom = new THREE.ShapeGeometry(faceShape);
    geometriesToDispose.push(faceGeom);
    
    // Canvas texture for distorted watch face
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#fdfbf2';
        ctx.fillRect(0, 0, 128, 128);
        ctx.strokeStyle = '#0b0a14';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(64, 64, 58, 0, Math.PI * 2);
        ctx.stroke();
        
        // Distorted Roman numerals (I, III, VI, IX, XII)
        ctx.fillStyle = '#0b0a14';
        ctx.font = 'bold 16px "Space Grotesk"';
        ctx.fillText('XII', 53, 24);
        ctx.fillText('III', 98, 68);
        ctx.fillText('VI', 56, 114);
        ctx.fillText('IX', 14, 68);
        
        // Melting hands
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(64, 64);
        ctx.bezierCurveTo(60, 80, 50, 90, 48, 100);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(64, 64);
        ctx.bezierCurveTo(80, 60, 90, 70, 95, 75);
        ctx.stroke();
    }
    const faceTex = new THREE.CanvasTexture(canvas);
    faceTex.colorSpace = THREE.SRGBColorSpace;
    const faceMat = new THREE.MeshBasicMaterial({ map: faceTex, side: THREE.DoubleSide });
    materialsToDispose.push(faceMat);
    
    const face = new THREE.Mesh(faceGeom, faceMat);
    face.position.z = 0.02;
    clockGroup.add(face);
    
    // Outline mesh
    const outlineMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x0b0a14 : 0x121124, side: THREE.BackSide });
    materialsToDispose.push(outlineMat);
    const outline = new THREE.Mesh(torusGeom, outlineMat);
    outline.scale.setScalar(1.1);
    outline.position.z = -0.02;
    rim.add(outline);
    
    return clockGroup;
}

// Procedural 3D Key (Alice key for Projects gate background)
function createSurrealKey(brassMat: THREE.Material, isDark: boolean, geometriesToDispose: THREE.BufferGeometry[], materialsToDispose: THREE.Material[]): THREE.Group {
    const keyGroup = new THREE.Group();
    
    // Handle loop
    const loopGeom = new THREE.TorusGeometry(0.8, 0.15, 8, 16);
    geometriesToDispose.push(loopGeom);
    const loop = new THREE.Mesh(loopGeom, brassMat);
    keyGroup.add(loop);
    
    // Shaft
    const shaftGeom = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8);
    shaftGeom.rotateZ(Math.PI / 2);
    shaftGeom.translate(1.6, 0, 0);
    geometriesToDispose.push(shaftGeom);
    const shaft = new THREE.Mesh(shaftGeom, brassMat);
    keyGroup.add(shaft);
    
    // Teeth
    const toothGeom = new THREE.BoxGeometry(0.5, 0.8, 0.3);
    geometriesToDispose.push(toothGeom);
    const tooth1 = new THREE.Mesh(toothGeom, brassMat);
    tooth1.position.set(2.8, -0.4, 0);
    keyGroup.add(tooth1);
    
    const tooth2 = new THREE.Mesh(toothGeom, brassMat);
    tooth2.position.set(3.2, -0.4, 0);
    tooth2.scale.set(0.8, 0.7, 1);
    keyGroup.add(tooth2);
    
    // Outline
    const outlineMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x0b0a14 : 0x121124, side: THREE.BackSide });
    materialsToDispose.push(outlineMat);
    
    const loopOutline = new THREE.Mesh(loopGeom, outlineMat);
    loopOutline.scale.setScalar(1.15);
    loopOutline.position.z = -0.02;
    loop.add(loopOutline);
    
    const shaftOutline = new THREE.Mesh(shaftGeom, outlineMat);
    shaftOutline.scale.set(1, 1.15, 1.15);
    shaftOutline.position.z = -0.02;
    shaft.add(shaftOutline);
    
    return keyGroup;
}

// Procedural 3D Teacup (Alice teacup for Projects gate background)
function createSurrealTeacup(cupColorMat: THREE.Material, isDark: boolean, geometriesToDispose: THREE.BufferGeometry[], materialsToDispose: THREE.Material[]): THREE.Group {
    const cupGroup = new THREE.Group();
    
    // Cup body
    const bodyGeom = new THREE.CylinderGeometry(1.0, 0.6, 1.4, 16, 1, true); // open ended cylinder
    geometriesToDispose.push(bodyGeom);
    const body = new THREE.Mesh(bodyGeom, cupColorMat);
    cupGroup.add(body);
    
    // Cup base
    const baseGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.15, 16);
    baseGeom.translate(0, -0.7, 0);
    geometriesToDispose.push(baseGeom);
    const base = new THREE.Mesh(baseGeom, cupColorMat);
    cupGroup.add(base);
    
    // Cup handle
    const handleGeom = new THREE.TorusGeometry(0.5, 0.12, 8, 16, Math.PI);
    handleGeom.translate(-0.8, 0, 0);
    geometriesToDispose.push(handleGeom);
    const handle = new THREE.Mesh(handleGeom, cupColorMat);
    cupGroup.add(handle);
    
    // Outline
    const outlineMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x0b0a14 : 0x121124, side: THREE.BackSide });
    materialsToDispose.push(outlineMat);
    
    const bodyOutline = new THREE.Mesh(bodyGeom, outlineMat);
    bodyOutline.scale.setScalar(1.1);
    body.add(bodyOutline);
    
    const handleOutline = new THREE.Mesh(handleGeom, outlineMat);
    handleOutline.scale.setScalar(1.15);
    handle.add(handleOutline);
    
    return cupGroup;
}

// Procedural 3D Dream Mask (Paprika mask for Skills gate background)
function createSurrealDreamMask(maskMat: THREE.Material, isDark: boolean, geometriesToDispose: THREE.BufferGeometry[], materialsToDispose: THREE.Material[]): THREE.Group {
    const maskGroup = new THREE.Group();
    // Face mask outline shape
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.8);
    shape.bezierCurveTo(1.2, 1.8, 1.4, 0.8, 1.4, 0);
    shape.bezierCurveTo(1.4, -0.8, 0.8, -1.8, 0, -1.8);
    shape.bezierCurveTo(-0.8, -1.8, -1.4, -0.8, -1.4, 0);
    shape.bezierCurveTo(-1.4, 0.8, -1.2, 1.8, 0, 1.8);
    
    // Cutout eyes
    const eyeL = new THREE.Path();
    eyeL.absarc(-0.5, 0.3, 0.25, 0, Math.PI * 2, true);
    shape.holes.push(eyeL);
    
    const eyeR = new THREE.Path();
    eyeR.absarc(0.5, 0.3, 0.25, 0, Math.PI * 2, true);
    shape.holes.push(eyeR);
    
    const maskGeom = new THREE.ExtrudeGeometry(shape, {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.1,
        bevelSize: 0.05,
        bevelSegments: 2
    });
    maskGeom.center();
    geometriesToDispose.push(maskGeom);
    
    const mesh = new THREE.Mesh(maskGeom, maskMat);
    maskGroup.add(mesh);
    
    // Outline
    const outlineMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x0b0a14 : 0x121124, side: THREE.BackSide });
    materialsToDispose.push(outlineMat);
    const outline = new THREE.Mesh(maskGeom, outlineMat);
    outline.scale.setScalar(1.08);
    mesh.add(outline);
    
    return maskGroup;
}

// Procedural 3D Surreal Floating Door (Alice/Wonderland style, swings open on camera approach)
function createSurrealFloatingDoor(isDark: boolean, geometriesToDispose: THREE.BufferGeometry[], materialsToDispose: THREE.Material[]): THREE.Group {
    const doorGroup = new THREE.Group();
    
    const hinge = new THREE.Group();
    hinge.name = 'hinge';
    hinge.position.set(-0.8, 0, 0);
    doorGroup.add(hinge);
    
    const panelGeom = new THREE.BoxGeometry(1.6, 3.2, 0.12);
    geometriesToDispose.push(panelGeom);
    
    const doorMat = new THREE.MeshPhongMaterial({
        color: isDark ? 0x8c6ec9 : 0x207a6e,
        shininess: 40,
        flatShading: true
    });
    const panel = new THREE.Mesh(panelGeom, doorMat);
    panel.position.set(0.8, 0, 0);
    hinge.add(panel);
    
    const outlineMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x0b0a14 : 0x121124, side: THREE.BackSide });
    materialsToDispose.push(outlineMat);
    const panelOutline = new THREE.Mesh(panelGeom, outlineMat);
    panelOutline.scale.setScalar(1.08);
    panel.add(panelOutline);
    
    const insetGeom = new THREE.BoxGeometry(1.2, 1.2, 0.05);
    geometriesToDispose.push(insetGeom);
    
    const insetColorMat = new THREE.MeshPhongMaterial({
        color: isDark ? 0xffafc0 : 0xd63c76,
        flatShading: true
    });
    
    const detailTop = new THREE.Mesh(insetGeom, insetColorMat);
    detailTop.position.set(0, 0.7, 0.08);
    panel.add(detailTop);
    
    const detailBottom = new THREE.Mesh(insetGeom, insetColorMat);
    detailBottom.position.set(0, -0.7, 0.08);
    panel.add(detailBottom);
    
    const knobGeom = new THREE.SphereGeometry(0.12, 8, 8);
    geometriesToDispose.push(knobGeom);
    const brassMat = new THREE.MeshPhongMaterial({ color: 0xe3ac34, shininess: 90 });
    
    const knob = new THREE.Mesh(knobGeom, brassMat);
    knob.position.set(0.6, 0, 0.1);
    panel.add(knob);
    
    return doorGroup;
}

// Helper to draw Seele Monolith Canvas Texture
function drawSeeleCanvas(canvas: HTMLCanvasElement, num: number, isDark: boolean) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    
    // Black background
    ctx.fillStyle = '#05040a';
    ctx.fillRect(0, 0, w, h);
    
    // Glowing red border
    ctx.strokeStyle = '#ff1a40';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, w - 12, h - 12);
    
    // Inner thin border
    ctx.strokeStyle = '#ff1a40';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, w - 36, h - 36);
    
    // Text setup
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw "SOUND ONLY"
    ctx.fillStyle = '#ff1a40';
    ctx.font = 'bold 32px "Courier New", Courier, monospace';
    ctx.shadowColor = '#ff1a40';
    ctx.shadowBlur = 10;
    ctx.fillText('SOUND ONLY', w * 0.5, h * 0.28);
    
    // Draw a divider line
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.42);
    ctx.lineTo(w * 0.8, h * 0.42);
    ctx.stroke();
    
    // Draw the number circle/bracket
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.65, 60, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw number (01, 02, etc.)
    ctx.font = 'bold 50px "Courier New", Courier, monospace';
    const numStr = num < 10 ? `0${num}` : `${num}`;
    ctx.fillText(numStr, w * 0.5, h * 0.65);
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

// Procedural Seele Monolith Door that swings open
function createSeeleMonolithDoor(index: number, side: number, isDark: boolean, geometriesToDispose: THREE.BufferGeometry[], materialsToDispose: THREE.Material[]): THREE.Group {
    const doorGroup = new THREE.Group();
    doorGroup.name = `seeleDoor_${index}`;
    
    const hinge = new THREE.Group();
    hinge.name = 'hinge';
    hinge.position.set(side * -0.8, 0, 0);
    doorGroup.add(hinge);
    
    const panelGeom = new THREE.BoxGeometry(1.6, 3.6, 0.15);
    geometriesToDispose.push(panelGeom);
    
    const blackMat = new THREE.MeshPhongMaterial({
        color: 0x05040a,
        shininess: 30,
        specular: 0x222222
    });
    
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 256;
    faceCanvas.height = 512;
    drawSeeleCanvas(faceCanvas, index, isDark);
    
    const seeleTex = new THREE.CanvasTexture(faceCanvas);
    seeleTex.colorSpace = THREE.SRGBColorSpace;
    
    const seeleFaceMat = new THREE.MeshPhongMaterial({
        map: seeleTex,
        emissive: new THREE.Color(0xff0000),
        emissiveIntensity: 0.2,
        shininess: 50,
        specular: 0x444444
    });
    
    materialsToDispose.push(blackMat, seeleFaceMat);
    
    // Materials: only the front face (+Z) has the canvas texture
    const materials = [
        blackMat,      // +X
        blackMat,      // -X
        blackMat,      // +Y
        blackMat,      // -Y
        seeleFaceMat,  // +Z (Front)
        blackMat       // -Z
    ];
    
    const panel = new THREE.Mesh(panelGeom, materials);
    panel.position.set(side * 0.8, 0, 0);
    hinge.add(panel);
    
    // Outline for comic book aesthetic
    const outlineMat = new THREE.MeshBasicMaterial({ color: isDark ? 0x0b0a14 : 0x121124, side: THREE.BackSide });
    materialsToDispose.push(outlineMat);
    const panelOutline = new THREE.Mesh(panelGeom, outlineMat);
    panelOutline.scale.set(1.08, 1.04, 1.08);
    panel.add(panelOutline);
    
    return doorGroup;
}

// Giant Face Outline Silhouette
function drawGiantFaceSilhouette(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    
    ctx.clearRect(0, 0, w, h);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Draw serene face outline
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.15);
    ctx.bezierCurveTo(w * 0.8, h * 0.2, w * 0.8, h * 0.65, w * 0.5, h * 0.88);
    ctx.bezierCurveTo(w * 0.2, h * 0.65, w * 0.2, h * 0.2, w * 0.5, h * 0.15);
    ctx.stroke();
    
    // Slit eyes
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(w * 0.38, h * 0.45, 20, 8, -0.05, 0, Math.PI * 2);
    ctx.ellipse(w * 0.62, h * 0.45, 20, 8, 0.05, 0, Math.PI * 2);
    ctx.stroke();
    
    // Nose
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.4);
    ctx.lineTo(w * 0.5, h * 0.58);
    ctx.lineTo(w * 0.46, h * 0.6);
    ctx.stroke();
    
    // Serene mouth
    ctx.beginPath();
    ctx.moveTo(w * 0.45, h * 0.72);
    ctx.quadraticCurveTo(w * 0.5, h * 0.74, w * 0.55, h * 0.72);
    ctx.stroke();
}

// Draw Blog Lounge graphic canvas texture
function drawBlogLoungeCanvas(canvas: HTMLCanvasElement, time: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    
    // Cream background
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, w, h);
    
    // Chocolate River / Pipes (Alice/Charlie factory)
    ctx.fillStyle = '#8c6ec9'; // Purple pipe
    ctx.fillRect(30, 0, 40, h * 0.35);
    ctx.fillStyle = '#e3ac34'; // Brass flange
    ctx.fillRect(20, h * 0.35, 60, 15);
    
    // Pouring chocolate liquid stream
    ctx.fillStyle = '#d63c76'; // Pink chocolate stream
    ctx.fillRect(35, h * 0.37, 30, h * 0.4);
    
    // Splashing bubble details
    ctx.fillStyle = '#f89fb3';
    for (let i = 0; i < 5; i++) {
        const bx = 50 + Math.sin(time * 5 + i) * 15;
        const by = h * 0.77 + Math.cos(time * 3 + i) * 6;
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Cartoon Mushrooms (Alice in Wonderland style) on floor
    const mushX1 = w - 100;
    const mushY1 = h - 100;
    // stem
    ctx.fillStyle = '#e3ac34';
    ctx.fillRect(mushX1 - 10, mushY1, 20, 80);
    // cap
    ctx.fillStyle = '#d63c76';
    ctx.beginPath();
    ctx.arc(mushX1, mushY1 + 10, 35, Math.PI, 0);
    ctx.fill();
    // spots
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(mushX1 - 15, mushY1 - 5, 5, 0, Math.PI * 2);
    ctx.arc(mushX1 + 15, mushY1 - 10, 6, 0, Math.PI * 2);
    ctx.arc(mushX1, mushY1 - 20, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw Blog Lounge title
    ctx.fillStyle = '#207a6e';
    ctx.font = "bold 28px 'Space Grotesk'";
    ctx.fillText("BLOG LOUNGE", w * 0.45, 60);
    
    // Article text blocks
    ctx.fillStyle = 'rgba(32, 122, 110, 0.12)';
    ctx.fillRect(w * 0.45, 90, w * 0.48, 120);
    
    ctx.fillStyle = '#207a6e';
    ctx.font = "11px 'Fira Code'";
    ctx.fillText("> SURREALIST TALES", w * 0.48, 120);
    ctx.fillText("> CHOCOLATE HYDRAULICS", w * 0.48, 140);
    ctx.fillText("> DOWN THE RABBIT HOLE", w * 0.48, 160);
    
    // Outer border
    ctx.strokeStyle = '#0b0a14';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);
}

// Draw Catlender graphic canvas texture
function drawCatlenderCanvas(canvas: HTMLCanvasElement, time: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    
    // Midnight dark backing
    ctx.fillStyle = '#100f1e';
    ctx.fillRect(0, 0, w, h);
    
    // Glowing neon-pink Cheshire Cat eyes
    const eyeBreathe = Math.sin(time * 3.0) * 2;
    ctx.fillStyle = '#ffafc0'; // Neon pink
    ctx.shadowColor = '#f82a72';
    ctx.shadowBlur = 15;
    
    ctx.beginPath();
    ctx.ellipse(w * 0.32, h * 0.35, 20 + eyeBreathe, 8, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(w * 0.68, h * 0.35, 20 + eyeBreathe, 8, 0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0;
    
    // Cheshire Grin - giant glowing pink smile with teeth!
    ctx.strokeStyle = '#ffafc0';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#f82a72';
    ctx.shadowBlur = 20;
    
    ctx.beginPath();
    ctx.moveTo(w * 0.2, h * 0.55);
    ctx.quadraticCurveTo(w * 0.5, h * 0.85, w * 0.8, h * 0.55);
    ctx.quadraticCurveTo(w * 0.5, h * 0.65, w * 0.2, h * 0.55);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.stroke();
    
    // Draw teeth vertical lines
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#100f1e';
    ctx.lineWidth = 3;
    for (let i = 1; i < 8; i++) {
        const t = i / 8;
        const x = w * 0.2 + (w * 0.6) * t;
        const topY = h * 0.55 + (h * 0.1) * (0.25 - Math.pow(t - 0.5, 2));
        const botY = h * 0.55 + (h * 0.3) * (0.25 - Math.pow(t - 0.5, 2));
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, botY);
        ctx.stroke();
    }
    
    // Sage green calendar block
    ctx.fillStyle = '#207a6e';
    ctx.fillRect(20, h * 0.68, w - 40, h * 0.28);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = "bold 20px 'Space Grotesk'";
    ctx.fillText("SCHEDULE / CATLENDER", 40, h * 0.76);
    
    // Draw pocket watch dial on right side of green block
    const dialX = w - 80;
    const dialY = h * 0.82;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(dialX, dialY, 20, 0, Math.PI * 2);
    ctx.stroke();
    
    // Watch hands
    const hrHand = time * 0.5;
    const minHand = time * 3.0;
    ctx.beginPath();
    ctx.moveTo(dialX, dialY);
    ctx.lineTo(dialX + Math.cos(hrHand) * 12, dialY + Math.sin(hrHand) * 12);
    ctx.moveTo(dialX, dialY);
    ctx.lineTo(dialX + Math.cos(minHand) * 16, dialY + Math.sin(minHand) * 16);
    ctx.stroke();
    
    // Rabbit Ears peeking at top
    ctx.fillStyle = '#e3ac34'; // Mustard gold
    ctx.strokeStyle = '#ffafc0';
    ctx.lineWidth = 3;
    
    ctx.beginPath();
    ctx.moveTo(w * 0.35, 100);
    ctx.quadraticCurveTo(w * 0.30, 20, w * 0.40, 30);
    ctx.quadraticCurveTo(w * 0.45, 60, w * 0.45, 100);
    ctx.fill();
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(w * 0.65, 100);
    ctx.quadraticCurveTo(w * 0.70, 20, w * 0.60, 30);
    ctx.quadraticCurveTo(w * 0.55, 60, w * 0.55, 100);
    ctx.fill();
    ctx.stroke();
    
    // Card border lines
    ctx.strokeStyle = '#ffafc0';
    ctx.lineWidth = 4;
    ctx.strokeRect(10, 10, w - 20, h - 20);
}

// Draw a Picasso-style pop art painting canvas dynamically (blinking & breathing eyes)
function drawPicassoCanvas(canvas: HTMLCanvasElement, time: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Background: Cream
    ctx.fillStyle = '#fdfaf2'; 
    ctx.fillRect(0, 0, w, h);

    // Retro mid-century layout blocks
    ctx.fillStyle = '#207A6E'; // Muted Teal/Sage
    ctx.fillRect(25, 25, w * 0.45, h * 0.55);

    ctx.fillStyle = '#d63c76'; // Terracotta
    ctx.fillRect(w * 0.52, 45, w * 0.43, h * 0.48);

    ctx.fillStyle = '#e3ac34'; // Mustard
    ctx.fillRect(35, h * 0.65, w * 0.88, h * 0.3);

    // Cubist Nose (Muted Orange)
    ctx.fillStyle = '#f87a53';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.3);
    ctx.lineTo(w * 0.65, h * 0.6);
    ctx.lineTo(w * 0.46, h * 0.6);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#0b0a14';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Drawing Picasso-style Breathing, Blinking Eyes
    const eyePositions = [
        { x: w * 0.32, y: h * 0.35, radius: 26 },
        { x: w * 0.72, y: h * 0.30, radius: 30 },
        { x: w * 0.50, y: h * 0.76, radius: 22 }
    ];

    eyePositions.forEach((eye, index) => {
        // Breathing effect: size swells sinusoidally
        const breath = Math.sin(time * 2.2 + index * 1.5) * 3.0;
        const r = eye.radius + breath;

        // Eye container
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(eye.x, eye.y, r * 1.6, r * 0.95, 0.05 * (index - 1), 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Blink calculation: closed at end of 4s interval
        const blinkCycle = (time * 1.4 + index * 3.8) % 6.0;
        const isClosed = blinkCycle > 5.5;

        if (!isClosed) {
            // Iris (Teal or Terracotta)
            ctx.fillStyle = index % 2 === 0 ? '#207A6E' : '#d63c76';
            ctx.beginPath();
            ctx.arc(eye.x, eye.y, r * 0.65, 0, Math.PI * 2);
            ctx.fill();

            // Pupil
            ctx.fillStyle = '#0b0a14';
            ctx.beginPath();
            ctx.arc(eye.x, eye.y, r * 0.32, 0, Math.PI * 2);
            ctx.fill();

            // White light reflection
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eye.x - r * 0.12, eye.y - r * 0.12, r * 0.12, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Draw eyelid line when blinking
            ctx.strokeStyle = '#0b0a14';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(eye.x - r * 1.6, eye.y);
            ctx.lineTo(eye.x + r * 1.6, eye.y);
            ctx.stroke();
        }
    });

    // Draw mouth outline
    ctx.strokeStyle = '#0b0a14';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.58, 28, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    // Bold, artistic "PROJECTIT" banner text in the mustard block
    ctx.fillStyle = '#0b0a14';
    ctx.font = "bold 34px 'Space Grotesk'";
    ctx.textAlign = 'center';
    ctx.fillText("PROJECTIT", w * 0.5, h * 0.91);
    ctx.textAlign = 'left';

    // Dark split line
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();
}

// Draw a Newspaper with text & dynamic Psyche Statistics bars
// Draw a Newspaper with text & dynamic Psyche Statistics bars matching App.tsx content
function drawNewspaperCanvas(canvas: HTMLCanvasElement, time: number) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Retro paper cream color
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, w, h);

    // Subtle paper crease texture
    ctx.strokeStyle = 'rgba(11, 10, 20, 0.12)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();

    // Newspaper title - Hesse Magic Theater theme
    ctx.fillStyle = '#0b0a14';
    ctx.font = "bold 32px 'Space Grotesk'";
    ctx.fillText("MAGIC THEATER", 25, 45);
    ctx.font = "bold 13px 'Fira Code'";
    ctx.fillText("FOR MADMEN ONLY", 25, 66);

    ctx.strokeStyle = '#0b0a14';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(20, 78);
    ctx.lineTo(w - 20, 78);
    ctx.stroke();

    // Left Column: BIOGRAPHY & OVERVIEW
    ctx.fillStyle = '#d63c76'; // Terracotta
    ctx.font = "bold 18px 'Space Grotesk'";
    ctx.fillText("BIOGRAPHY & OVERVIEW", 25, 105);

    ctx.fillStyle = 'rgba(11, 10, 20, 0.85)';
    ctx.font = "11px 'Fira Code'";
    const lines = [
        "Arsalan is a hybrid software",
        "engineer bridging development",
        "and quality assurance. With",
        "a strong background in",
        "distributed systems and",
        "automation, he builds",
        "scalable and reliable web",
        "applications using modern",
        "React and cloud-native",
        "architectures."
    ];
    lines.forEach((line, idx) => {
        ctx.fillText(line, 25, 128 + idx * 17);
    });

    // Sun Icon at the bottom of the left column
    const sunX = w * 0.23;
    const sunY = 325;
    ctx.fillStyle = '#e3ac34';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    for (let r = 0; r < 8; r++) {
        const angle = (r * Math.PI) / 4 + time * 0.4;
        const sx1 = sunX + Math.cos(angle) * 22;
        const sy1 = sunY + Math.sin(angle) * 22;
        const sx2 = sunX + Math.cos(angle) * 29;
        const sy2 = sunY + Math.sin(angle) * 29;
        ctx.beginPath();
        ctx.moveTo(sx1, sy1);
        ctx.lineTo(sx2, sy2);
        ctx.stroke();
    }
    // Sun smiley face details
    ctx.fillStyle = '#0b0a14';
    ctx.beginPath();
    ctx.arc(sunX - 5, sunY - 4, 2, 0, Math.PI * 2);
    ctx.arc(sunX + 5, sunY - 4, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sunX, sunY + 2, 7, 0, Math.PI);
    ctx.stroke();

    // Right Column: TECHNICAL SKILLS
    ctx.fillStyle = '#207A6E';
    ctx.font = "bold 18px 'Space Grotesk'";
    ctx.fillText("TECHNICAL SKILLS", w * 0.5 + 25, 105);

    const skillsDataList = [
        { name: 'JavaScript', percentage: 90 },
        { name: 'Three.js', percentage: 85 },
        { name: 'Docker', percentage: 70 },
        { name: 'Kubernetes', percentage: 80 },
        { name: 'TypeScript', percentage: 90 },
        { name: 'Playwright', percentage: 85 }
    ];

    skillsDataList.forEach((skill, idx) => {
        const y = 138 + idx * 32;
        ctx.fillStyle = '#0b0a14';
        ctx.font = "bold 10px 'Fira Code'";
        ctx.fillText(skill.name.toUpperCase(), w * 0.5 + 25, y);
        ctx.fillText(`${skill.percentage}%`, w - 60, y);

        // Progress track bar
        ctx.fillStyle = 'rgba(140, 110, 201, 0.16)';
        ctx.fillRect(w * 0.5 + 25, y + 6, w * 0.5 - 55, 6);

        // Progress bar fill
        ctx.fillStyle = '#e3ac34';
        ctx.fillRect(w * 0.5 + 25, y + 6, (w * 0.5 - 55) * (skill.percentage / 100), 6);
    });
}

// Custom Shader Material for melting wax arches on scroll
function createMeltingMaterial(color: THREE.Color): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: color },
            uCameraZ: { value: 100.0 },
            uTime: { value: 0 },
            uArchZ: { value: 0 },
            uOpacity: { value: 1.0 }
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
            uniform float uOpacity;
            varying vec2 vUv;
            varying vec3 vPosition;

            void main() {
                vec3 col = uColor;
                // Subtle shadow gradient on the Y position to add organic depth
                col *= 0.82 + 0.18 * sin(vPosition.y * 0.15);
                gl_FragColor = vec4(col, uOpacity);
            }
        `,
        side: THREE.DoubleSide,
        transparent: true
    });
}

// Custom Shader Material for melting outlines (Uses exact same vertex offset logic to avoid desync)
function createMeltingOutlineMaterial(color: THREE.Color): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: {
            uColor: { value: color },
            uCameraZ: { value: 100.0 },
            uTime: { value: 0 },
            uArchZ: { value: 0 },
            uOpacity: { value: 1.0 }
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
            uniform float uOpacity;
            void main() {
                gl_FragColor = vec4(uColor, uOpacity);
            }
        `,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: 1.1,
        polygonOffsetUnits: 4.0,
        transparent: true
    });
}

// Responsive camera config mapper based on screen aspect ratio
const getResponsiveConfig = (aspect: number) => {
    if (aspect < 0.7) {
        // Narrow smartphones
        return { fov: 70.0, shiftX: 2.2 };
    } else if (aspect < 1.0) {
        // Portrait iPads / Tablets
        return { fov: 62.0, shiftX: 3.5 };
    } else if (aspect < 1.3) {
        // Landscape iPads / Square monitors
        return { fov: 54.0, shiftX: 5.0 };
    } else {
        // Standard widescreen desktop monitors
        return { fov: 50.0, shiftX: 6.5 };
    }
};

export interface ScrollState {
    activeSection: 'hero' | 'projects' | 'skills' | 'transmission' | 'knot';
    activeProjectIndex: number;
    lerpedPercent: number;
}

// Helper to recursively update opacity on all materials in a Group
function updateGroupOpacity(obj: THREE.Object3D, opacity: number) {
    obj.traverse(child => {
        if (child instanceof THREE.Mesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(m => {
                m.transparent = true;
                m.opacity = opacity;
            });
        }
    });
}

interface RecursiveBloomCanvasProps {
    scrollPercent: number; // Values 0 to 1
    theme: 'light' | 'dark';
    onScrollStateChange?: (state: ScrollState) => void;
    returnTrigger?: number;
    onReturnComplete?: () => void;
}

export const RecursiveBloomCanvas: React.FC<RecursiveBloomCanvasProps> = ({ scrollPercent, theme, onScrollStateChange, returnTrigger, onReturnComplete }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const frameRef = useRef<number | null>(null);
    const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));

    // No feedback portal FBO refs needed

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

    const lerpedScroll = useRef(0);
    const lastEmittedStateRef = useRef<ScrollState | null>(null);
    const onScrollStateChangeRef = useRef(onScrollStateChange);

    useEffect(() => {
        onScrollStateChangeRef.current = onScrollStateChange;
    }, [onScrollStateChange]);

    const dedicatedMaterialsRef = useRef<{
        frameBorder: THREE.MeshPhongMaterial;
        frameOutline: THREE.MeshBasicMaterial;
        readerTorso: THREE.MeshPhongMaterial;
        readerFace: THREE.MeshPhongMaterial;
        readerArms: THREE.MeshPhongMaterial;
        readerOutline: THREE.MeshBasicMaterial;
        eyeSocket: THREE.MeshPhongMaterial;
        eyeSocketOutline: THREE.MeshBasicMaterial;
    } | null>(null);

    const bgMaterialsRef = useRef<{
        knot1: THREE.MeshPhongMaterial;
        knot2: THREE.MeshPhongMaterial;
        lorenz: THREE.MeshPhongMaterial;
    } | null>(null);

    const scrollPercentRef = useRef(scrollPercent);
    useEffect(() => {
        scrollPercentRef.current = scrollPercent;
    }, [scrollPercent]);

    // Transition refs for cinematic return flythrough (Space Wormhole travel)
    const transitionPhaseRef = useRef<'idle' | 'zoom_out_vortex' | 'pause_vortex' | 'plunge_vortex' | 'spin_vortex' | 'warp_travel' | 'exit_emerge' | 'spin_landing'>('idle');
    const transitionTimeRef = useRef(0);
    const startCamPosRef = useRef(new THREE.Vector3());
    const startQuaternionRef = useRef(new THREE.Quaternion());
    const shaderTimeRef = useRef(0);

    const onReturnCompleteRef = useRef(onReturnComplete);
    useEffect(() => {
        onReturnCompleteRef.current = onReturnComplete;
    }, [onReturnComplete]);

    useEffect(() => {
        if (returnTrigger && returnTrigger > 0) {
            transitionPhaseRef.current = 'zoom_out_vortex';
            transitionTimeRef.current = 0;
            if (cameraRef.current) {
                startCamPosRef.current.copy(cameraRef.current.position);
            }
        }
    }, [returnTrigger]);

    useEffect(() => {
        if (!mountRef.current) return;

        const simulation = simulationRef.current;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;

        // Disposal trackers
        const geometriesToDispose: THREE.BufferGeometry[] = [];
        const materialsToDispose: THREE.Material[] = [];

        const isDark = theme === 'dark';

        // 1. Scene & Camera Setup
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(isDark ? 0x0b0a14 : 0x121124);
        sceneRef.current = scene;

        const config = getResponsiveConfig(w / h);
        const camera = new THREE.PerspectiveCamera(config.fov, w / h, 0.1, 1000);
        camera.position.set(0, 0, 100);
        cameraRef.current = camera;

        // 2. WebGL Renderer (discrete high-performance power preference)
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        mountRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // 3. FBO feedback buffer targets removed (no vortex feedback)

        // 4. Lights
        const ambient = new THREE.AmbientLight(0xffffff, 0.75);
        scene.add(ambient);

        const light = new THREE.DirectionalLight(0xfff5e6, 0.85);
        light.position.set(20, 30, 35);
        scene.add(light);

        // 5. Materials (Midnight foliage & neon colors)
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
        const terracottaRockMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xf82a72 : 0xd63c76, flatShading: true, side: THREE.DoubleSide, transparent: true });
        const navyRockMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xa482ff : 0x8c6ec9, flatShading: true, side: THREE.DoubleSide, transparent: true });
        const sageRockMat = new THREE.MeshPhongMaterial({ color: isDark ? 0x1ee3bd : 0x207a6e, flatShading: true, side: THREE.DoubleSide, transparent: true });
        const mustardRockMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xffc844 : 0xe3ac34, flatShading: true, side: THREE.DoubleSide, transparent: true });
        const roseRockMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xffafc0 : 0xf89fb3, flatShading: true, side: THREE.DoubleSide, transparent: true });

        rockMaterialsRef.current = {
            terracotta: terracottaRockMat,
            navy: navyRockMat,
            sage: sageRockMat,
            mustard: mustardRockMat,
            rose: roseRockMat
        };
        materialsToDispose.push(terracottaRockMat, navyRockMat, sageRockMat, mustardRockMat, roseRockMat);

        // Dedicated non-fading materials for wall frames, eyeball, and newspaper reader
        const frameBorderMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xa482ff : 0x8c6ec9, flatShading: true, side: THREE.DoubleSide });
        const frameOutlineMat = new THREE.MeshBasicMaterial({ 
            color: isDark ? 0x0b0a14 : 0x121124, 
            side: THREE.BackSide,
            polygonOffset: true,
            polygonOffsetFactor: 1.1,
            polygonOffsetUnits: 4.0
        });
        
        const readerTorsoMat = new THREE.MeshPhongMaterial({ color: isDark ? 0x1ee3bd : 0x207a6e, flatShading: true, side: THREE.DoubleSide });
        const readerFaceMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xffc844 : 0xe3ac34, flatShading: true, side: THREE.DoubleSide });
        const readerArmsMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xf82a72 : 0xd63c76, flatShading: true, side: THREE.DoubleSide });
        const readerOutlineMat = new THREE.MeshBasicMaterial({
            color: isDark ? 0x0b0a14 : 0x121124,
            side: THREE.BackSide,
            polygonOffset: true,
            polygonOffsetFactor: 1.15,
            polygonOffsetUnits: 4.0
        });
        
        const eyeSocketMat = new THREE.MeshPhongMaterial({ color: isDark ? 0xf82a72 : 0xd63c76, flatShading: true, side: THREE.DoubleSide });
        const eyeSocketOutlineMat = new THREE.MeshBasicMaterial({
            color: isDark ? 0x0b0a14 : 0x121124,
            side: THREE.BackSide,
            polygonOffset: true,
            polygonOffsetFactor: 1.1,
            polygonOffsetUnits: 4.0
        });

        dedicatedMaterialsRef.current = {
            frameBorder: frameBorderMat,
            frameOutline: frameOutlineMat,
            readerTorso: readerTorsoMat,
            readerFace: readerFaceMat,
            readerArms: readerArmsMat,
            readerOutline: readerOutlineMat,
            eyeSocket: eyeSocketMat,
            eyeSocketOutline: eyeSocketOutlineMat
        };
        materialsToDispose.push(frameBorderMat, frameOutlineMat, readerTorsoMat, readerFaceMat, readerArmsMat, readerOutlineMat, eyeSocketMat, eyeSocketOutlineMat);

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

        // 7. FLOATING SURREAL ROCK PLATFORMS (Phong solid materials - modified theme)
        const rockGroup = new THREE.Group();
        scene.add(rockGroup);

        const rockPositions = [
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

        // Antlers on left and right walls of Gate 1 (Hero / Fulton St theme)
        const antlerGroup = new THREE.Group();
        scene.add(antlerGroup);

        const antlerColorMat = new THREE.MeshPhongMaterial({
            color: isDark ? 0x8c6ec9 : 0x207a6e,
            flatShading: true
        });
        materialsToDispose.push(antlerColorMat);

        const pinkBlossomMat = new THREE.MeshPhongMaterial({
            color: 0xf89fb3, // pastel pink
            emissive: 0xf82a72, // glowing neon pink
            emissiveIntensity: 0.5
        });
        materialsToDispose.push(pinkBlossomMat);

        const addAntlerToGroup = (x: number, y: number, z: number, scaleVal: number, rotZ: number) => {
            const antler = createAntlerBranch(4.5, scaleVal, geometriesToDispose);
            antler.position.set(x, y, z);
            antler.rotation.z = rotZ;
            antler.traverse((child) => {
                if (child instanceof THREE.Mesh) {
                    if (child.geometry.type === 'SphereGeometry') {
                        child.material = pinkBlossomMat;
                    } else {
                        child.material = antlerColorMat;
                    }
                }
            });
            antlerGroup.add(antler);
        };

        // Left Antler
        addAntlerToGroup(-13, 3, 80, 1.2, 0.45);
        // Right Antler
        addAntlerToGroup(13, 3, 80, 1.2, -0.45);

        // Giant Red Sun (representing Fulton Street red sun in the background)
        const sunGeom = new THREE.SphereGeometry(22, 32, 32);
        geometriesToDispose.push(sunGeom);
        const sunMat = new THREE.MeshBasicMaterial({
            color: 0xd63c76,
            transparent: true,
            opacity: 0.95
        });
        materialsToDispose.push(sunMat);
        const sunMesh = new THREE.Mesh(sunGeom, sunMat);
        sunMesh.name = 'giantRedSun';
        sunMesh.position.set(0, 4, -180);
        scene.add(sunMesh);

        // Skills Gate Chessboard Floor (Chess king / Steppenwolf Chessboard pattern)
        const chessCanvas = document.createElement('canvas');
        chessCanvas.width = 256;
        chessCanvas.height = 1024;
        const chessCtx = chessCanvas.getContext('2d');
        if (chessCtx) {
            const cols = 8;
            const rows = 32;
            const wCell = 256 / cols;
            const hCell = 1024 / rows;
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    chessCtx.fillStyle = (r + c) % 2 === 0 ? '#100f1e' : '#e3ac34'; // Black/Gold
                    chessCtx.fillRect(c * wCell, r * hCell, wCell, hCell);
                }
            }
        }
        const chessTex = new THREE.CanvasTexture(chessCanvas);
        chessTex.wrapS = THREE.RepeatWrapping;
        chessTex.wrapT = THREE.RepeatWrapping;
        chessTex.repeat.set(1, 1);
        chessTex.colorSpace = THREE.SRGBColorSpace;
        
        const chessFloorGeom = new THREE.PlaneGeometry(24, 100);
        geometriesToDispose.push(chessFloorGeom);
        const chessFloorMat = new THREE.MeshPhongMaterial({
            map: chessTex,
            transparent: true,
            opacity: 0.0,
            side: THREE.DoubleSide
        });
        materialsToDispose.push(chessFloorMat);
        
        const chessFloor = new THREE.Mesh(chessFloorGeom, chessFloorMat);
        chessFloor.name = 'chessFloor';
        chessFloor.position.set(0, -8.5, -35); // Z center of skills section (15 to -85)
        chessFloor.rotation.x = -Math.PI / 2;
        scene.add(chessFloor);

        // 8. IRIDESCENT SPLINE TENDRIL (Winding spline vein down center void + deep spiral vortex)
        const basePoints = [
            new THREE.Vector3(-12, 12, 85),
            new THREE.Vector3(-8, -12, 45),
            new THREE.Vector3(10, 10, 5),
            new THREE.Vector3(-5, -10, -35),
            new THREE.Vector3(8, 12, -75),
            new THREE.Vector3(0, 0, -105)
        ];

        // Append a vortex spiral at the deep end
        const splinePoints = [...basePoints];
        const spiralStartVal = -105;
        const spiralEndVal = -155;
        const spiralTurns = 3.5;
        const spiralPointsCount = 45;
        
        for (let i = 1; i <= spiralPointsCount; i++) {
            const t = i / spiralPointsCount;
            const z = spiralStartVal + t * (spiralEndVal - spiralStartVal);
            const radius = t * 7.5;
            const theta = t * Math.PI * 2 * spiralTurns;
            const x = Math.cos(theta) * radius;
            const y = Math.sin(theta) * radius;
            splinePoints.push(new THREE.Vector3(x, y, z));
        }

        const curve = new THREE.CatmullRomCurve3(splinePoints);
        const tubeGeom = new THREE.TubeGeometry(curve, 250, 0.35, 8, false);
        geometriesToDispose.push(tubeGeom);

        // Custom GLSL shader for iridescent flow
        const iridescentShader = {
            uniforms: {
                uTime: { value: 0 },
                uOpacity: { value: 1.0 },
                uWarpMode: { value: 0.0 }
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
                uniform float uOpacity;
                uniform float uWarpMode;
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

                    // Depth-fade: cylinder fades out at the deep end, emerging from nothing
                    // If uWarpMode is 1.0, don't fade out at the end, keep it fully glowing!
                    float depthFade = 1.0;
                    if (uWarpMode < 0.5) {
                        depthFade = 1.0 - smoothstep(0.5, 0.98, vUv.x) * 0.85;
                    }
                    float alpha = depthFade * uOpacity;

                    gl_FragColor = vec4(finalCol, alpha);
                }
            `
        };

        const iridescentMat = new THREE.ShaderMaterial({
            uniforms: THREE.UniformsUtils.clone(iridescentShader.uniforms),
            vertexShader: iridescentShader.vertexShader,
            fragmentShader: iridescentShader.fragmentShader,
            transparent: true,
            side: THREE.DoubleSide
        });
        materialsToDispose.push(iridescentMat);

        const tubeMesh = new THREE.Mesh(tubeGeom, iridescentMat);
        scene.add(tubeMesh);

        // Spline outline stroke
        const tubeOutlineGeom = new THREE.TubeGeometry(curve, 250, 0.42, 8, false);
        geometriesToDispose.push(tubeOutlineGeom);

        // Outline material for cogs outlines and tube outline
        const blackOutlineSideMat = new THREE.MeshBasicMaterial({ 
            color: isDark ? 0x0b0a14 : 0x121124, 
            side: THREE.BackSide,
            polygonOffset: true,
            polygonOffsetFactor: 1.1,
            polygonOffsetUnits: 4.0,
            transparent: true
        });
        materialsToDispose.push(blackOutlineSideMat);

        const tubeOutline = new THREE.Mesh(tubeOutlineGeom, blackOutlineSideMat);
        tubeOutline.name = 'tubeOutline';
        scene.add(tubeOutline);

        // ------------------------------------------------------------------
        // PROCEDURAL COGS - Recolored to polished brass
        // ------------------------------------------------------------------
        const cogsGroup = new THREE.Group();
        cogsGroup.name = 'cogsGroup';
        scene.add(cogsGroup);

        const brassCogMat = new THREE.MeshPhongMaterial({
            color: 0xe3ac34, // brass gold
            shininess: 95,
            specular: 0xffffff,
            flatShading: true,
            transparent: true
        });
        materialsToDispose.push(brassCogMat);

        const cogGeom1 = createCogGeometry(3.5, 4.5, 12, 1.2);
        const cogGeom2 = createCogGeometry(2.5, 3.2, 10, 0.9);
        const cogGeom3 = createCogGeometry(3.0, 3.8, 8, 1.0);
        geometriesToDispose.push(cogGeom1, cogGeom2, cogGeom3);

        const cog1 = new THREE.Mesh(cogGeom1, brassCogMat);
        cog1.position.set(16, 6, 25);
        cogsGroup.add(cog1);
        simulation.addParticle(cog1, 14);

        const cog2 = new THREE.Mesh(cogGeom2, brassCogMat);
        cog2.position.set(-16, -4, -5);
        cogsGroup.add(cog2);
        simulation.addParticle(cog2, 14);

        const cog3 = new THREE.Mesh(cogGeom3, brassCogMat);
        cog3.position.set(14, -8, -35);
        cogsGroup.add(cog3);
        simulation.addParticle(cog3, 14);

        // Add black outline to cogs
        [cog1, cog2, cog3].forEach(cog => {
            const outline = new THREE.Mesh(cog.geometry, blackOutlineSideMat);
            outline.scale.setScalar(1.08);
            cog.add(outline);
        });

        // ------------------------------------------------------------------
        // PROJECT FRAMES (RIGHT WALL of Projects section, Z = 42, 28, 14)
        // ------------------------------------------------------------------
        const projectFramesGroup = new THREE.Group();
        projectFramesGroup.name = 'projectFramesGroup';
        scene.add(projectFramesGroup);

        const projectBorderGeom = new THREE.BoxGeometry(6.6, 8.6, 0.5);
        const projectPaintingGeom = new THREE.PlaneGeometry(5.8, 7.8);
        geometriesToDispose.push(projectBorderGeom, projectPaintingGeom);

        // Frame 1: Blog Lounge (Z = 45)
        const frame1 = new THREE.Group();
        frame1.position.set(9.5, 2.0, 45.0); // Moved inward to prevent collision
        frame1.rotation.y = -Math.PI * 0.5; // Flush facing corridor center
        projectFramesGroup.add(frame1);

        const border1 = new THREE.Mesh(projectBorderGeom, frameBorderMat);
        frame1.add(border1);
        const border1Outline = new THREE.Mesh(projectBorderGeom, frameOutlineMat);
        border1Outline.scale.setScalar(1.06);
        border1.add(border1Outline);

        const blogCanvas = document.createElement('canvas');
        blogCanvas.width = 512;
        blogCanvas.height = 512;
        const blogTexture = new THREE.CanvasTexture(blogCanvas);
        blogTexture.colorSpace = THREE.SRGBColorSpace;
        const blogMat = new THREE.MeshBasicMaterial({ map: blogTexture, side: THREE.DoubleSide });
        materialsToDispose.push(blogMat);
        const painting1 = new THREE.Mesh(projectPaintingGeom, blogMat);
        painting1.position.set(0, 0, 0.26);
        frame1.add(painting1);

        // Initialize texture immediately so it is never black on initial load
        drawBlogLoungeCanvas(blogCanvas, 0);
        blogTexture.needsUpdate = true;

        // Frame 2: ProjectIt / Picasso Face (Z = 20)
        const frame2 = new THREE.Group();
        frame2.position.set(9.5, 2.0, 20.0); // Moved inward to prevent collision
        frame2.rotation.y = -Math.PI * 0.5;
        projectFramesGroup.add(frame2);

        const border2 = new THREE.Mesh(projectBorderGeom, frameBorderMat);
        frame2.add(border2);
        const border2Outline = new THREE.Mesh(projectBorderGeom, frameOutlineMat);
        border2Outline.scale.setScalar(1.06);
        border2.add(border2Outline);

        const picassoCanvas = document.createElement('canvas');
        picassoCanvas.width = 512;
        picassoCanvas.height = 512;
        const picassoTexture = new THREE.CanvasTexture(picassoCanvas);
        picassoTexture.colorSpace = THREE.SRGBColorSpace;
        const picassoMat = new THREE.MeshBasicMaterial({ map: picassoTexture, side: THREE.DoubleSide });
        materialsToDispose.push(picassoMat);
        const painting2 = new THREE.Mesh(projectPaintingGeom, picassoMat);
        painting2.position.set(0, 0, 0.26);
        frame2.add(painting2);

        // Initialize texture immediately so it is never black on initial load
        drawPicassoCanvas(picassoCanvas, 0);
        picassoTexture.needsUpdate = true;

        // Frame 3: Catlender (Z = -5)
        const frame3 = new THREE.Group();
        frame3.position.set(9.5, 2.0, -5.0); // Moved inward to prevent collision
        frame3.rotation.y = -Math.PI * 0.5;
        projectFramesGroup.add(frame3);

        const border3 = new THREE.Mesh(projectBorderGeom, frameBorderMat);
        frame3.add(border3);
        const border3Outline = new THREE.Mesh(projectBorderGeom, frameOutlineMat);
        border3Outline.scale.setScalar(1.06);
        border3.add(border3Outline);

        const catCanvas = document.createElement('canvas');
        catCanvas.width = 512;
        catCanvas.height = 512;
        const catTexture = new THREE.CanvasTexture(catCanvas);
        catTexture.colorSpace = THREE.SRGBColorSpace;
        const catMat = new THREE.MeshBasicMaterial({ map: catTexture, side: THREE.DoubleSide });
        materialsToDispose.push(catMat);
        const painting3 = new THREE.Mesh(projectPaintingGeom, catMat);
        painting3.position.set(0, 0, 0.26);
        frame3.add(painting3);

        // Initialize texture immediately so it is never black on initial load
        drawCatlenderCanvas(catCanvas, 0);
        catTexture.needsUpdate = true;

        // Eyeball socket on right wall tracking the cursor
        const wallEyeGroup = new THREE.Group();
        wallEyeGroup.name = 'wallEyeGroup';
        wallEyeGroup.position.set(9.2, 7.2, 20.0); // Moved inward to match frames
        wallEyeGroup.rotation.y = -Math.PI * 0.5; // Face the corridor center
        scene.add(wallEyeGroup);

        const socketGeom = new THREE.DodecahedronGeometry(1.0, 1);
        geometriesToDispose.push(socketGeom);
        const socketMesh = new THREE.Mesh(socketGeom, eyeSocketMat);
        wallEyeGroup.add(socketMesh);
        const socketOutline = new THREE.Mesh(socketGeom, eyeSocketOutlineMat);
        socketOutline.scale.setScalar(1.1);
        socketMesh.add(socketOutline);

        // Eyeball sphere
        const eyeballGeom = new THREE.SphereGeometry(0.7, 16, 16);
        const eyeballMat = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: false });
        geometriesToDispose.push(eyeballGeom);
        materialsToDispose.push(eyeballMat);
        const eyeball = new THREE.Mesh(eyeballGeom, eyeballMat);
        wallEyeGroup.add(eyeball);

        // Pupil/Iris
        const pupilGeom = new THREE.SphereGeometry(0.32, 16, 16);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x207a6e });
        geometriesToDispose.push(pupilGeom);
        materialsToDispose.push(pupilMat);
        const pupil = new THREE.Mesh(pupilGeom, pupilMat);
        pupil.position.set(0, 0, 0.52);
        eyeball.add(pupil);

        const pupilCenterGeom = new THREE.SphereGeometry(0.16, 16, 16);
        const pupilCenterMat = new THREE.MeshBasicMaterial({ color: 0x0b0a14 });
        geometriesToDispose.push(pupilCenterGeom);
        materialsToDispose.push(pupilCenterMat);
        const pupilCenter = new THREE.Mesh(pupilCenterGeom, pupilCenterMat);
        pupilCenter.position.set(0, 0, 0.18);
        pupil.add(pupilCenter);

        // ------------------------------------------------------------------
        // 3D NEWSPAPER READER MODEL (LEFT WALL, Z = -60.0)
        // ------------------------------------------------------------------
        const readerGroup = new THREE.Group();
        readerGroup.name = 'newspaperReader';
        readerGroup.position.set(-13.0, -2.8, -60.0); // Left wall, facing center
        readerGroup.rotation.y = Math.PI * 0.5; // Flush facing right wall
        scene.add(readerGroup);

        // Torso - Chess King shape
        const baseGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 16);
        const bodyGeom = new THREE.CylinderGeometry(0.5, 1.0, 2.2, 16);
        const crownGeom = new THREE.CylinderGeometry(0.8, 0.4, 0.6, 16);
        geometriesToDispose.push(baseGeom, bodyGeom, crownGeom);

        const chessKingMat = new THREE.MeshPhongMaterial({
            color: isDark ? 0xcc9966 : 0x8a5a36, // Wooden chess piece style
            flatShading: true,
            side: THREE.DoubleSide
        });
        materialsToDispose.push(chessKingMat);

        const readerTorso = new THREE.Group();
        
        const baseMesh = new THREE.Mesh(baseGeom, chessKingMat);
        baseMesh.position.y = -1.3;
        readerTorso.add(baseMesh);
        const baseOutline = new THREE.Mesh(baseGeom, readerOutlineMat);
        baseOutline.scale.setScalar(1.1);
        baseMesh.add(baseOutline);

        const bodyMesh = new THREE.Mesh(bodyGeom, chessKingMat);
        bodyMesh.position.y = 0.0;
        readerTorso.add(bodyMesh);
        const bodyOutline = new THREE.Mesh(bodyGeom, readerOutlineMat);
        bodyOutline.scale.set(1.1, 1.05, 1.1);
        bodyMesh.add(bodyOutline);

        const crownMesh = new THREE.Mesh(crownGeom, chessKingMat);
        crownMesh.position.y = 1.3;
        readerTorso.add(crownMesh);
        const crownOutline = new THREE.Mesh(crownGeom, readerOutlineMat);
        crownOutline.scale.setScalar(1.1);
        crownMesh.add(crownOutline);

        readerGroup.add(readerTorso);

        // Face - Cubist structured Turn 26 Dodecahedron
        const readerFaceGeom = new THREE.DodecahedronGeometry(0.9, 0);
        geometriesToDispose.push(readerFaceGeom);
        const readerFace = new THREE.Mesh(readerFaceGeom, readerFaceMat);
        readerFace.position.set(0, 2.2, 0.1);
        readerFace.rotation.set(0.1, 0.3, 0.05);
        readerGroup.add(readerFace);

        const readerFaceOutline = new THREE.Mesh(readerFaceGeom, readerOutlineMat);
        readerFaceOutline.scale.setScalar(1.1);
        readerFace.add(readerFaceOutline);

        // Left and Right Arms holding newspaper
        const readerArmLGeom = new THREE.BoxGeometry(0.6, 1.6, 0.6);
        const readerArmRGeom = new THREE.BoxGeometry(0.6, 1.6, 0.6);
        geometriesToDispose.push(readerArmLGeom, readerArmRGeom);

        const readerArmL = new THREE.Mesh(readerArmLGeom, readerArmsMat);
        readerArmL.position.set(-1.4, 0.5, 0.9);
        readerArmL.rotation.set(0.7, 0.25, -0.3);
        readerGroup.add(readerArmL);

        const readerArmROutline = new THREE.Mesh(readerArmRGeom, readerOutlineMat);
        readerArmROutline.scale.setScalar(1.15);

        const readerArmLOutline = new THREE.Mesh(readerArmLGeom, readerOutlineMat);
        readerArmLOutline.scale.setScalar(1.15);
        readerArmL.add(readerArmLOutline);

        const readerArmR = new THREE.Mesh(readerArmRGeom, readerArmsMat);
        readerArmR.position.set(1.4, 0.5, 0.9);
        readerArmR.rotation.set(0.7, -0.25, 0.3);
        readerArmR.add(readerArmROutline);
        readerGroup.add(readerArmR);

        // Newspaper mesh held in front
        const newspaperCanvas = document.createElement('canvas');
        newspaperCanvas.width = 512;
        newspaperCanvas.height = 512;
        const newspaperTexture = new THREE.CanvasTexture(newspaperCanvas);
        newspaperTexture.colorSpace = THREE.SRGBColorSpace;
        const newspaperMat = new THREE.MeshBasicMaterial({ map: newspaperTexture, side: THREE.DoubleSide });
        materialsToDispose.push(newspaperMat);

        const newspaperGeom = new THREE.PlaneGeometry(6.4, 4.2);
        geometriesToDispose.push(newspaperGeom);
        const newspaperPaper = new THREE.Mesh(newspaperGeom, newspaperMat);
        newspaperPaper.position.set(0, 0.6, 1.8);
        newspaperPaper.rotation.set(-0.2, 0, 0); // Angled slightly towards face
        readerGroup.add(newspaperPaper);

        const newspaperPaperOutline = new THREE.Mesh(newspaperGeom, readerOutlineMat);
        newspaperPaperOutline.scale.setScalar(1.02);
        newspaperPaperOutline.position.set(0, 0, -0.01);
        newspaperPaper.add(newspaperPaperOutline);

        // Initialize texture immediately so it is never black on initial load
        drawNewspaperCanvas(newspaperCanvas, 0);
        newspaperTexture.needsUpdate = true;

        // 9. DRIFTING PHYSICS PARTICLES (Anti-gravity themed objects per section)
        
        // Gate 1: Forest Spirits (Z = 70 to 95)
        const forestSpiritMat = new THREE.MeshPhongMaterial({
            color: 0x207a6e,
            emissive: isDark ? 0x1ee3bd : 0x207a6e,
            emissiveIntensity: 1.4,
            flatShading: true,
            transparent: true
        });
        materialsToDispose.push(forestSpiritMat);

        for (let i = 0; i < 8; i++) {
            const pGeom = new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.25, 0);
            geometriesToDispose.push(pGeom);
            const pMesh = new THREE.Mesh(pGeom, forestSpiritMat);
            
            pMesh.position.set(
                (Math.random() - 0.5) * 14,
                (Math.random() - 0.5) * 12 + 1,
                70 + Math.random() * 25
            );
            
            const pOutline = new THREE.Mesh(pGeom, blackOutlineSideMat);
            pOutline.scale.setScalar(1.22);
            pMesh.add(pOutline);
            
            scene.add(pMesh);
            simulation.addParticle(pMesh);
        }

        // Gate 2: Tumbling Playing Cards & Pocket Watches (Z = 15 to 70)
        const cardSuits: Array<'heart' | 'spade' | 'diamond' | 'club'> = ['heart', 'spade', 'diamond', 'club'];
        const cardValues = ['A', 'K', 'Q', 'J'];
        
        for (let i = 0; i < 5; i++) {
            const cardTex = createPlayingCardTexture(cardSuits[i % 4], cardValues[i % 4], isDark);
            const cardMat = new THREE.MeshBasicMaterial({ map: cardTex, side: THREE.DoubleSide, transparent: true });
            materialsToDispose.push(cardMat);
            
            const cardGeom = new THREE.PlaneGeometry(0.8, 1.2);
            geometriesToDispose.push(cardGeom);
            const cardMesh = new THREE.Mesh(cardGeom, cardMat);
            
            cardMesh.position.set(
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 12,
                15 + Math.random() * 50
            );
            cardMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            
            const pOutline = new THREE.Mesh(cardGeom, blackOutlineSideMat);
            pOutline.scale.set(1.1, 1.08, 1);
            pOutline.position.z = -0.01;
            cardMesh.add(pOutline);
            
            scene.add(cardMesh);
            simulation.addParticle(cardMesh);
        }
        
        for (let i = 0; i < 4; i++) {
            const watchMesh = createPocketWatchMesh(isDark, geometriesToDispose, materialsToDispose);
            watchMesh.position.set(
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 12,
                15 + Math.random() * 50
            );
            watchMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
            
            scene.add(watchMesh);
            simulation.addParticle(watchMesh as any);
        }

        // Gate 3: Melting Clocks (Z = -85 to 15)
        for (let i = 0; i < 4; i++) {
            const clockMesh = createMeltingClockMesh(isDark, geometriesToDispose, materialsToDispose);
            clockMesh.position.set(
                (Math.random() - 0.5) * 15,
                (Math.random() - 0.5) * 12 + 1,
                -80 + Math.random() * 95
            );
            clockMesh.rotation.set(Math.random() * 0.4 - 0.2, Math.random() * Math.PI, Math.random() * 0.3 - 0.15);
            
            scene.add(clockMesh);
            simulation.addParticle(clockMesh as any);
        }

        // Gate 4: Seele Monolith Doors (Z = -155 to -85) that swing open
        const seeleDoors: THREE.Group[] = [];
        const seeleFaceMaterials: THREE.MeshPhongMaterial[] = [];
        for (let i = 0; i < 4; i++) {
            const side = i % 2 === 0 ? 1 : -1;
            const monolithDoor = createSeeleMonolithDoor(i + 1, side, isDark, geometriesToDispose, materialsToDispose);
            
            // Extract the seele face material for dynamic pulsing glow
            monolithDoor.traverse(child => {
                if (child instanceof THREE.Mesh && Array.isArray(child.material)) {
                    child.material.forEach(m => {
                        if (m instanceof THREE.MeshPhongMaterial && m.map) {
                            seeleFaceMaterials.push(m);
                        }
                    });
                }
            });
            
            monolithDoor.position.set(
                side * 6.5,
                -1.5,
                -142 + i * 18
            );
            monolithDoor.rotation.set(0, side * 0.1, 0);
            
            scene.add(monolithDoor);
            seeleDoors.push(monolithDoor);
        }

        // Giant Face Silhouette at Z = -210
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = 512;
        faceCanvas.height = 512;
        drawGiantFaceSilhouette(faceCanvas);
        
        const faceTex = new THREE.CanvasTexture(faceCanvas);
        faceTex.colorSpace = THREE.SRGBColorSpace;
        
        const faceGeom = new THREE.PlaneGeometry(32, 32);
        geometriesToDispose.push(faceGeom);
        const faceMat = new THREE.MeshBasicMaterial({
            map: faceTex,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        materialsToDispose.push(faceMat);
        
        const giantFaceMesh = new THREE.Mesh(faceGeom, faceMat);
        giantFaceMesh.name = 'giantFaceMesh';
        giantFaceMesh.position.set(0, 0, -210);
        scene.add(giantFaceMesh);

        // 9.5 BACKGROUND SURREAL THEMED SHAPES (Key, Teacup, Paprika Mask)
        const bgObjectsGroup = new THREE.Group();
        bgObjectsGroup.name = 'bgObjectsGroup';
        scene.add(bgObjectsGroup);

        // Materials: solid glossy configurations mapping to Sage, Mustard, and Terracotta colors
        const knotMat1 = new THREE.MeshPhongMaterial({
            color: isDark ? 0x1ee3bd : 0x207a6e,
            flatShading: true,
            transparent: true,
            opacity: 0.0,
            shininess: 90,
            specular: 0xffffff,
            side: THREE.DoubleSide
        });

        const knotMat2 = new THREE.MeshPhongMaterial({
            color: isDark ? 0xffc844 : 0xe3ac34,
            flatShading: true,
            transparent: true,
            opacity: 0.0,
            shininess: 90,
            specular: 0xffffff,
            side: THREE.DoubleSide
        });

        const lorenzMat = new THREE.MeshPhongMaterial({
            color: isDark ? 0xf82a72 : 0xd63c76,
            flatShading: true,
            transparent: true,
            opacity: 0.0,
            shininess: 90,
            specular: 0xffffff,
            side: THREE.DoubleSide
        });
        materialsToDispose.push(knotMat1, knotMat2, lorenzMat);

        bgMaterialsRef.current = {
            knot1: knotMat1,
            knot2: knotMat2,
            lorenz: lorenzMat
        };

        // Key uses knotMat2 (mustard/brass)
        const knotMesh1 = createSurrealKey(knotMat2, isDark, geometriesToDispose, materialsToDispose);
        knotMesh1.position.set(15.0, 1.0, 32.0); // Behind Frame 1/2 on Projects wall
        knotMesh1.scale.setScalar(2.0);
        bgObjectsGroup.add(knotMesh1);

        // Teacup uses knotMat1 (sage/pink hybrid)
        const knotMesh2 = createSurrealTeacup(knotMat1, isDark, geometriesToDispose, materialsToDispose);
        knotMesh2.position.set(15.0, 3.0, 8.0); // Behind Frame 2/3 on Projects wall
        knotMesh2.scale.setScalar(2.2);
        bgObjectsGroup.add(knotMesh2);

        // Mask uses lorenzMat (terracotta)
        const lorenzMesh = createSurrealDreamMask(lorenzMat, isDark, geometriesToDispose, materialsToDispose);
        lorenzMesh.position.set(-15.0, 2.0, -60.0); // Behind Newspaper Reader on Skills wall
        lorenzMesh.scale.setScalar(2.5);
        bgObjectsGroup.add(lorenzMesh);

        // 10. RECURSIVE FEEDBACK PLANE REMOVED

        // 11. Mouse move tracker for parallax pan
        const handleMouseMove = (event: MouseEvent) => {
            const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
            const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;
            mouseRef.current.set(ndcX, ndcY);
        };
        window.addEventListener('mousemove', handleMouseMove);

        // 12. Frame render loop
        const clock = new THREE.Clock();
        let lastTime = 0;
        let lastTextureUpdateTime = 0; // Throttle dynamic canvas redraw rate

        // Pre-allocated scratch vectors to avoid GC allocation inside tick
        const mouse3D = new THREE.Vector3();
        const dirStraight = new THREE.Vector3(0, 0, -1);
        const dirTarget = new THREE.Vector3();
        const rightWallLook = new THREE.Vector3();
        const dirRight = new THREE.Vector3();
        const leftWallLook = new THREE.Vector3();
        const dirLeft = new THREE.Vector3();
        const finalLook = new THREE.Vector3();
        const scratchVec2 = new THREE.Vector3();
        const scratchVec3 = new THREE.Vector3();
        const targetQuat = new THREE.Quaternion();
        const tempQuat = new THREE.Quaternion();

        const tick = () => {
            const time = clock.getElapsedTime();
            const deltaTime = time - lastTime;
            lastTime = time;

            const currentScroll = scrollPercentRef.current;
            
            // Smoothly interpolate scroll value
            lerpedScroll.current += (currentScroll - lerpedScroll.current) * 0.04;
            const ls = lerpedScroll.current;
            
            const startZ = 95;
            const endZ = -128;
            const cameraZ = startZ + ls * (endZ - startZ);

            const actualCameraZ = cameraRef.current ? cameraRef.current.position.z : cameraZ;
            const phase = transitionPhaseRef.current;

            // Compute turn amount for current scroll position to drive visibility and fading at the top
            let turnAmount = 0.0;
            if (phase === 'idle') {
                if (ls >= 0.18 && ls < 0.52) {
                    const p = (ls - 0.18) / (0.52 - 0.18);
                    let t = 0;
                    if (p < 0.235) {
                        t = THREE.MathUtils.smoothstep(p / 0.235, 0.0, 1.0);
                    } else if (p > 0.765) {
                        t = THREE.MathUtils.smoothstep((1.0 - p) / (1.0 - 0.765), 0.0, 1.0);
                    } else {
                        t = 1.0;
                    }
                    turnAmount = THREE.MathUtils.smoothstep(t, 0.0, 1.0);
                } else if (ls >= 0.58 && ls < 0.80) {
                    const p = (ls - 0.58) / (0.80 - 0.58);
                    let t = 0;
                    if (p < 0.273) {
                        t = THREE.MathUtils.smoothstep(p / 0.273, 0.0, 1.0);
                    } else if (p > 0.727) {
                        t = THREE.MathUtils.smoothstep((1.0 - p) / (1.0 - 0.727), 0.0, 1.0);
                    } else {
                        t = 1.0;
                    }
                    turnAmount = THREE.MathUtils.smoothstep(t, 0.0, 1.0);
                }
            }
            
            const fadeOpacity = Math.max(0.0, 1.0 - turnAmount * 1.05);
            const isVisible = fadeOpacity > 0.0;

            // Update melting wax shader uniforms for each arch and its outline if they are visible
            archesGroup.children.forEach((mesh, index) => {
                const zPos = archZCoords[index];
                // Hide the arch if the camera has passed it (actualCameraZ < zPos) or is extremely close to passing it to avoid clipping,
                // or if we have turned sideways (isVisible is false)
                const isArchVisible = (actualCameraZ > zPos + 1.5) && isVisible;
                mesh.visible = isArchVisible;
                
                if (isArchVisible) {
                    if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.ShaderMaterial) {
                        mesh.material.uniforms.uCameraZ.value = actualCameraZ;
                        mesh.material.uniforms.uTime.value = time;
                    }
                    mesh.children.forEach((child) => {
                        if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                            child.material.uniforms.uCameraZ.value = actualCameraZ;
                            child.material.uniforms.uTime.value = time;
                        }
                    });
                }
            });

            // Rotate floating rock islands (Hide rocks that are behind the camera)
            rockGroup.children.forEach((rock, idx) => {
                const pos = rockPositions[idx];
                // Hide the rock if the camera has passed it or if we have turned sideways (isVisible is false)
                const isRockVisible = (actualCameraZ > pos.z - 2.0) && isVisible;
                rock.visible = isRockVisible;

                if (isRockVisible) {
                    rock.rotation.y += 0.003 * (idx % 2 === 0 ? 1 : -1);
                    rock.position.y += Math.sin(time * 0.5 + idx) * 0.003;
                    const scaleSwell = 1.0 + Math.sin(time * 0.8 + idx) * 0.05;
                    rock.scale.setScalar(scaleSwell);
                }
            });

            // Alternating slow rotation over scroll & time for dynamic spiral tunnel (only for visible arches)
            archesGroup.children.forEach((mesh, index) => {
                if (mesh.visible) {
                    const rotDir = index % 2 === 0 ? 1 : -1;
                    mesh.rotation.z = rotDir * (Math.sin(time * 0.35 + index) * 0.08 + ls * 0.65);
                }
            });

            // Rotate procedural cogs
            if (cog1 && cog2 && cog3) {
                cog1.rotation.z += 0.012;
                cog2.rotation.z -= 0.008;
                cog3.rotation.z += 0.010;
            }

            // Chessboard floor update
            const chessFloor = scene.getObjectByName('chessFloor');
            if (chessFloor && chessFloor instanceof THREE.Mesh && chessFloor.material instanceof THREE.MeshPhongMaterial) {
                let skillsTurn = 0.0;
                if (phase === 'idle' && ls >= 0.58 && ls < 0.80) {
                    skillsTurn = turnAmount;
                }
                chessFloor.material.opacity = skillsTurn * 0.85;
                chessFloor.visible = (skillsTurn > 0.0);
            }

            // Giant Red Sun pulse update
            const sunMesh = scene.getObjectByName('giantRedSun');
            if (sunMesh) {
                const sunPulse = 1.0 + Math.sin(time * 0.8) * 0.03;
                sunMesh.scale.setScalar(sunPulse);
            }

            // Seele monolith doors swing & emissive pulse
            const seelePulse = 0.25 + Math.sin(shaderTimeRef.current * 5.0) * 0.18;
            seeleFaceMaterials.forEach(mat => {
                mat.emissiveIntensity = seelePulse;
            });

            seeleDoors.forEach((door, idx) => {
                const side = idx % 2 === 0 ? 1 : -1;
                const distZ = actualCameraZ - door.position.z;
                
                let targetAngle = 0;
                // Swing open as camera approaches from positive Z to negative Z
                if (distZ > -5 && distZ < 28) {
                    const t = 1.0 - Math.max(0, Math.min(1, distZ / 28));
                    targetAngle = t * Math.PI * 0.55; // Swing up to 100 degrees
                } else if (distZ <= -5 && distZ > -15) {
                    // Keep fully open for 10 units after passing, then close
                    const t = Math.max(0, Math.min(1, (distZ + 15) / 10));
                    targetAngle = t * Math.PI * 0.55;
                }
                
                const hinge = door.getObjectByName('hinge');
                if (hinge) {
                    hinge.rotation.y = THREE.MathUtils.lerp(hinge.rotation.y, side * targetAngle, 0.12);
                }
            });

            // Blend background color into blood red in deep Z (Contact section)
            let currentBgColor = isDark ? 0x0b0a14 : 0x121124;
            if (actualCameraZ < -50) {
                const factor = Math.min(1.0, (Math.abs(actualCameraZ) - 50) / 100);
                const baseColorObj = new THREE.Color(currentBgColor);
                const redColorObj = new THREE.Color(0x660000);
                baseColorObj.lerp(redColorObj, factor);
                scene.background = baseColorObj;
            } else {
                scene.background = new THREE.Color(currentBgColor);
            }

            // Redraw dynamic canvases at ~15 FPS to dramatically reduce GPU upload bandwidth
            const nowTime = performance.now();
            let shouldUpdateTextures = false;
            if (nowTime - lastTextureUpdateTime > 66) {
                lastTextureUpdateTime = nowTime;
                shouldUpdateTextures = true;
            }

            if (shouldUpdateTextures) {
                if (actualCameraZ > 30.0 && actualCameraZ < 95.0) {
                    drawBlogLoungeCanvas(blogCanvas, time);
                    blogTexture.needsUpdate = true;
                }

                if (actualCameraZ > 16.0 && actualCameraZ < 95.0) {
                    drawPicassoCanvas(picassoCanvas, time);
                    picassoTexture.needsUpdate = true;
                }

                if (actualCameraZ > -17.0 && actualCameraZ < 95.0) {
                    drawCatlenderCanvas(catCanvas, time);
                    catTexture.needsUpdate = true;
                }

                if (actualCameraZ > -75.0 && actualCameraZ < -45.0) {
                    drawNewspaperCanvas(newspaperCanvas, time);
                    newspaperTexture.needsUpdate = true;
                }
            }

            // Eyeball cursor tracking
            if (eyeball && cameraRef.current) {
                // Target in front of the wall, tracking cursor movements (using pre-allocated mouse3D vector)
                mouse3D.set(
                    8.0,
                    cameraRef.current.position.y + mouseRef.current.y * 3.5,
                    cameraRef.current.position.z + mouseRef.current.x * 4.5
                );
                eyeball.lookAt(mouse3D);
            }

            // Smooth Z flight scroll interpolation or cinematic transition
            if (cameraRef.current) {
                const config = getResponsiveConfig(cameraRef.current.aspect);
                const baseFov = config.fov;
                const shiftX = config.shiftX;

                if (phase !== 'idle') {
                    transitionTimeRef.current += deltaTime;
                    
                    if (phase === 'zoom_out_vortex') {
                        const duration = 1.2;
                        const t = Math.min(1.0, transitionTimeRef.current / duration);
                        const easedT = THREE.MathUtils.smootherstep(t, 0.0, 1.0);
                        
                        // Zoom out FOV (baseFov -> 85.0)
                        cameraRef.current.fov = baseFov + easedT * (85.0 - baseFov);
                        cameraRef.current.updateProjectionMatrix();
                        
                        // Pull camera position slightly back and up to capture the vortex opening
                        const targetPos = scratchVec2.set(0, 3.5, startCamPosRef.current.z + 6.0);
                        cameraRef.current.position.lerpVectors(startCamPosRef.current, targetPos, easedT);
                        
                        // Keep looking at vortex center
                        const corrLook = scratchVec3.set(0, 0, -200);
                        cameraRef.current.lookAt(corrLook);
                        
                        if (t >= 1.0) {
                            transitionPhaseRef.current = 'spin_vortex';
                            transitionTimeRef.current = 0;
                            startCamPosRef.current.copy(cameraRef.current.position);
                            startQuaternionRef.current.copy(cameraRef.current.quaternion);
                        }
                    } else if (phase === 'spin_vortex') {
                        const duration = 1.2;
                        const t = Math.min(1.0, transitionTimeRef.current / duration);
                        const easedT = THREE.MathUtils.smootherstep(t, 0.0, 1.0);
                        
                        cameraRef.current.fov = 85.0;
                        cameraRef.current.updateProjectionMatrix();
                        cameraRef.current.position.copy(startCamPosRef.current);
                        
                        // Target orientation is looking backward along the spline (facing +Z, towards corridor)
                        const lookTarget = scratchVec2.set(0, 0, 95);
                        
                        // Save current orientation
                        tempQuat.copy(cameraRef.current.quaternion);
                        
                        // Calculate target quaternion looking towards the start
                        cameraRef.current.lookAt(lookTarget);
                        targetQuat.copy(cameraRef.current.quaternion);
                        
                        // Restore and slerp
                        cameraRef.current.quaternion.copy(tempQuat);
                        cameraRef.current.quaternion.slerpQuaternions(startQuaternionRef.current, targetQuat, easedT);
                        
                        if (t >= 1.0) {
                            transitionPhaseRef.current = 'pause_vortex';
                            transitionTimeRef.current = 0;
                            startCamPosRef.current.copy(cameraRef.current.position);
                            startQuaternionRef.current.copy(cameraRef.current.quaternion);
                        }
                    } else if (phase === 'pause_vortex') {
                        const duration = 0.8;
                        const t = Math.min(1.0, transitionTimeRef.current / duration);
                        
                        cameraRef.current.fov = 85.0;
                        cameraRef.current.updateProjectionMatrix();
                        cameraRef.current.position.copy(startCamPosRef.current);
                        cameraRef.current.quaternion.copy(startQuaternionRef.current);
                        
                        if (t >= 1.0) {
                            transitionPhaseRef.current = 'plunge_vortex';
                            transitionTimeRef.current = 0;
                            startCamPosRef.current.copy(cameraRef.current.position);
                        }
                    } else if (phase === 'plunge_vortex') {
                        const duration = 1.5;
                        const t = Math.min(1.0, transitionTimeRef.current / duration);
                        const easedT = THREE.MathUtils.smootherstep(t, 0.0, 1.0);
                        
                        // Plunge in: zoom FOV down to 42 (tunnel vision)
                        cameraRef.current.fov = 85.0 - easedT * (85.0 - 42.0);
                        cameraRef.current.updateProjectionMatrix();
                        
                        // Plunge backwards into the exact spline end point (u = 1.0)
                        const endPoint = curve.getPointAt(1.0);
                        cameraRef.current.position.lerpVectors(startCamPosRef.current, endPoint, easedT);
                        
                        // Smoothly transition look-at target from the corridor front (0, 0, 95)
                        // to the spline look-ahead point curve.getPointAt(0.98) so it matches warp_travel orientation at u = 1.0
                        const initialLookTarget = scratchVec2.set(0, 0, 95);
                        const finalLookTarget = curve.getPointAt(0.98);
                        
                        finalLook.lerpVectors(initialLookTarget, finalLookTarget, easedT);
                        cameraRef.current.lookAt(finalLook);
                        
                        if (t >= 1.0) {
                            transitionPhaseRef.current = 'warp_travel';
                            transitionTimeRef.current = 0;
                        }
                    } else if (phase === 'warp_travel') {
                        const duration = 4.0;
                        const t = Math.min(1.0, transitionTimeRef.current / duration);
                        const easedT = THREE.MathUtils.smootherstep(t, 0.0, 1.0);
                        
                        // Follow curve backwards from u = 1.0 to u = 0.0
                        const u = 1.0 - easedT;
                        const curvePoint = curve.getPointAt(u);
                        cameraRef.current.position.copy(curvePoint);
                        
                        // Look ahead along the curve
                        const lookU = Math.max(0.0, u - 0.02);
                        const lookTarget = curve.getPointAt(lookU);
                        cameraRef.current.lookAt(lookTarget);
                        
                        // Apply continuous corkscrew camera roll (wormhole travel spin!)
                        cameraRef.current.rotation.z = easedT * Math.PI * 4;
                        
                        // Smoothly transition FOV from tunnel vision (42) to travel fov (baseFov)
                        cameraRef.current.fov = 42.0 + easedT * (baseFov - 42.0);
                        cameraRef.current.updateProjectionMatrix();
                        
                        if (t >= 1.0) {
                            transitionPhaseRef.current = 'spin_landing'; // Spin first inside the tube!
                            transitionTimeRef.current = 0;
                            startCamPosRef.current.copy(cameraRef.current.position);
                            startQuaternionRef.current.copy(cameraRef.current.quaternion);
                        }
                    } else if (phase === 'spin_landing') {
                        const duration = 1.5;
                        const t = Math.min(1.0, transitionTimeRef.current / duration);
                        const easedT = THREE.MathUtils.smootherstep(t, 0.0, 1.0);
                        
                        // Zoom out FOV (baseFov -> 80.0) inside the tube to get wide-angle perspective before exiting
                        cameraRef.current.fov = baseFov + easedT * (80.0 - baseFov);
                        cameraRef.current.updateProjectionMatrix();
                        cameraRef.current.position.copy(startCamPosRef.current);
                        
                        // Target orientation is looking down the corridor (facing -Z)
                        const lookTarget = scratchVec2.set(0, 0, -200);
                        
                        // Save current orientation
                        tempQuat.copy(cameraRef.current.quaternion);
                        
                        // Force lookAt to calculate the target orientation
                        cameraRef.current.lookAt(lookTarget);
                        targetQuat.copy(cameraRef.current.quaternion);
                        
                        // Restore and slerp
                        cameraRef.current.quaternion.copy(tempQuat);
                        cameraRef.current.quaternion.slerpQuaternions(startQuaternionRef.current, targetQuat, easedT);
                        cameraRef.current.rotation.z = 0;
                        
                        if (t >= 1.0) {
                            transitionPhaseRef.current = 'exit_emerge'; // Emerge next!
                            transitionTimeRef.current = 0;
                            startCamPosRef.current.copy(cameraRef.current.position);
                        }
                    } else if (phase === 'exit_emerge') {
                        const duration = 1.5;
                        const t = Math.min(1.0, transitionTimeRef.current / duration);
                        const easedT = THREE.MathUtils.smootherstep(t, 0.0, 1.0);
                        
                        // Return FOV to normal baseFov (zoom back in to settle landing)
                        cameraRef.current.fov = 80.0 - easedT * (80.0 - baseFov);
                        cameraRef.current.updateProjectionMatrix();
                        
                        // Transition out of the spline start point back to the landing view position (0, 0, 95)
                        const landingStartPos = scratchVec2.set(0, 0, 95);
                        cameraRef.current.position.lerpVectors(startCamPosRef.current, landingStartPos, easedT);
                        
                        // Look down the corridor towards -Z (corridor is fully visible as we emerge!)
                        const lookTarget = scratchVec3.set(0, 0, -200);
                        cameraRef.current.lookAt(lookTarget);
                        cameraRef.current.rotation.z = 0;
                        
                        if (t >= 1.0) {
                            transitionPhaseRef.current = 'idle';
                            transitionTimeRef.current = 0;
                            if (onReturnCompleteRef.current) {
                                onReturnCompleteRef.current();
                            }
                        }
                    }
                } else {
                    cameraRef.current.position.z = cameraZ;

                    // Base look-at direction is straight down the corridor
                    dirStraight.set(0, 0, -1);
                    dirTarget.copy(dirStraight);

                    if (ls >= 0.18 && ls < 0.52) {
                        // PROJECTS WALL TURN (Right turn: looks towards +X wall)
                        const t = turnAmount;

                        // Look Target on Right Wall: X = 15.0, Z tracks camera Z (using pre-allocated rightWallLook vector)
                        rightWallLook.set(15.0, cameraRef.current.position.y - 0.5, cameraZ);
                        dirRight.copy(rightWallLook).sub(cameraRef.current.position).normalize();
                        dirTarget.copy(dirStraight).lerp(dirRight, t).normalize();

                        // Offset camera X further left to see frames fully zoomed out (using responsive shiftX config)
                        const targetX = (mouseRef.current.x * 2.5) - (t * shiftX);
                        const targetY = (mouseRef.current.y * 1.8);
                        cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.035;
                        cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.035;

                    } else if (ls >= 0.58 && ls < 0.80) {
                        // SKILLS WALL TURN (Left turn: looks towards -X wall where Reader is at Z=-60)
                        const t = turnAmount;

                        // Look Target on Left Wall: X = -15.0, Z tracks camera Z (using pre-allocated leftWallLook vector)
                        leftWallLook.set(-15.0, -1.8, cameraZ);
                        dirLeft.copy(leftWallLook).sub(cameraRef.current.position).normalize();
                        dirTarget.copy(dirStraight).lerp(dirLeft, t).normalize();

                        // Offset camera X further right to see reader/attractor fully zoomed out (using responsive shiftX config)
                        const targetX = (mouseRef.current.x * 2.5) + (t * shiftX);
                        const targetY = (mouseRef.current.y * 1.8);
                        cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.035;
                        cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.035;

                    } else {
                        // Normal straight flight hover parallax drift
                        const targetX = mouseRef.current.x * 2.5;
                        const targetY = mouseRef.current.y * 1.8;
                        cameraRef.current.position.x += (targetX - cameraRef.current.position.x) * 0.04;
                        cameraRef.current.position.y += (targetY - cameraRef.current.position.y) * 0.04;
                    }

                    // Apply dynamic camera roll rotation along Z-axis
                    cameraRef.current.rotation.z = Math.sin(time * 0.4) * 0.04 + ls * 0.15;

                    // Look at the final calculated target direction vector from the camera position (using pre-allocated finalLook vector)
                    finalLook.copy(cameraRef.current.position).add(dirTarget.multiplyScalar(30.0));
                    cameraRef.current.lookAt(finalLook);
                }

                // Feed physics particle updates
                simulation.update(cameraRef.current.position, time);
            }

            // Toggle visibility of groups to optimize CPU/GPU frustum culling
            // These groups reside on the walls of the corridor and must remain visible when the camera turns sideways (isVisible fades)
            const isProjectsVisible = (actualCameraZ > -25.0 && actualCameraZ < 95.0) && (phase === 'idle' || phase === 'spin_landing' || phase === 'exit_emerge');
            projectFramesGroup.visible = isProjectsVisible;
            
            const isWallEyeVisible = (actualCameraZ > 0.0 && actualCameraZ < 80.0) && (phase === 'idle' || phase === 'spin_landing' || phase === 'exit_emerge');
            wallEyeGroup.visible = isWallEyeVisible;
            
            const isReaderVisible = (actualCameraZ > -85.0 && actualCameraZ < 10.0) && (phase === 'idle' || phase === 'spin_landing' || phase === 'exit_emerge');
            readerGroup.visible = isReaderVisible;

            cogsGroup.visible = isVisible;

            // Handle tube opacity & visibility during transition phases to prevent black blocking frames/clipping
            let tubeOpacity = fadeOpacity;
            let isTubeVisible = isVisible;

            if (phase !== 'idle') {
                if (phase === 'zoom_out_vortex') {
                    tubeOpacity = Math.min(1.0, transitionTimeRef.current / 1.2);
                    isTubeVisible = true;
                } else if (phase === 'pause_vortex' || phase === 'plunge_vortex' || phase === 'warp_travel') {
                    tubeOpacity = 1.0;
                    isTubeVisible = true;
                } else if (phase === 'spin_landing') {
                    tubeOpacity = Math.max(0.0, 1.0 - (transitionTimeRef.current / 1.5));
                    isTubeVisible = (tubeOpacity > 0.0);
                } else if (phase === 'exit_emerge') {
                    tubeOpacity = 0.0;
                    isTubeVisible = false;
                }
            }

            if (tubeMesh) tubeMesh.visible = isTubeVisible;
            if (tubeOutline) tubeOutline.visible = isTubeVisible;

            // Only apply opacity updates to elements that are active and visible in front of camera
            if (isVisible) {
                // 1. Visible Arches and their outlines
                archesGroup.children.forEach((mesh) => {
                    if (mesh.visible) {
                        if (mesh instanceof THREE.Mesh && mesh.material instanceof THREE.ShaderMaterial) {
                            mesh.material.uniforms.uOpacity.value = fadeOpacity;
                        }
                        mesh.children.forEach((child) => {
                            if (child instanceof THREE.Mesh && child.material instanceof THREE.ShaderMaterial) {
                                child.material.uniforms.uOpacity.value = fadeOpacity;
                            }
                        });
                    }
                });

                // 2. Visible Floating rock platforms
                rockGroup.children.forEach((rock) => {
                    if (rock.visible && rock instanceof THREE.Mesh) {
                        if (Array.isArray(rock.material)) {
                            rock.material.forEach(mat => { mat.opacity = fadeOpacity; });
                        } else if (rock.material) {
                            rock.material.opacity = fadeOpacity;
                        }
                    }
                    rock.children.forEach((child) => {
                        if (child instanceof THREE.Mesh && child.material) {
                            child.material.opacity = fadeOpacity;
                        }
                    });
                });

                // 3. Procedural cogs
                cogsGroup.children.forEach((cog) => {
                    if (cog instanceof THREE.Mesh) {
                        if (cog.material) cog.material.opacity = fadeOpacity;
                    }
                    cog.children.forEach((child) => {
                        if (child instanceof THREE.Mesh && child.material) {
                            child.material.opacity = fadeOpacity;
                        }
                    });
                });

                // 4. Iridescent spline tube
                if (isTubeVisible) {
                    if (iridescentMat) {
                        iridescentMat.uniforms.uOpacity.value = tubeOpacity;
                        iridescentMat.uniforms.uWarpMode.value = (phase !== 'idle') ? 1.0 : 0.0;
                    }
                    if (blackOutlineSideMat) {
                        blackOutlineSideMat.opacity = tubeOpacity;
                    }
                }
            }

            // Update shader uniforms using shaderTimeRef
            let currentSpeed = 1.0;
            if (transitionPhaseRef.current === 'warp_travel') {
                currentSpeed = 6.0; // Warp speed boost!
            }
            shaderTimeRef.current += deltaTime * currentSpeed;
            if (iridescentMat) iridescentMat.uniforms.uTime.value = shaderTimeRef.current;

            // Rotate and fade in background shapes during camera turns
            if (knotMesh1 && knotMesh2 && lorenzMesh) {
                knotMesh1.rotation.y += 0.008;
                knotMesh1.rotation.x += 0.004;
                knotMesh2.rotation.y -= 0.006;
                knotMesh2.rotation.z += 0.005;
                lorenzMesh.rotation.y += 0.010;
                lorenzMesh.rotation.x += 0.006;

                // Track opacities based on pre-calculated camera turn amount
                let projectsTurn = 0.0;
                if (ls >= 0.18 && ls < 0.52) {
                    projectsTurn = turnAmount;
                }

                let skillsTurn = 0.0;
                if (ls >= 0.58 && ls < 0.80) {
                    skillsTurn = turnAmount;
                }

                // Apply opacity & visibility updates recursively to entire groups
                const keyOpacity = projectsTurn * 0.72;
                const cupOpacity = projectsTurn * 0.72;
                const maskOpacity = skillsTurn * 0.75;

                updateGroupOpacity(knotMesh1, keyOpacity);
                updateGroupOpacity(knotMesh2, cupOpacity);
                updateGroupOpacity(lorenzMesh, maskOpacity);

                knotMesh1.visible = (projectsTurn > 0.0);
                knotMesh2.visible = (projectsTurn > 0.0);
                lorenzMesh.visible = (skillsTurn > 0.0);
            }

            // Check state changes and notify parent component
            let activeSection: 'hero' | 'projects' | 'skills' | 'transmission' | 'knot' = 'hero';
            let activeProjectIndex = -1;

            if (ls < 0.18) {
                activeSection = 'hero';
            } else if (ls < 0.52) {
                activeSection = 'projects';
                if (ls >= 0.18 && ls < 0.30) {
                    activeProjectIndex = 0;
                } else if (ls >= 0.30 && ls < 0.42) {
                    activeProjectIndex = 1;
                } else if (ls >= 0.42 && ls < 0.52) {
                    activeProjectIndex = 2;
                }
            } else if (ls < 0.80) {
                activeSection = 'skills';
            } else {
                // Keep transmission (Contact & Networking) active all the way to 100% (ls = 1.0)
                activeSection = 'transmission';
            }

            if (onScrollStateChangeRef.current) {
                const last = lastEmittedStateRef.current;
                if (!last || last.activeSection !== activeSection || last.activeProjectIndex !== activeProjectIndex || Math.abs(last.lerpedPercent - ls) > 0.002) {
                    const newState = { activeSection, activeProjectIndex, lerpedPercent: ls };
                    lastEmittedStateRef.current = newState;
                    onScrollStateChangeRef.current(newState);
                }
            }

            // Render scene directly (no FBO feedback loop needed)
            if (rendererRef.current && sceneRef.current && cameraRef.current) {
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
            camera.fov = getResponsiveConfig(camera.aspect).fov;
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
            dedicatedMaterialsRef.current = null;
            bgMaterialsRef.current = null;

            // Dispose canvas textures
            if (blogTexture) blogTexture.dispose();
            if (picassoTexture) picassoTexture.dispose();
            if (catTexture) catTexture.dispose();
            if (newspaperTexture) newspaperTexture.dispose();
            if (chessTex) chessTex.dispose();
            if (faceTex) faceTex.dispose();

            // FBOs removed
            renderer.dispose();

            // Clear scene and simulation references to prevent memory leaks
            scene.clear();
            simulation.particles = [];
        };
    }, []);

    // 13. Dynamic Theme updates without scene reconstruction
    useEffect(() => {
        if (!sceneRef.current) return;
        const isDark = theme === 'dark';
        const outlineHex = isDark ? 0x0b0a14 : 0x121124;
        sceneRef.current.background = new THREE.Color(outlineHex);
        
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

        if (dedicatedMaterialsRef.current) {
            dedicatedMaterialsRef.current.frameBorder.color.setHex(isDark ? 0xa482ff : 0x8c6ec9);
            dedicatedMaterialsRef.current.frameOutline.color.setHex(outlineHex);
            dedicatedMaterialsRef.current.readerTorso.color.setHex(isDark ? 0x1ee3bd : 0x207a6e);
            dedicatedMaterialsRef.current.readerFace.color.setHex(isDark ? 0xffc844 : 0xe3ac34);
            dedicatedMaterialsRef.current.readerArms.color.setHex(isDark ? 0xf82a72 : 0xd63c76);
            dedicatedMaterialsRef.current.readerOutline.color.setHex(outlineHex);
            dedicatedMaterialsRef.current.eyeSocket.color.setHex(isDark ? 0xf82a72 : 0xd63c76);
            dedicatedMaterialsRef.current.eyeSocketOutline.color.setHex(outlineHex);
        }

        if (bgMaterialsRef.current) {
            bgMaterialsRef.current.knot1.color.setHex(isDark ? 0x1ee3bd : 0x207a6e);
            bgMaterialsRef.current.knot2.color.setHex(isDark ? 0xffc844 : 0xe3ac34);
            bgMaterialsRef.current.lorenz.color.setHex(isDark ? 0xf82a72 : 0xd63c76);
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

        // Update spline outline color dynamically
        const tubeOutline = sceneRef.current.getObjectByName('tubeOutline');
        if (tubeOutline && tubeOutline instanceof THREE.Mesh && tubeOutline.material instanceof THREE.MeshBasicMaterial) {
            tubeOutline.material.color.setHex(outlineHex);
        }
    }, [theme]);

    return (
        <div 
            ref={mountRef} 
            className="webgl-canvas-container"
        />
    );
};
