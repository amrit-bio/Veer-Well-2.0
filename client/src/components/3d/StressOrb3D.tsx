import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Sparkles, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface StressOrbProps {
  stressScore?: number; // 1 - 10 scale (or converted from 100)
  stressLevel?: number; // alias
  wellnessScore?: number; // 0 - 100 scale
  className?: string;
}

const DynamicOrbMesh: React.FC<{ stressScore: number }> = ({ stressScore }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const outerHaloRef = useRef<THREE.Mesh>(null);

  // Normalize stress 1-10
  const normalized = Math.max(1, Math.min(10, stressScore));
  
  // Calculate dynamic colors and physics parameters based on stress
  const { orbColor, emissiveColor, distortIntensity, speed, particleColor } = useMemo(() => {
    if (normalized <= 3.5) {
      // Low Stress / Optimal Wellness: Emerald / Cyan
      return {
        orbColor: '#10b981',
        emissiveColor: '#047857',
        distortIntensity: 0.25,
        speed: 1.5,
        particleColor: '#34d399',
      };
    } else if (normalized <= 6.5) {
      // Moderate Stress: Warm Amber / Gold
      return {
        orbColor: '#f59e0b',
        emissiveColor: '#b45309',
        distortIntensity: 0.48,
        speed: 2.8,
        particleColor: '#fbbf24',
      };
    } else {
      // Elevated Stress / Fatigue: Rose / Crimson
      return {
        orbColor: '#f43f5e',
        emissiveColor: '#9f1239',
        distortIntensity: 0.72,
        speed: 4.5,
        particleColor: '#fb7185',
      };
    }
  }, [normalized]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (0.2 + normalized * 0.08);
      meshRef.current.rotation.x += delta * (0.1 + normalized * 0.04);
    }
    if (outerHaloRef.current) {
      outerHaloRef.current.rotation.z -= delta * (0.15 + normalized * 0.05);
    }
  });

  return (
    <group scale={1.1}>
      <Float speed={speed * 0.7} rotationIntensity={1.0} floatIntensity={1.2}>
        {/* Core Stress Orb */}
        <Sphere ref={meshRef} args={[1.3, 64, 64]}>
          <MeshDistortMaterial
            color={orbColor}
            emissive={emissiveColor}
            emissiveIntensity={0.65}
            roughness={0.2}
            metalness={0.7}
            distort={distortIntensity}
            speed={speed}
          />
        </Sphere>

        {/* Outer Translucent Energy Sheath */}
        <Sphere ref={outerHaloRef} args={[1.5, 32, 32]}>
          <meshStandardMaterial
            color={orbColor}
            wireframe
            transparent
            opacity={0.15 + normalized * 0.02}
          />
        </Sphere>
      </Float>

      {/* Reactive Biometric Particle Field */}
      <Sparkles
        count={Math.round(30 + normalized * 8)}
        scale={4.2}
        size={2.4}
        speed={speed * 0.3}
        color={particleColor}
      />
    </group>
  );
};

export const StressOrb3D: React.FC<StressOrbProps> = ({
  stressScore,
  stressLevel,
  wellnessScore = 82,
  className = 'h-64 md:h-72',
}) => {
  const actualScore = stressScore ?? stressLevel ?? 4.5;

  return (
    <div className={`w-full relative flex items-center justify-center rounded-2xl overflow-hidden glass-panel ${className}`}>
      {/* Dynamic Background Glow based on Stress */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none transition-colors duration-1000"
        style={{
          background:
            actualScore <= 3.5
              ? 'radial-gradient(circle at center, rgba(16, 185, 129, 0.4) 0%, transparent 70%)'
              : actualScore <= 6.5
              ? 'radial-gradient(circle at center, rgba(245, 158, 11, 0.4) 0%, transparent 70%)'
              : 'radial-gradient(circle at center, rgba(244, 63, 94, 0.4) 0%, transparent 70%)',
        }}
      />

      {/* HUD Info Badges overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-slate-900/80 border border-slate-700/60 text-slate-300 backdrop-blur-md">
          <span
            className="w-2 h-2 rounded-full animate-ping"
            style={{
              backgroundColor:
                actualScore <= 3.5 ? '#10b981' : actualScore <= 6.5 ? '#f59e0b' : '#f43f5e',
            }}
          />
          Live 3D Stress Telemetry
        </span>
      </div>

      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2">
        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-slate-900/70 border border-slate-800">
          Turbulence: {(actualScore * 10).toFixed(0)}%
        </span>
      </div>

      <div className="w-full h-full">
        <Suspense
          fallback={
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-emerald-400">
              <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Generating Orb Physics...</span>
            </div>
          }
        >
          <Canvas
            camera={{ position: [0, 0, 4.2], fov: 45 }}
            gl={{ antialias: true, alpha: true }}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <ambientLight intensity={0.9} />
            <directionalLight position={[4, 5, 4]} intensity={2.0} color="#ffffff" />
            <pointLight position={[-3, -2, -2]} intensity={1.5} color="#10b981" />
            <pointLight position={[3, 3, 2]} intensity={1.5} color="#f59e0b" />
            <DynamicOrbMesh stressScore={actualScore} />
            <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.6} maxPolarAngle={Math.PI / 1.5} minPolarAngle={Math.PI / 3} />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
};
