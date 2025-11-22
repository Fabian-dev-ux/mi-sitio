// app/components/Fragmento.tsx (Versión Optimizada para Rendimiento)
'use client';
import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  Environment, 
  Center,
  useGLTF 
} from '@react-three/drei';
import { Mesh, Group, BufferGeometry, Object3D } from 'three';

// Pre-cargar el modelo para una experiencia más rápida
useGLTF.preload('/models/cruz-draco.glb');

// ========================================================================
// Componente Model Optimizado
// ========================================================================
const Model = ({ isMobile }: { isMobile: boolean }) => {
  const gltf = useGLTF('/models/cruz-draco.glb');
  const groupRef = useRef<Group>(null);
  
  const rotationSpeeds = useMemo(() => ({
    x: (Math.random() - 0.5) * 0.01,
    y: (Math.random() - 0.5) * 0.01,
    z: (Math.random() - 0.5) * 0.01
  }), []);

  const modelGeometry = useMemo(() => {
    let geometry: BufferGeometry | null = null;
    gltf.scene.traverse((child: Object3D) => {
      if (child instanceof Mesh && !geometry) {
        geometry = child.geometry;
      }
    });
    return geometry;
  }, [gltf.scene]);

  // OPTIMIZACIÓN: Material memoizado con configuración optimizada
  const optimizedMaterial = useMemo(() => {
    return {
      transmission: isMobile ? 0.8 : 1, // Menos transmisión en móvil
      roughness: isMobile ? 0.2 : 0.1,  // Más rugosidad = menos reflejos costosos
      thickness: isMobile ? 0.05 : 0.1, // Menos grosor para cálculos más simples
      ior: 1.5, // IOR más bajo = cálculos más simples
      color: "#ffffff",
      // CLAVE: Deshabilitar características costosas en móvil
      clearcoat: isMobile ? 0 : 0.1,
      clearcoatRoughness: 0.1,
      // Optimizar sombras
      transparent: true,
      opacity: 0.95
    };
  }, [isMobile]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x += rotationSpeeds.x;
      groupRef.current.rotation.y += rotationSpeeds.y;
      groupRef.current.rotation.z += rotationSpeeds.z;
    }
  });

  if (!modelGeometry) {
    return null;
  }

  return (
    <Center>
      <group ref={groupRef} scale={0.3}>
        <mesh geometry={modelGeometry}>
          <meshPhysicalMaterial
            {...optimizedMaterial}
          />
        </mesh>
      </group>
    </Center>
  );
};

// ========================================================================
// Componente Principal Optimizado
// ========================================================================
const Fragmento = ({ isMobile }: { isMobile: boolean }) => {
  return (
    <div className="w-full h-full bg-black relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
        gl={{ 
          alpha: false,
          antialias: isMobile ? false : true, // Sin antialias en móvil
          powerPreference: "high-performance",
          // OPTIMIZACIONES ADICIONALES:
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: false
        }}
        dpr={isMobile ? [1, 1.25] : [1, 1.5]} // Menor DPR en móvil
        performance={{ min: 0.8 }} // Auto-reduce calidad si FPS baja
      >
        <color attach="background" args={['#000000']} />
        
        {/* ILUMINACIÓN OPTIMIZADA */}
        <ambientLight intensity={isMobile ? 0.4 : 0.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={isMobile ? 1.2 : 1.5} 
          color="#FFFFFF"
          castShadow={false} // Sin sombras para mejor rendimiento
        />
        <directionalLight 
          position={[-5, -5, -5]} 
          intensity={isMobile ? 0.3 : 0.5} 
          color="#FFFFFF"
          castShadow={false}
        />
        
        {/* ENVIRONMENT OPTIMIZADO */}
        <Environment 
          preset="city"
          resolution={isMobile ? 256 : 512} // AQUÍ: Resolución más baja en móvil
          background={false} // No usar como fondo para mejor rendimiento
        />
        
        <React.Suspense fallback={null}>
          <Model isMobile={isMobile} />
        </React.Suspense>
      </Canvas>
    </div>
  );
};

export default Fragmento;