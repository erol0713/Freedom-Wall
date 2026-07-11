'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, Icosahedron, Sphere, Environment } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

// Create a heart shape
const heartShape = new THREE.Shape();
heartShape.moveTo(25, 25);
heartShape.bezierCurveTo(25, 25, 20, 0, 0, 0);
heartShape.bezierCurveTo(-30, 0, -30, 35, -30, 35);
heartShape.bezierCurveTo(-30, 55, -10, 77, 25, 95);
heartShape.bezierCurveTo(60, 77, 80, 55, 80, 35);
heartShape.bezierCurveTo(80, 35, 80, 0, 50, 0);
heartShape.bezierCurveTo(35, 0, 25, 25, 25, 25);

const extrudeSettings = { 
  depth: 4, 
  bevelEnabled: true, 
  bevelSegments: 2, 
  steps: 1, 
  bevelSize: 1, 
  bevelThickness: 1 
};

// Simplified material for high performance
const GlassMaterial = ({ color }) => (
  <meshStandardMaterial
    color={color}
    transparent={true}
    opacity={0.7}
    metalness={0.3}
    roughness={0.2}
  />
);

function AnimatedTorus() {
  const ref = useRef(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.2;
      ref.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={2} floatingRange={[-0.5, 0.5]}>
      <Torus ref={ref} args={[1, 0.4, 16, 48]} position={[-4, 2, -5]}>
        <GlassMaterial color="#ff00ff" /> {/* Neon Magenta */}
      </Torus>
    </Float>
  );
}

function AnimatedIcosahedron() {
  const ref = useRef(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta * 0.1;
      ref.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5} floatingRange={[-0.3, 0.3]}>
      <Icosahedron ref={ref} args={[1.5, 0]} position={[5, -1, -8]}>
        <GlassMaterial color="#00ffff" /> {/* Neon Cyan */}
      </Icosahedron>
    </Float>
  );
}

function AnimatedSphere() {
  const ref = useRef(null);
  return (
    <Float speed={1} rotationIntensity={0.5} floatIntensity={3} floatingRange={[-1, 1]}>
      <Sphere ref={ref} args={[0.8, 32, 32]} position={[0, -4, -4]}>
        <GlassMaterial color="#ffff00" />
      </Sphere>
    </Float>
  );
}

function AnimatedHeart() {
  const ref = useRef(null);
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.15;
      ref.current.rotation.y += delta * 0.25;
      ref.current.rotation.z -= delta * 0.1;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2} floatingRange={[-0.8, 0.8]}>
      <mesh ref={ref} position={[-6, -2, -6]} scale={0.015} rotation={[Math.PI, 0, 0]}>
        <extrudeGeometry args={[heartShape, extrudeSettings]} />
        <GlassMaterial color="#ff2a6d" /> {/* Neon Pink/Red */}
      </mesh>
    </Float>
  );
}

export default function FloatingShapes() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#00ffff" />
        
        <AnimatedTorus />
        <AnimatedIcosahedron />
        <AnimatedSphere />
        <AnimatedHeart />
      </Canvas>
    </div>
  );
}
