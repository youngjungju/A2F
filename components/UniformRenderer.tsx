'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { NoiseParams } from '@/lib/types';
import { noiseVertexShader, noiseFragmentShader } from '@/lib/shaders';

interface UniformMeshProps {
  modelPath?: string;
  params: NoiseParams;
  autoRotate?: boolean;
}

function UniformMesh({ modelPath = '/assets/models/jersey_tigres/scene.gltf', params, autoRotate = true }: UniformMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const [originalTexture, setOriginalTexture] = useState<THREE.Texture | null>(null);
  const { camera } = useThree();

  // Load GLTF model
  const { scene } = useGLTF(modelPath);

  useEffect(() => {
    if (!scene) return;

    // Extract original texture from model
    let texture: THREE.Texture | null = null;
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (material.map) {
          texture = material.map;
        }
      }
    });

    if (texture) {
      setOriginalTexture(texture);
    }
  }, [scene]);

  useEffect(() => {
    if (!meshRef.current || !originalTexture) return;

    // Create shader material with noise gradient
    const material = new THREE.ShaderMaterial({
      uniforms: {
        u_amplitude: { value: params.amplitude },
        u_saturation: { value: params.saturation },
        u_layers: { value: params.layers },
        u_lacunarity: { value: params.lacunarity },
        u_gain: { value: params.gain },
        u_warpStrength: { value: params.warpStrength },
        u_halftonePattern: { value: params.halftonePattern },
        u_halftoneScale: { value: params.halftoneScale },
        originalTexture: { value: originalTexture },
        useOriginalTexture: { value: false }, // Use noise gradient by default
        cameraPosition: { value: camera.position },
      },
      vertexShader: noiseVertexShader,
      fragmentShader: noiseFragmentShader,
      side: THREE.DoubleSide,
    });

    materialRef.current = material;

    // Apply shader material to all meshes in the model
    meshRef.current.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.material = material;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      }
    });

    return () => {
      material.dispose();
    };
  }, [scene, camera, originalTexture, params]);

  // Update uniforms when params change
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.u_amplitude.value = params.amplitude;
      materialRef.current.uniforms.u_saturation.value = params.saturation;
      materialRef.current.uniforms.u_layers.value = params.layers;
      materialRef.current.uniforms.u_lacunarity.value = params.lacunarity;
      materialRef.current.uniforms.u_gain.value = params.gain;
      materialRef.current.uniforms.u_warpStrength.value = params.warpStrength;
      materialRef.current.uniforms.u_halftonePattern.value = params.halftonePattern;
      materialRef.current.uniforms.u_halftoneScale.value = params.halftoneScale;
    }
  }, [params]);

  // Auto-rotate animation
  useFrame(() => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += 0.003;
    }
  });

  // Clone and render the loaded model
  const clonedScene = scene.clone();

  return (
    <primitive
      ref={meshRef}
      object={clonedScene}
      position={[0, 0, 0]}
      scale={1}
    />
  );
}

// Preload the model
useGLTF.preload('/assets/models/jersey_tigres/scene.gltf');

interface UniformRendererProps {
  params: NoiseParams;
  autoRotate?: boolean;
  modelPath?: string;
  className?: string;
}

export default function UniformRenderer({
  params,
  autoRotate = true,
  modelPath,
  className = '',
}: UniformRendererProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 45 }}
        shadows
        gl={{
          antialias: true,
          preserveDrawingBuffer: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <color attach="background" args={['#1a1a1a']} />
        <fog attach="fog" args={['#1a1a1a', 5, 15]} />

        {/* Lighting Setup for Jersey */}
        <ambientLight intensity={0.8} />

        {/* Main light (front) */}
        <directionalLight
          position={[3, 4, 4]}
          intensity={1.5}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-near={0.1}
          shadow-camera-far={20}
          shadow-camera-left={-5}
          shadow-camera-right={5}
          shadow-camera-top={5}
          shadow-camera-bottom={-5}
        />

        {/* Fill light (side) */}
        <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#6699ff" />

        {/* Rim light (back) */}
        <directionalLight position={[0, 2, -4]} intensity={0.8} color="#ffffff" />

        {/* Spotlight for emphasis */}
        <spotLight
          position={[0, 5, 0]}
          intensity={0.5}
          angle={0.3}
          penumbra={0.5}
          castShadow
        />

        {/* Ground Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -1, 0]}>
          <circleGeometry args={[8, 64]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.2} />
        </mesh>

        {/* 3D Jersey Model */}
        <UniformMesh modelPath={modelPath} params={params} autoRotate={autoRotate} />

        {/* Camera Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          minDistance={1.5}
          maxDistance={6}
          maxPolarAngle={Math.PI / 2 + 0.3}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
