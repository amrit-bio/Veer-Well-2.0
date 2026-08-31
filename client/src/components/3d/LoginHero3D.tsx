import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

const HeroCore = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.x += delta * 0.4;
      ringRef1.current.rotation.z += delta * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y += delta * 0.35;
      ringRef2.current.rotation.x -= delta * 0.25;
    }
  });

  return (
    <group scale={1.2}>
      {/* Floating Center Core: Distorted Emerald-Teal Bio-Sphere */}
      <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5}>
        <Sphere ref={meshRef} args={[1.1, 64, 64]}>
          <MeshDistortMaterial
            color="#10b981"
            emissive="#064e3b"
            emissiveIntensity={0.6}
            roughness={0.15}
            metalness={0.8}
            distort={0.42}
            speed={2.2}
            wireframe={false}
          />
        </Sphere>
      </Float>

      {/* Orbiting Golden/Saffron Shield Ring */}
      <Torus ref={ringRef1} args={[1.8, 0.03, 32, 100]}>
        <meshStandardMaterial
          color="#f59e0b"
          emissive="#d97706"
          emissiveIntensity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Torus>

      {/* Orbiting Cyan Biometric Ring */}
      <Torus ref={ringRef2} args={[2.2, 0.025, 32, 100]}>
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#0891b2"
          emissiveIntensity={0.9}
          metalness={0.9}
          roughness={0.1}
        />
      </Torus>

      {/* Ambient Sparkles */}
      <Sparkles count={50} scale={4.5} size={2.5} speed={0.6} color="#34d399" />
      <Sparkles count={30} scale={5} size={2.0} speed={0.8} color="#fbbf24" />
    </group>
  );
};

export const LoginHero3D: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[340px] relative flex items-center justify-center">
      {/* Ambient background blur glow */}
      <div className="absolute w-72 h-72 rounded-full bg-emerald-500/15 blur-[90px] pointer-events-none" />
      <div className="absolute w-60 h-60 rounded-full bg-amber-500/10 blur-[80px] pointer-events-none translate-x-12 translate-y-12" />

      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-3 text-emerald-400">
            <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
            <span className="text-xs font-mono text-slate-400">Initializing 3D Visualizer...</span>
          </div>
        }
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, alpha: true }}
          className="w-full h-full"
        >
          <ambientLight intensity={0.9} />
          <directionalLight position={[5, 6, 5]} intensity={2.5} color="#ffffff" />
          <pointLight position={[-4, -3, -2]} intensity={1.8} color="#10b981" />
          <pointLight position={[3, 4, 3]} intensity={2.0} color="#f59e0b" />
          <HeroCore />
        </Canvas>
      </Suspense>
    </div>
  );
};
