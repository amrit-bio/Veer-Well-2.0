import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

interface BioRingProps {
  heartRate?: number; // BPM, e.g. 68
  hrv?: number; // ms, e.g. 58
  className?: string;
}

const BioRingMesh: React.FC<{ heartRate: number; hrv: number }> = ({ heartRate, hrv }) => {
  const mainRingRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Mesh>(null);
  const waveRingRef = useRef<THREE.Mesh>(null);

  // Pulse speed calculation from BPM (e.g. 60bpm = 1 beat per second)
  const pulseFreq = (heartRate / 60) * Math.PI * 2;

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();
    const pulseScale = 1 + Math.sin(t * pulseFreq) * 0.06;

    if (mainRingRef.current) {
      mainRingRef.current.rotation.x = t * 0.3;
      mainRingRef.current.rotation.y = t * 0.4;
      mainRingRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z = -t * 0.5;
      innerRingRef.current.rotation.x = t * 0.2;
      const innerScale = 1 + Math.cos(t * pulseFreq) * 0.08;
      innerRingRef.current.scale.set(innerScale, innerScale, innerScale);
    }
    if (waveRingRef.current) {
      waveRingRef.current.rotation.y = -t * 0.35;
      waveRingRef.current.rotation.z = t * 0.25;
    }
  });

  return (
    <group scale={1.15}>
      <Float speed={2} rotationIntensity={0.8} floatIntensity={1}>
        {/* Main Biometric Torus */}
        <Torus ref={mainRingRef} args={[1.6, 0.08, 30, 100]}>
          <meshStandardMaterial
            color="#06b6d4"
            emissive="#0891b2"
            emissiveIntensity={0.85}
            metalness={0.9}
            roughness={0.1}
          />
        </Torus>

        {/* Inner Heart-Rate Pulse Ring */}
        <Torus ref={innerRingRef} args={[1.2, 0.05, 24, 80]}>
          <meshStandardMaterial
            color="#10b981"
            emissive="#059669"
            emissiveIntensity={0.95}
            metalness={0.8}
            roughness={0.15}
          />
        </Torus>

        {/* Outer HRV Harmonic Wave Ring */}
        <Torus ref={waveRingRef} args={[2.0, 0.03, 20, 90]}>
          <meshStandardMaterial
            color="#8b5cf6"
            emissive="#7c3aed"
            emissiveIntensity={0.7}
            metalness={0.7}
            roughness={0.2}
          />
        </Torus>
      </Float>

      {/* Orbiting Telemetry Particles */}
      <Sparkles count={45} scale={4.0} size={2.2} speed={1.2} color="#22d3ee" />
      <Sparkles count={25} scale={3.2} size={1.8} speed={0.9} color="#34d399" />
    </group>
  );
};

export const BioRing3D: React.FC<BioRingProps> = ({
  heartRate = 72,
  hrv = 64,
  className = 'h-52 md:h-64',
}) => {
  return (
    <div className={`w-full relative flex items-center justify-center rounded-2xl overflow-hidden glass-panel ${className}`}>
      {/* Background glow */}
      <div className="absolute w-52 h-52 rounded-full bg-cyan-500/10 blur-[60px] pointer-events-none" />

      {/* HUD overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-medium bg-slate-900/80 border border-slate-700/60 text-cyan-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          3D HRV & Cardiac Harmonic Ring
        </span>
      </div>

      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-3">
        <span className="text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
          Pulse Cadence: <strong className="text-emerald-400">{heartRate} BPM</strong>
        </span>
        <span className="text-[10px] font-mono text-slate-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
          HRV Flux: <strong className="text-purple-400">{hrv} ms</strong>
        </span>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-2 text-cyan-400">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Rendering 3D Bio-Ring...</span>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 46 }}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[4, 5, 4]} intensity={2.2} color="#ffffff" />
          <pointLight position={[-3, -2, -2]} intensity={1.8} color="#06b6d4" />
          <pointLight position={[3, 3, 2]} intensity={1.8} color="#10b981" />
          <BioRingMesh heartRate={heartRate} hrv={hrv} />
        </Canvas>
      </Suspense>
    </div>
  );
};
