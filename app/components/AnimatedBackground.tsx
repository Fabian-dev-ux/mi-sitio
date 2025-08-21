import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, useGLTF, MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';

type Breakpoint = '2xl' | 'lg' | 'mobile';

// Hook personalizado para detectar breakpoints
function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('2xl');

  useEffect(() => {
    const getBreakpoint = (): Breakpoint => {
      const width = window.innerWidth;
      if (width < 768) return 'mobile';
      if (width < 1536) return 'lg';
      return '2xl';
    };
    setBreakpoint(getBreakpoint());
    const handleResize = () => setBreakpoint(getBreakpoint());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

// Función helper para verificar si un objeto es un Mesh
function isMesh(object: THREE.Object3D): object is THREE.Mesh {
  return object instanceof THREE.Mesh && object.geometry !== undefined;
}

// Componente de la escena 3D con todas las optimizaciones
function Scene() {
  const { viewport } = useThree();
  const { width, height } = viewport;
  const cruzRef = useRef<THREE.Mesh>(null);
  const conoRef = useRef<THREE.Mesh>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const lastMouseUpdate = useRef(0);
  const breakpoint = useBreakpoint();

  const positions = useMemo(() => {
    const configs = {
      '2xl': { cruz: [width / 4, height / 5, 0], cono: [-width / 3, -height / 8, 0] },
      'lg': { cruz: [width / 3.5, height / 4, 0], cono: [-width / 4.2, -height / 8, 0] },
      'mobile': { cruz: [width / 4, height / 2.8, 0], cono: [-width / 3, -height / 4, 0] }
    };
    return configs[breakpoint] || configs['2xl'];
  }, [width, height, breakpoint]);

  const mouseWorldPos = useMemo(() => new THREE.Vector3(), []);
  const cruzCurrentPos = useMemo(() => new THREE.Vector3(), []);
  const conoCurrentPos = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const targetPosition = useMemo(() => new THREE.Vector3(), []);

  const { nodes: cruzNodes } = useGLTF('/models/cruz-draco.glb');
  const { nodes: conoNodes } = useGLTF('/models/cono-draco.glb');
  
  const geometries = useMemo(() => ({
    cruz: Object.values(cruzNodes).find(isMesh)?.geometry,
    cono: Object.values(conoNodes).find(isMesh)?.geometry
  }), [cruzNodes, conoNodes]);

  const materialProps = useMemo(() => ({
    glass: { roughness: 0.15, transmission: 1, thickness: 1.5, ior: 1.7, metalness: 0, color: "white" },
    cono: { roughness: 0.15, transmission: 1, thickness: 1.5, ior: 1.7, metalness: 0, color: "white" }
  }), []);

  const scales = useMemo(() => {
    const configs = {
      '2xl': { cruz: 1.0, cono: 3.0 },
      'lg': { cruz: 0.65, cono: 2.5 },
      'mobile': { cruz: 0.5, cono: 2.0 }
    };
    return configs[breakpoint] || configs['2xl'];
  }, [breakpoint]);

  // Lógica de movimiento y animación (sin cambios)
  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouseUpdate.current < 16) return;
      lastMouseUpdate.current = now;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = -(event.clientY / window.innerHeight) * 2 + 1;
        setMouse({ x, y });
      });
    };
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        const now = Date.now();
        if (now - lastMouseUpdate.current < 16) return;
        lastMouseUpdate.current = now;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const x = (touch.clientX / window.innerWidth) * 2 - 1;
          const y = -(touch.clientY / window.innerHeight) * 2 + 1;
          setMouse({ x, y });
        });
      }
    };
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const calculateRepulsion = useCallback((objectPos: THREE.Vector3, mousePos: THREE.Vector3, strength: number, radius: number, resultVector: THREE.Vector3) => {
    direction.subVectors(objectPos, mousePos);
    const distance = direction.length();
    if (distance < radius && distance > 0.1) {
      direction.normalize();
      const force = Math.max(0, (radius - distance) / radius);
      resultVector.copy(direction).multiplyScalar(force * strength);
      return true;
    }
    resultVector.set(0, 0, 0);
    return false;
  }, [direction]);

  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 1 / 30);
    if (cruzRef.current) {
      cruzRef.current.rotation.x += clampedDelta * 0.2;
      cruzRef.current.rotation.y += clampedDelta * 0.2;
    }
    if (conoRef.current && breakpoint !== 'mobile') {
      conoRef.current.rotation.x -= clampedDelta * 0.2;
      conoRef.current.rotation.y -= clampedDelta * 0.2;
    }
    mouseWorldPos.set((mouse.x * viewport.width) / 2, (mouse.y * viewport.height) / 2, 0);
    if (cruzRef.current) {
      cruzCurrentPos.fromArray(positions.cruz as [number, number, number]);
      const repulsionConfig = { '2xl': { strength: 1.5, radius: 4 }, 'lg': { strength: 1.2, radius: 3.5 }, 'mobile': { strength: 1.0, radius: 3 } };
      const config = repulsionConfig[breakpoint] || repulsionConfig['2xl'];
      const hasRepulsion = calculateRepulsion(cruzCurrentPos, mouseWorldPos, config.strength, config.radius, direction);
      targetPosition.fromArray(positions.cruz as [number, number, number]);
      if (hasRepulsion) targetPosition.add(direction);
      cruzRef.current.position.lerp(targetPosition, clampedDelta * (hasRepulsion ? 5 : 3));
    }
    if (conoRef.current && breakpoint !== 'mobile') {
      conoCurrentPos.fromArray(positions.cono as [number, number, number]);
      const conoRepulsionConfig: Record<'2xl' | 'lg', { strength: number; radius: number }> = { 
        '2xl': { strength: 2.0, radius: 5 }, 
        'lg': { strength: 1.7, radius: 4.5 } 
      };
      const conoConfig = conoRepulsionConfig[breakpoint as '2xl' | 'lg'] || conoRepulsionConfig['2xl'];
      const hasRepulsion = calculateRepulsion(conoCurrentPos, mouseWorldPos, conoConfig.strength, conoConfig.radius, direction);
      targetPosition.fromArray(positions.cono as [number, number, number]);
      if (hasRepulsion) targetPosition.add(direction);
      conoRef.current.position.lerp(targetPosition, clampedDelta * (hasRepulsion ? 4 : 2.5));
    }
  });

  return (
    <>
      <mesh ref={cruzRef} position={positions.cruz as [number, number, number]} scale={scales.cruz} frustumCulled={true}>
        {geometries.cruz ? <primitive object={geometries.cruz} /> : <icosahedronGeometry args={[1, 0]} />}
        
        <MeshTransmissionMaterial
          {...materialProps.glass}
          resolution={256}
          samples={4}      
          background={new THREE.Color('#000000')}
        />
      </mesh>
      
      {breakpoint !== 'mobile' && (
        <mesh ref={conoRef} position={positions.cono as [number, number, number]} scale={scales.cono} frustumCulled={true}>
          {geometries.cono ? <primitive object={geometries.cono} /> : <coneGeometry args={[2, 3, 3]} />}
          
          <MeshTransmissionMaterial
            {...materialProps.cono}
            resolution={256}
            samples={4}
            background={new THREE.Color('#000000')}
          />
        </mesh>
      )}
    </>
  );
}

// Componente principal que envuelve el Canvas (sin cambios)
const AnimatedBackground = React.memo(() => {
  return (
    <Canvas 
      orthographic
      camera={{ position: [0, 0, 20], zoom: 50 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      style={{ width: '100%', height: '100%' }}
    >
      <color attach="background" args={['black']} />
      <Environment preset="city" />
      <Scene />
    </Canvas>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

export default AnimatedBackground;