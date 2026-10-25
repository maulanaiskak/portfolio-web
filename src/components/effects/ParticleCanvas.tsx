/* eslint-disable react-hooks/purity, react-hooks/immutability -- React Three Fiber idiom: geometry buffers are seeded once (useMemo) and mutated in place every frame inside useFrame. */
'use client';

import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const PARTICLE_COUNT = 120;
const CONNECTION_DISTANCE = 2.5;
const FLEE_RADIUS = 3;
const FLEE_STRENGTH = 0.04;
const DAMPING = 0.88;
const SPRING = 0.015;

function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const { size, camera } = useThree();

  const { originPositions, currentPositions, velocities } = useMemo(() => {
    const origin = new Float32Array(PARTICLE_COUNT * 3);
    const current = new Float32Array(PARTICLE_COUNT * 3);
    const vel = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 20;
      const y = (Math.random() - 0.5) * 14;
      const z = (Math.random() - 0.5) * 8;
      origin[i * 3] = x; origin[i * 3 + 1] = y; origin[i * 3 + 2] = z;
      current[i * 3] = x; current[i * 3 + 1] = y; current[i * 3 + 2] = z;
    }
    return { originPositions: origin, currentPositions: current, velocities: vel };
  }, []);

  const mouseWorld = useRef(new THREE.Vector3(9999, 9999, 0));

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const x = (e.clientX / size.width) * 2 - 1;
      const y = -(e.clientY / size.height) * 2 + 1;
      const vec = new THREE.Vector3(x, y, 0.5);
      vec.unproject(camera as THREE.Camera);
      const dir = vec.sub((camera as THREE.Camera).position).normalize();
      const dist = -((camera as THREE.Camera).position.z) / dir.z;
      mouseWorld.current.copy((camera as THREE.Camera).position).addScaledVector(dir, dist);
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [size, camera]);

  // Line buffer — large enough for worst-case connections
  const lineBuffer = useMemo(() => new Float32Array(PARTICLE_COUNT * PARTICLE_COUNT * 6), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.04;
    const mx = mouseWorld.current.x;
    const my = mouseWorld.current.y;

    // Update velocities and positions
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const xi = currentPositions[i * 3];
      const yi = currentPositions[i * 3 + 1];
      const zi = currentPositions[i * 3 + 2];

      // Spring back to origin
      velocities[i * 3]     += (originPositions[i * 3]     - xi) * SPRING;
      velocities[i * 3 + 1] += (originPositions[i * 3 + 1] - yi) * SPRING;
      velocities[i * 3 + 2] += (originPositions[i * 3 + 2] - zi) * SPRING;

      // Flee from mouse
      const dx = xi - mx;
      const dy = yi - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < FLEE_RADIUS && dist > 0.01) {
        const force = (FLEE_RADIUS - dist) / FLEE_RADIUS * FLEE_STRENGTH;
        velocities[i * 3]     += (dx / dist) * force;
        velocities[i * 3 + 1] += (dy / dist) * force;
      }

      // Dampen
      velocities[i * 3]     *= DAMPING;
      velocities[i * 3 + 1] *= DAMPING;
      velocities[i * 3 + 2] *= DAMPING;

      // Integrate
      currentPositions[i * 3]     += velocities[i * 3];
      currentPositions[i * 3 + 1] += velocities[i * 3 + 1];
      currentPositions[i * 3 + 2] += velocities[i * 3 + 2];
    }

    // Update point positions
    if (pointsRef.current) {
      const attr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      (attr.array as Float32Array).set(currentPositions);
      attr.needsUpdate = true;
      pointsRef.current.rotation.y = t;
      pointsRef.current.rotation.x = t * 0.3;
    }

    // Rebuild line segments dynamically
    if (linesRef.current) {
      let lineCount = 0;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        for (let j = i + 1; j < PARTICLE_COUNT; j++) {
          const dx = currentPositions[i * 3] - currentPositions[j * 3];
          const dy = currentPositions[i * 3 + 1] - currentPositions[j * 3 + 1];
          const dz = currentPositions[i * 3 + 2] - currentPositions[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < CONNECTION_DISTANCE * CONNECTION_DISTANCE) {
            lineBuffer[lineCount * 6]     = currentPositions[i * 3];
            lineBuffer[lineCount * 6 + 1] = currentPositions[i * 3 + 1];
            lineBuffer[lineCount * 6 + 2] = currentPositions[i * 3 + 2];
            lineBuffer[lineCount * 6 + 3] = currentPositions[j * 3];
            lineBuffer[lineCount * 6 + 4] = currentPositions[j * 3 + 1];
            lineBuffer[lineCount * 6 + 5] = currentPositions[j * 3 + 2];
            lineCount++;
          }
        }
      }
      const lineAttr = linesRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
      lineAttr.array.set(lineBuffer.subarray(0, lineCount * 6));
      (lineAttr as unknown as { count: number }).count = lineCount * 2;
      lineAttr.needsUpdate = true;
      linesRef.current.rotation.y = t;
      linesRef.current.rotation.x = t * 0.3;
    }
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[currentPositions.slice(), 3]} />
        </bufferGeometry>
        <pointsMaterial color="#00d4ff" size={0.06} transparent opacity={0.8} sizeAttenuation />
      </points>
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[lineBuffer, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#00d4ff" transparent opacity={0.15} />
      </lineSegments>
    </>
  );
}

export default function ParticleCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 60 }}
      style={{ background: 'transparent' }}
      gl={{ antialias: true, alpha: true }}
    >
      <Particles />
    </Canvas>
  );
}
