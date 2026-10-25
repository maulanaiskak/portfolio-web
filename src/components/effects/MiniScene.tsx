/* eslint-disable react-hooks/purity, react-hooks/immutability -- React Three Fiber idiom: geometry buffers are seeded once (useMemo) and mutated in place every frame inside useFrame. */
'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ── ThesisSignal — control-valve stiction detection via random forest on MQTT stream
// Waveform signal with sliding window + periodic anomaly detection flash
function ThesisSignalScene({ color }: { color: string }) {
  const POINTS = 80;
  const waveRef = useRef<THREE.BufferAttribute>(null);
  const windowRef = useRef<THREE.Mesh>(null);
  const anomalyRef = useRef<THREE.Mesh>(null);
  

  const positions = useMemo(() => new Float32Array(POINTS * 3), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const arr = positions;

    // Generate control-loop signal: base sine + noise + occasional stiction spike
    for (let i = 0; i < POINTS; i++) {
      const x = (i / (POINTS - 1)) * 5 - 2.5;
      const phase = i / POINTS;
      // Normal control-loop oscillation
      let y = Math.sin(phase * Math.PI * 4 + t * 1.2) * 0.3
            + Math.sin(phase * Math.PI * 9 + t * 0.7) * 0.12;
      // Stiction anomaly: flat dead-zone followed by snap
      const anomalyPhase = ((t * 0.4) % 1);
      
      const inAnomaly = Math.abs(phase - anomalyPhase) < 0.12;
      if (inAnomaly) {
        const local = (phase - anomalyPhase) / 0.12;
        if (local < 0.7) y = y * 0.1; // flat (stuck valve)
        else y += Math.sin(local * Math.PI) * 0.7; // snap release
      }
      arr[i * 3]     = x;
      arr[i * 3 + 1] = y;
      arr[i * 3 + 2] = 0;
    }
    if (waveRef.current) waveRef.current.needsUpdate = true;

    // Sliding detection window moves left→right
    const winX = ((t * 0.5) % 1) * 5 - 2.5;
    if (windowRef.current) {
      windowRef.current.position.x = winX;
    }

    // Anomaly detection glow: pulses bright when snap is near the window
    const anomalyX = (((t * 0.4) % 1) + 0.65 * 0.12) * 5 - 2.5;
    const dist = Math.abs(winX - anomalyX);
    const detected = dist < 0.6;
    if (anomalyRef.current) {
      anomalyRef.current.position.x = anomalyX;
      const mat = anomalyRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = detected ? 3 + Math.sin(t * 10) * 1.5 : 0.3;
      mat.color.set(detected ? '#ff4444' : color);
      mat.emissive.set(detected ? '#ff4444' : color);
    }
    // update window box opacity via windowRef material
    if (windowRef.current) {
      const mat = windowRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = detected ? 0.14 + Math.sin(t * 8) * 0.06 : 0.04;
    }
  });

  return (
    <>
      {/* Signal waveform */}
      <line>
        <bufferGeometry>
          <bufferAttribute ref={waveRef} attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.9} />
      </line>

      {/* Sliding window box */}
      <mesh ref={windowRef}>
        <boxGeometry args={[0.7, 1.4, 0.01]} />
        <meshStandardMaterial color={color} transparent opacity={0.06} />
      </mesh>

      {/* Anomaly detection dot */}
      <mesh ref={anomalyRef} position={[0, 0, 0.05]}>
        <circleGeometry args={[0.06, 12]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.9} />
      </mesh>
    </>
  );
}

export type SceneVariant =
  | 'torusknot'
  | 'wireSphere'
  | 'octahedron'
  | 'bars'
  | 'twinBoxes'
  | 'icosahedron'
  | 'organicParticles'
  | 'torus'
  | 'nodeGraph'
  | 'multiChain'
  | 'dataPipeline'
  | 'alertNetwork'
  | 'neuralCloud'
  | 'thesisSignal';

// ── TorusKnot — Web3 / blockchain complexity
function TorusKnotScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const scale = useRef(1);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    ref.current.scale.setScalar(scale.current);
    ref.current.rotation.x += dt * (isHovered ? 0.7 : 0.35);
    ref.current.rotation.y += dt * (isHovered ? 1.1 : 0.55);
  });
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.7, 0.22, 100, 16, 2, 3]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

// ── WireSphere + points — KYC / biometric data
function WireSphereScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const scale = useRef(1);
  const pts = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 80; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      arr.push(
        Math.sin(phi) * Math.cos(theta),
        Math.sin(phi) * Math.sin(theta),
        Math.cos(phi)
      );
    }
    return new Float32Array(arr);
  }, []);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    groupRef.current.scale.setScalar(scale.current);
    groupRef.current.rotation.y += dt * (isHovered ? 0.8 : 0.4);
    groupRef.current.rotation.x += dt * 0.15;
  });

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[0.85, 16, 12]} />
        <meshStandardMaterial color={color} wireframe opacity={0.25} transparent />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pts, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.06} sizeAttenuation />
      </points>
    </group>
  );
}

// ── Octahedron — auth / security gem
function OctahedronScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const solidRef = useRef<THREE.Mesh>(null);
  const wireRef = useRef<THREE.Mesh>(null);
  const scale = useRef(1);
  useFrame((state, dt) => {
    const s = solidRef.current;
    const w = wireRef.current;
    if (!s || !w) return;
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    s.rotation.y += dt * (isHovered ? 1.2 : 0.6);
    s.rotation.x += dt * 0.3;
    w.rotation.y = s.rotation.y;
    w.rotation.x = s.rotation.x;
    const pulse = scale.current * (1 + Math.sin(state.clock.elapsedTime * 2) * 0.06);
    s.scale.setScalar(pulse);
    w.scale.setScalar(pulse * 1.05);
  });
  return (
    <>
      <mesh ref={solidRef}>
        <octahedronGeometry args={[0.75]} />
        <meshStandardMaterial color={color} transparent opacity={0.35} />
      </mesh>
      <mesh ref={wireRef}>
        <octahedronGeometry args={[0.75]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
    </>
  );
}

// ── Bars — analytics / tiering
function BarsScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const heights = [0.9, 1.4, 0.6, 1.1, 0.8];
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const groupRef = useRef<THREE.Group>(null);
  const scale = useRef(1);
  useFrame((state, dt) => {
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    if (groupRef.current) groupRef.current.scale.setScalar(scale.current);
    refs.current.forEach((m, i) => {
      if (!m) return;
      const t = state.clock.elapsedTime;
      m.scale.y = 1 + Math.sin(t * 1.2 + i * 0.8) * 0.12;
    });
  });
  return (
    <group ref={groupRef} position={[0, -0.3, 0]}>
      {heights.map((h, i) => (
        <mesh
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          position={[(i - 2) * 0.42, h / 2, 0]}
        >
          <cylinderGeometry args={[0.12, 0.12, h, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

// ── TwinBoxes — migration (two systems)
function TwinBoxesScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const leftRef = useRef<THREE.Mesh>(null);
  const rightRef = useRef<THREE.Mesh>(null);
  const ptsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);
  const scale = useRef(1);

  const pts = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 40; i++) {
      arr.push(
        (Math.random() - 0.5) * 1.2,
        (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 0.3
      );
    }
    return new Float32Array(arr);
  }, []);

  useFrame((_, dt) => {
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    if (groupRef.current) groupRef.current.scale.setScalar(scale.current);
    if (leftRef.current) leftRef.current.rotation.y += dt * 0.5;
    if (rightRef.current) rightRef.current.rotation.y -= dt * 0.5;
    if (ptsRef.current) ptsRef.current.rotation.y += dt * 0.2;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={leftRef} position={[-0.7, 0, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={color} wireframe />
      </mesh>
      <mesh ref={rightRef} position={[0.7, 0, 0]}>
        <boxGeometry args={[0.7, 0.7, 0.7]} />
        <meshStandardMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <points ref={ptsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pts, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.05} sizeAttenuation />
      </points>
    </group>
  );
}

// ── Icosahedron — incident / alerting
function IcosahedronScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const scale = useRef(1);
  useFrame((state, dt) => {
    if (!ref.current) return;
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    ref.current.rotation.x += dt * 0.5;
    ref.current.rotation.z += dt * 0.3;
    const pulse = scale.current * (1 + Math.sin(state.clock.elapsedTime * 3) * 0.08);
    ref.current.scale.setScalar(pulse);
  });
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.85, 0]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

// ── OrganicParticles — nature / Angkat Tani
function OrganicParticlesScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const ref = useRef<THREE.Points>(null);
  const scale = useRef(1);
  const pts = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 120; i++) {
      arr.push(
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 1.2
      );
    }
    return new Float32Array(arr);
  }, []);

  useFrame((state, dt) => {
    if (!ref.current) return;
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    ref.current.scale.setScalar(scale.current);
    ref.current.rotation.y = state.clock.elapsedTime * 0.18;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[pts, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={0.07} sizeAttenuation transparent opacity={0.9} />
    </points>
  );
}

// ── Torus — simple ring, experience accent
function TorusScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const ref = useRef<THREE.Mesh>(null);
  const scale = useRef(1);
  useFrame((_, dt) => {
    if (!ref.current) return;
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    ref.current.scale.setScalar(scale.current);
    ref.current.rotation.x += dt * 0.5;
    ref.current.rotation.y += dt * 0.3;
  });
  return (
    <mesh ref={ref}>
      <torusGeometry args={[0.65, 0.22, 16, 40]} />
      <meshStandardMaterial color={color} wireframe />
    </mesh>
  );
}

// ── NodeGraph — network / TechConnect
function NodeGraphScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const scale = useRef(1);
  const { nodePos, linePos } = useMemo(() => {
    const nodes = Array.from({ length: 8 }, () => new THREE.Vector3(
      (Math.random() - 0.5) * 2.2,
      (Math.random() - 0.5) * 1.6,
      (Math.random() - 0.5) * 0.6
    ));
    const lines: number[] = [];
    nodes.forEach((a, i) => {
      nodes.forEach((b, j) => {
        if (j <= i) return;
        if (a.distanceTo(b) < 1.4) {
          lines.push(a.x, a.y, a.z, b.x, b.y, b.z);
        }
      });
    });
    const nodePts = new Float32Array(nodes.flatMap((n) => [n.x, n.y, n.z]));
    return { nodePos: nodePts, linePos: new Float32Array(lines) };
  }, []);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    groupRef.current.scale.setScalar(scale.current);
    groupRef.current.rotation.y += dt * 0.3;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePos, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.12} sizeAttenuation />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </lineSegments>
    </group>
  );
}

// ── MultiChain — nested torus rings + orbiting planet spheres
function MultiChainScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const planetRefs = useRef<(THREE.Mesh | null)[]>([]);
  const anglesRef = useRef<Float32Array>(new Float32Array(8).fill(0));
  const scale = useRef(1);

  const rings = [
    { rx: 0,    ry: 0,   rz: 0,   speed: 1.2,  r: 1.0,  tube: 0.05, planetSpeed: 0.8  },
    { rx: 1.2,  ry: 0.4, rz: 0,   speed: -1.0, r: 0.75, tube: 0.05, planetSpeed: -1.1 },
    { rx: 0.5,  ry: 1.0, rz: 0.8, speed: 1.5,  r: 0.52, tube: 0.04, planetSpeed: 1.4  },
    { rx: -0.8, ry: 0.2, rz: 1.2, speed: -1.3, r: 0.3,  tube: 0.035, planetSpeed: -1.8 },
  ];

  useFrame((state, dt) => {
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    if (groupRef.current) {
      groupRef.current.rotation.y += dt * 0.5;
      groupRef.current.scale.setScalar(scale.current);
    }
    ringRefs.current.forEach((m, i) => {
      if (!m) return;
      m.rotation.z += dt * rings[i].speed;
      const s = 1 + Math.sin(state.clock.elapsedTime * 1.5 + i * 1.2) * 0.06;
      m.scale.setScalar(s);
    });

    // Update planet positions
    rings.forEach((ring, ri) => {
      for (let pi = 0; pi < 2; pi++) {
        const idx = ri * 2 + pi;
        anglesRef.current[idx] += dt * ring.planetSpeed;
        const angle = anglesRef.current[idx] + pi * Math.PI;
        const pm = planetRefs.current[idx];
        if (!pm) return;
        pm.position.set(
          Math.cos(angle) * ring.r,
          Math.sin(angle) * ring.r,
          0
        );
        // rotate the planet position by ring rotation
        pm.position.applyEuler(new THREE.Euler(ring.rx, ring.ry, ring.rz));
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Glowing core */}
      <mesh>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      {rings.map((ring, i) => (
        <mesh key={i} ref={(el) => { ringRefs.current[i] = el; }} rotation={[ring.rx, ring.ry, ring.rz]}>
          <torusGeometry args={[ring.r, ring.tube, 16, 60]} />
          <meshStandardMaterial color={color} transparent opacity={0.85 - i * 0.1} emissive={color} emissiveIntensity={0.4} />
        </mesh>
      ))}
      {/* Planet spheres — 2 per ring */}
      {rings.map((ring, ri) =>
        [0, 1].map((pi) => (
          <mesh key={`p-${ri}-${pi}`} ref={(el) => { planetRefs.current[ri * 2 + pi] = el; }}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
          </mesh>
        ))
      )}
    </group>
  );
}

// ── DataPipeline — particles spiraling inward on a helix/vortex
function DataPipelineScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const COUNT = 100;
  const posRef = useRef<THREE.BufferAttribute>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const scale = useRef(1);

  const { positions, radii, angles, heights, speeds } = useMemo(() => {
    const pos = new Float32Array(COUNT * 3);
    const r = new Float32Array(COUNT);
    const a = new Float32Array(COUNT);
    const h = new Float32Array(COUNT);
    const spd = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const initR = 1.4 + Math.random() * 0.8;
      const initA = Math.random() * Math.PI * 2;
      const initH = (Math.random() - 0.5) * 1.5;
      r[i] = initR;
      a[i] = initA;
      h[i] = initH;
      spd[i] = 0.008 + Math.random() * 0.012;
      pos[i * 3]     = Math.cos(initA) * initR;
      pos[i * 3 + 1] = initH;
      pos[i * 3 + 2] = Math.sin(initA) * initR;
    }
    return { positions: pos, radii: r, angles: a, heights: h, speeds: spd };
  }, []);

  useFrame((state, dt) => {
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    if (groupRef.current) groupRef.current.scale.setScalar(scale.current);

    const attr = posRef.current;
    if (!attr) return;
    const arr = attr.array as Float32Array;

    for (let i = 0; i < COUNT; i++) {
      radii[i] -= speeds[i];
      angles[i] += speeds[i] * 2.5; // spiral rotation
      heights[i] *= 0.995;          // converge height to 0

      if (radii[i] < 0.1) {
        radii[i] = 1.4 + Math.random() * 0.8;
        angles[i] = Math.random() * Math.PI * 2;
        heights[i] = (Math.random() - 0.5) * 1.5;
      }
      arr[i * 3]     = Math.cos(angles[i]) * radii[i];
      arr[i * 3 + 1] = heights[i];
      arr[i * 3 + 2] = Math.sin(angles[i]) * radii[i];
    }
    attr.needsUpdate = true;

    if (coreRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 4) * 0.15;
      coreRef.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={3} />
      </mesh>
      <points>
        <bufferGeometry>
          <bufferAttribute ref={posRef} attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial color={color} size={0.09} sizeAttenuation transparent opacity={0.9} />
      </points>
    </group>
  );
}

// ── AlertNetwork — pulsing nodes + shockwave rings
function AlertNetworkScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const ringMats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const ringState = useRef<{ lastEmit: number; activeRing: number; timers: number[] }>({
    lastEmit: 0,
    activeRing: 0,
    timers: [-999, -999, -999],
  });
  const scale = useRef(1);

  const { nodes, linePos } = useMemo(() => {
    const pts = [
      new THREE.Vector3(0,     0,    0),
      new THREE.Vector3(-0.85, 0.65, 0.1),
      new THREE.Vector3( 0.85, 0.65,-0.1),
      new THREE.Vector3(-0.7, -0.8,  0.2),
      new THREE.Vector3( 0.7, -0.8, -0.2),
      new THREE.Vector3( 0,    1.0,  0),
      new THREE.Vector3(-0.95,-0.1,  0.3),
      new THREE.Vector3( 0.95,-0.1, -0.3),
    ];
    const edges = [[0,1],[0,2],[0,3],[0,4],[0,6],[0,7],[1,5],[2,5],[1,3],[2,4],[6,3],[7,4]];
    const lines: number[] = [];
    edges.forEach(([a, b]) => {
      lines.push(pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z);
    });
    return { nodes: pts, linePos: new Float32Array(lines) };
  }, []);

  useFrame((state, dt) => {
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale.current);
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.6;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.25) * 0.2;
    }

    const t = state.clock.elapsedTime;
    nodeRefs.current.forEach((m, i) => {
      if (!m) return;
      const dist = i === 0 ? 0 : 1;
      const phase = t * 3.5 - dist * 1.8 + i * 0.5;
      const pulse = 1 + Math.sin(phase) * (i === 0 ? 0.4 : 0.3);
      m.scale.setScalar(pulse);
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
        i === 0 ? 2 + Math.sin(phase) * 1.5 : 0.8 + Math.sin(phase) * 0.6;
    });

    // Shockwave rings
    const rs = ringState.current;
    if (t - rs.lastEmit > 2) {
      rs.lastEmit = t;
      const idx = rs.activeRing % 3;
      rs.timers[idx] = t;
      rs.activeRing++;
    }
    for (let ri = 0; ri < 3; ri++) {
      const rm = ringRefs.current[ri];
      const mat = ringMats.current[ri];
      if (!rm || !mat) continue;
      const age = t - rs.timers[ri];
      if (age >= 0 && age < 1) {
        rm.visible = true;
        rm.scale.setScalar(age * 3);
        mat.opacity = 1 - age;
      } else {
        rm.visible = false;
      }
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.4} />
      </lineSegments>
      {nodes.map((pos, i) => (
        <mesh key={i} ref={(el) => { nodeRefs.current[i] = el; }} position={pos}>
          <sphereGeometry args={[i === 0 ? 0.18 : 0.1, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={i === 0 ? 2 : 0.8} />
        </mesh>
      ))}
      {/* Shockwave rings — pool of 3 */}
      {[0, 1, 2].map((ri) => (
        <mesh key={`shock-${ri}`} ref={(el) => { ringRefs.current[ri] = el; }} visible={false}>
          <torusGeometry args={[0.3, 0.01, 8, 40]} />
          <meshBasicMaterial
            ref={(el) => { ringMats.current[ri] = el; }}
            color={color}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── NeuralCloud — layered neural network + traveling signal dot
function NeuralCloudScene({ color, isHovered }: { color: string; isHovered: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const nodeRefs = useRef<(THREE.Mesh | null)[]>([]);
  const signalRef = useRef<THREE.Mesh>(null);
  const scale = useRef(1);

  const { allNodes, layerGroups, linePos, edges } = useMemo(() => {
    const layers = [3, 5, 5, 4, 3];
    const spacing = 0.5;
    const layerX = [-1.1, -0.55, 0, 0.55, 1.1];
    const nodes: THREE.Vector3[] = [];
    const groups: THREE.Vector3[][] = [];

    layers.forEach((count, li) => {
      const group: THREE.Vector3[] = [];
      for (let i = 0; i < count; i++) {
        const y = (i - (count - 1) / 2) * spacing;
        const z = (Math.random() - 0.5) * 0.25;
        const v = new THREE.Vector3(layerX[li], y, z);
        group.push(v);
        nodes.push(v);
      }
      groups.push(group);
    });

    const lines: number[] = [];
    const edgeList: [THREE.Vector3, THREE.Vector3][] = [];
    for (let l = 0; l < groups.length - 1; l++) {
      groups[l].forEach((a) => {
        groups[l + 1].forEach((b) => {
          lines.push(a.x, a.y, a.z, b.x, b.y, b.z);
          edgeList.push([a, b]);
        });
      });
    }

    return { allNodes: nodes, layerGroups: groups, linePos: new Float32Array(lines), edges: edgeList };
  }, []);

  const signalState = useRef({ edgeIdx: 0, t: 0, speed: 2.5 });

  useFrame((state, dt) => {
    const targetScale = isHovered ? 1.3 : 1;
    scale.current += (targetScale - scale.current) * Math.min(dt * 6, 1);
    if (groupRef.current) {
      groupRef.current.scale.setScalar(scale.current);
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.6;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.15;
    }

    const et = state.clock.elapsedTime;
    let nodeIdx = 0;
    layerGroups.forEach((group, li) => {
      group.forEach((_, ni) => {
        const m = nodeRefs.current[nodeIdx++];
        if (!m) return;
        const phase = et * 2.5 - li * 0.7 + ni * 0.3;
        const pulse = 1 + Math.sin(phase) * 0.35;
        m.scale.setScalar(pulse);
        (m.material as THREE.MeshStandardMaterial).emissiveIntensity =
          0.6 + Math.sin(phase) * 0.8;
      });
    });

    // Traveling signal dot
    const ss = signalState.current;
    ss.t += dt * ss.speed;
    if (ss.t >= 1) {
      ss.t = 0;
      ss.edgeIdx = (ss.edgeIdx + 1) % edges.length;
    }
    if (signalRef.current && edges.length > 0) {
      const [a, b] = edges[ss.edgeIdx];
      signalRef.current.position.lerpVectors(a, b, ss.t);
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.2} />
      </lineSegments>
      {allNodes.map((pos, i) => (
        <mesh key={i} ref={(el) => { nodeRefs.current[i] = el; }} position={pos}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
        </mesh>
      ))}
      {/* Signal traveling dot */}
      <mesh ref={signalRef}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={4} />
      </mesh>
    </group>
  );
}

const SCENE_MAP: Record<SceneVariant, (color: string, isHovered: boolean) => React.ReactNode> = {
  torusknot:       (c, h) => <TorusKnotScene color={c} isHovered={h} />,
  wireSphere:      (c, h) => <WireSphereScene color={c} isHovered={h} />,
  octahedron:      (c, h) => <OctahedronScene color={c} isHovered={h} />,
  bars:            (c, h) => <BarsScene color={c} isHovered={h} />,
  twinBoxes:       (c, h) => <TwinBoxesScene color={c} isHovered={h} />,
  icosahedron:     (c, h) => <IcosahedronScene color={c} isHovered={h} />,
  organicParticles:(c, h) => <OrganicParticlesScene color={c} isHovered={h} />,
  torus:           (c, h) => <TorusScene color={c} isHovered={h} />,
  nodeGraph:       (c, h) => <NodeGraphScene color={c} isHovered={h} />,
  multiChain:      (c, h) => <MultiChainScene color={c} isHovered={h} />,
  dataPipeline:    (c, h) => <DataPipelineScene color={c} isHovered={h} />,
  alertNetwork:    (c, h) => <AlertNetworkScene color={c} isHovered={h} />,
  neuralCloud:     (c, h) => <NeuralCloudScene color={c} isHovered={h} />,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  thesisSignal:   (c, _h) => <ThesisSignalScene color={c} />,
};

interface MiniSceneProps {
  variant: SceneVariant;
  color?: string;
  className?: string;
  isHovered?: boolean;
}

const EXP_VARIANTS: SceneVariant[] = ['multiChain', 'dataPipeline', 'alertNetwork', 'neuralCloud'];

export default function MiniScene({ variant, color = '#00d4ff', className, isHovered = false }: MiniSceneProps) {
  const isExpScene = EXP_VARIANTS.includes(variant);
  return (
    <div className={className} style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{ position: [0, 0, isExpScene ? 3.8 : 3.2], fov: isExpScene ? 55 : 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: false, alpha: true, powerPreference: 'low-power' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 3]} intensity={1.5} />
        <pointLight position={[-3, -2, 2]} intensity={0.4} color={color} />
        {SCENE_MAP[variant](color, isHovered)}
      </Canvas>
    </div>
  );
}
