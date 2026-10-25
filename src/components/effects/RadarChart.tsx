'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface RadarItem {
  name: string;
  level: number; // 0–100
}

interface RadarMeshProps {
  items: RadarItem[];
  color: string;
  targetScale: number;
}

function RadarMesh({ items, color, targetScale }: RadarMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const linesRef = useRef<THREE.LineSegments>(null);
  const currentScale = useRef(0);

  const n = items.length;

  const { filledPositions, axisPositions } = (() => {
    const filled: number[] = [];
    const axes: number[] = [];
    const RADIUS = 1.5;

    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const r = (items[i].level / 100) * RADIUS;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      filled.push(x, y, 0);
      axes.push(0, 0, 0, Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, 0);
    }
    // close polygon
    const first = filled.slice(0, 3);
    filled.push(...first);

    return {
      filledPositions: new Float32Array(filled),
      axisPositions: new Float32Array(axes),
    };
  })();

  useFrame((_, dt) => {
    const diff = targetScale - currentScale.current;
    currentScale.current += diff * Math.min(dt * 5, 1);
    if (meshRef.current) meshRef.current.scale.setScalar(currentScale.current);
    if (linesRef.current) linesRef.current.scale.setScalar(currentScale.current);
  });

  return (
    <>
      {/* Axis lines */}
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[axisPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.25} />
      </lineSegments>

      {/* Filled polygon */}
      <mesh ref={meshRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[filledPositions, 3]} />
        </bufferGeometry>
        <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Polygon outline */}
      <lineLoop>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[filledPositions, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.7} />
      </lineLoop>
    </>
  );
}

interface RadarChartProps {
  items: RadarItem[];
  color?: string;
}

export default function RadarChart({ items, color = '#00d4ff' }: RadarChartProps) {
  if (items.length < 3) return null;
  return (
    <div style={{ width: '100%', height: '220px' }}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 50 }}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={1} />
        <RadarMesh items={items} color={color} targetScale={1} />
      </Canvas>
    </div>
  );
}
