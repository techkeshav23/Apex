import React, { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Realistic Human-like Avatar with facial features
function HumanAvatar({ isSpeaking }) {
  const groupRef = useRef();
  const headRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();
  const mouthRef = useRef();
  const upperLipRef = useRef();
  const lowerLipRef = useRef();
  
  // Skin tone color
  const skinColor = '#E8BEAC';
  const lipColor = '#C4727F';
  const eyeWhiteColor = '#FFFFFF';
  const irisColor = '#4A3728';
  const hairColor = '#2C1810';

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Subtle head movement
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.08;
      groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.03;
      groupRef.current.position.y = Math.sin(time * 0.5) * 0.01;
    }
    
    // Eye blinking
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkCycle = Math.sin(time * 0.8);
      const shouldBlink = blinkCycle > 0.95;
      const blinkScale = shouldBlink ? 0.1 : 1;
      leftEyeRef.current.scale.y = blinkScale;
      rightEyeRef.current.scale.y = blinkScale;
    }
    
    // Lip sync animation when speaking
    if (mouthRef.current && lowerLipRef.current) {
      if (isSpeaking) {
        // Create natural lip movement patterns
        const lipMovement = 
          Math.sin(time * 12) * 0.15 + 
          Math.sin(time * 18) * 0.1 + 
          Math.sin(time * 25) * 0.05;
        
        mouthRef.current.scale.y = 1 + Math.abs(lipMovement) * 2;
        mouthRef.current.scale.x = 1 - Math.abs(lipMovement) * 0.3;
        lowerLipRef.current.position.y = -0.02 - Math.abs(lipMovement) * 0.08;
        
        if (upperLipRef.current) {
          upperLipRef.current.position.y = 0.02 + Math.abs(lipMovement) * 0.02;
        }
      } else {
        // Subtle breathing movement when not speaking
        mouthRef.current.scale.y = 1 + Math.sin(time * 2) * 0.02;
        mouthRef.current.scale.x = 1;
        lowerLipRef.current.position.y = -0.02;
        if (upperLipRef.current) {
          upperLipRef.current.position.y = 0.02;
        }
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      {/* Head */}
      <mesh ref={headRef}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} metalness={0.1} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 0.25, -0.1]}>
        <sphereGeometry args={[0.48, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color={hairColor} roughness={0.8} />
      </mesh>
      
      {/* Side Hair Left */}
      <mesh position={[-0.4, 0.05, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={hairColor} roughness={0.8} />
      </mesh>
      
      {/* Side Hair Right */}
      <mesh position={[0.4, 0.05, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshStandardMaterial color={hairColor} roughness={0.8} />
      </mesh>
      
      {/* Left Eye White */}
      <group position={[-0.15, 0.1, 0.42]} ref={leftEyeRef}>
        <mesh>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial color={eyeWhiteColor} roughness={0.1} />
        </mesh>
        {/* Left Iris */}
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.045, 32, 32]} />
          <meshStandardMaterial color={irisColor} roughness={0.3} />
        </mesh>
        {/* Left Pupil */}
        <mesh position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.02, 0.02, 0.08]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* Right Eye White */}
      <group position={[0.15, 0.1, 0.42]} ref={rightEyeRef}>
        <mesh>
          <sphereGeometry args={[0.08, 32, 32]} />
          <meshStandardMaterial color={eyeWhiteColor} roughness={0.1} />
        </mesh>
        {/* Right Iris */}
        <mesh position={[0, 0, 0.05]}>
          <sphereGeometry args={[0.045, 32, 32]} />
          <meshStandardMaterial color={irisColor} roughness={0.3} />
        </mesh>
        {/* Right Pupil */}
        <mesh position={[0, 0, 0.07]}>
          <sphereGeometry args={[0.025, 16, 16]} />
          <meshStandardMaterial color="#000000" />
        </mesh>
        {/* Eye highlight */}
        <mesh position={[0.02, 0.02, 0.08]}>
          <sphereGeometry args={[0.01, 8, 8]} />
          <meshBasicMaterial color="#FFFFFF" />
        </mesh>
      </group>
      
      {/* Eyebrows */}
      <mesh position={[-0.15, 0.22, 0.4]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.12, 0.02, 0.02]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      <mesh position={[0.15, 0.22, 0.4]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.12, 0.02, 0.02]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, -0.02, 0.48]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.05, 0.45]}>
        <boxGeometry args={[0.04, 0.1, 0.08]} />
        <meshStandardMaterial color={skinColor} roughness={0.5} />
      </mesh>
      
      {/* Mouth area */}
      <group position={[0, -0.18, 0.42]}>
        {/* Upper Lip */}
        <mesh ref={upperLipRef} position={[0, 0.02, 0]}>
          <sphereGeometry args={[0.06, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color={lipColor} roughness={0.4} />
        </mesh>
        
        {/* Lower Lip */}
        <mesh ref={lowerLipRef} position={[0, -0.02, 0]}>
          <sphereGeometry args={[0.07, 32, 16, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5]} />
          <meshStandardMaterial color={lipColor} roughness={0.4} />
        </mesh>
        
        {/* Mouth interior (visible when speaking) */}
        <mesh ref={mouthRef} position={[0, 0, -0.02]}>
          <sphereGeometry args={[0.04, 16, 16]} />
          <meshStandardMaterial color="#3D1F1F" roughness={0.8} />
        </mesh>
      </group>
      
      {/* Ears */}
      <mesh position={[-0.48, 0.05, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      <mesh position={[0.48, 0.05, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.15, 0.18, 0.3, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.6} />
      </mesh>
      
      {/* Shoulders hint */}
      <mesh position={[0, -0.85, 0]}>
        <sphereGeometry args={[0.4, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
        <meshStandardMaterial color="#2C3E50" roughness={0.7} /> {/* Professional shirt color */}
      </mesh>
    </group>
  );
}

// Speaking indicator ring
function SpeakingIndicator({ isSpeaking }) {
  const ringRef = useRef();
  
  useFrame((state) => {
    if (ringRef.current) {
      const time = state.clock.getElapsedTime();
      ringRef.current.rotation.z = time * 0.5;
      
      if (isSpeaking) {
        ringRef.current.scale.x = 1 + Math.sin(time * 3) * 0.05;
        ringRef.current.scale.y = 1 + Math.sin(time * 3) * 0.05;
      }
    }
  });
  
  return (
    <mesh ref={ringRef} position={[0, -0.2, -0.3]}>
      <torusGeometry args={[0.8, 0.02, 16, 100]} />
      <meshBasicMaterial 
        color={isSpeaking ? "#1a73e8" : "#5f6368"} 
        transparent 
        opacity={0.6} 
      />
    </mesh>
  );
}

// Main Avatar Component
export default function Avatar3D({ isSpeaking }) {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%',
      minHeight: '400px',
      borderRadius: '12px', 
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #f0f4f8 0%, #e2e8f0 50%, #cbd5e1 100%)'
    }}>
      <Canvas
        camera={{ position: [0, 0, 2], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-5, 5, 5]} intensity={0.5} />
        <pointLight position={[0, 0, 3]} intensity={0.4} color="#60a5fa" />
        
        <Suspense fallback={null}>
          <HumanAvatar isSpeaking={isSpeaking} />
          <SpeakingIndicator isSpeaking={isSpeaking} />
        </Suspense>
        
        <OrbitControls 
          enablePan={false} 
          enableZoom={false}
          minPolarAngle={Math.PI / 2.2}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 8}
          maxAzimuthAngle={Math.PI / 8}
        />
      </Canvas>
    </div>
  );
}
