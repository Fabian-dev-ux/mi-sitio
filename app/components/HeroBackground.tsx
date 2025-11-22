'use client';

import React, { useRef, Suspense, useMemo, useCallback, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree, createPortal } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  useGLTF,
  MeshTransmissionMaterial,
  Text,
  Preload,
  useFBO,
} from '@react-three/drei';
import {
  Group,
  Mesh,
  Vector3,
  Euler,
  Object3D,
  Scene,
  OrthographicCamera,
  Texture,
  Quaternion,
} from 'three';
import Head from 'next/head';

// ============= UTILIDADES =============
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// ============= TIPOS =============
interface BaseMeshConfig {
  positionOffset: [number, number, number];
  scaleMultiplier: [number, number, number];
  rotation: { x: number; y: number; z: number };
}

interface MobileMeshConfig extends BaseMeshConfig {
  visible: boolean;
}

interface MeshConfig {
  desktop: BaseMeshConfig;
  mobile: MobileMeshConfig;
}

interface OptimizedMeshData {
  mesh: Mesh;
  originalPosition: Vector3;
  originalScale: Vector3;
  originalRotation: Euler;
  config: MeshConfig;
  index: number;
}

// ============= HOOKS =============
const useMeshConfigs = (): MeshConfig[] => {
  return useMemo<MeshConfig[]>(() => [
    {
      desktop: { positionOffset: [0.7, 0.3, 1], scaleMultiplier: [0.6, 0.6, 0.6], rotation: { x: 0.005, y: -0.003, z: 0.002 } },
      mobile: { positionOffset: [-0.6, -0.2, 1], scaleMultiplier: [0.7, 0.7, 0.7], visible: true, rotation: { x: 0.005, y: -0.003, z: 0.002 } }
    },
    {
      desktop: { positionOffset: [0, -0.1, -4], scaleMultiplier: [0.6, 0.6, 0.6], rotation: { x: -0.002, y: 0.005, z: -0.001 } },
      mobile: { positionOffset: [3.2, 3.5, 1], scaleMultiplier: [0.4, 0.4, 0.4], visible: true, rotation: { x: -0.002, y: 0.005, z: -0.001 } }
    },
    {
      desktop: { positionOffset: [1.5, 1.4, -4], scaleMultiplier: [0.5, 0.5, 0.5], rotation: { x: 0.003, y: -0.004, z: 0.002 } },
      mobile: { positionOffset: [-1.8, -3.1, 1], scaleMultiplier: [0.3, 0.3, 0.3], visible: true, rotation: { x: 0.003, y: -0.004, z: 0.002 } }
    },
    {
      desktop: { positionOffset: [2, -0.4, 1], scaleMultiplier: [0.3, 0.3, 0.5], rotation: { x: -0.003, y: 0.002, z: 0.004 } },
      mobile: { positionOffset: [0, 0, 0], scaleMultiplier: [0, 0, 0], visible: false, rotation: { x: -0.003, y: 0.002, z: 0.004 } }
    },
    {
      desktop: { positionOffset: [0.4, 0.5, 1], scaleMultiplier: [0.4, 0.4, 0.4], rotation: { x: 0.002, y: -0.001, z: 0.003 } },
      mobile: { positionOffset: [0, 0, 0], scaleMultiplier: [0, 0, 0], visible: false, rotation: { x: 0.002, y: -0.001, z: 0.003 } }
    }
  ], []);
};

// ============= COMPONENTES =============

const OptimizedLoader = React.memo(() => (
  <mesh>
    <boxGeometry args={[0.5, 0.5, 0.5]} />
    <meshBasicMaterial color="#FF5741" wireframe />
  </mesh>
));

function AnimatedMesh({
  meshData,
  isMobile,
  mousePosition,
  scrollProgress,
  materialConfig,
}: {
  meshData: OptimizedMeshData;
  isMobile: boolean;
  mousePosition: { x: number; y: number };
  scrollProgress: number;
  materialConfig: any;
}) {
  const meshRef = useRef<Mesh>(null!);
  const { originalPosition, originalScale, config, index } = meshData;

  const animationConstants = useMemo(() => ({ 
    mouseRotationLerpFactor: 0.1, 
    scrollZBaseFactor: 30, 
    scrollZIncrementFactor: 4, 
    scrollDispersionBaseFactor: 4, 
    scrollScaleFactor: 1.2, 
  }), []);
  
  useFrame(() => {
    if (!meshRef.current) return;
    
    // Fix: Handle visibility property correctly
    if (isMobile) {
      const mobileConfig = config.mobile;
      meshRef.current.visible = mobileConfig.visible;
      if (!meshRef.current.visible) return;
      
      const { rotation: rotConfig } = mobileConfig;
      meshRef.current.rotation.x += rotConfig.x;
      meshRef.current.rotation.y += rotConfig.y;
      meshRef.current.rotation.z += rotConfig.z;
      
      meshRef.current.position.set(
        originalPosition.x + mobileConfig.positionOffset[0], 
        originalPosition.y + mobileConfig.positionOffset[1], 
        originalPosition.z + mobileConfig.positionOffset[2]
      );
      meshRef.current.scale.set(
        originalScale.x * mobileConfig.scaleMultiplier[0], 
        originalScale.y * mobileConfig.scaleMultiplier[1], 
        originalScale.z * mobileConfig.scaleMultiplier[2]
      );
    } else {
      const desktopConfig = config.desktop;
      meshRef.current.visible = true; // Desktop meshes are always visible
      
      const { rotation: rotConfig } = desktopConfig;
      meshRef.current.rotation.x += rotConfig.x;
      meshRef.current.rotation.y += rotConfig.y;
      meshRef.current.rotation.z += rotConfig.z;
      
      const uniqueFactor = 0.03 + index * 0.01;
      const targetRotX = meshRef.current.rotation.x - mousePosition.y * uniqueFactor;
      const targetRotY = meshRef.current.rotation.y + mousePosition.x * uniqueFactor;
      meshRef.current.rotation.x += (targetRotX - meshRef.current.rotation.x) * animationConstants.mouseRotationLerpFactor;
      meshRef.current.rotation.y += (targetRotY - meshRef.current.rotation.y) * animationConstants.mouseRotationLerpFactor;
      
      const zOffset = scrollProgress * (animationConstants.scrollZBaseFactor + index * animationConstants.scrollZIncrementFactor);
      const xDispersion = (index % 2 === 0 ? 1 : -1) * scrollProgress * (index + 1) * animationConstants.scrollDispersionBaseFactor;
      const yDispersion = (index - 1) * scrollProgress * (index + 1) * 3;
      const scaleFactor = 1 + scrollProgress * animationConstants.scrollScaleFactor;
      
      meshRef.current.position.set(
        originalPosition.x + desktopConfig.positionOffset[0] + xDispersion, 
        originalPosition.y + desktopConfig.positionOffset[1] + yDispersion, 
        originalPosition.z + desktopConfig.positionOffset[2] + zOffset
      );
      meshRef.current.scale.set(
        originalScale.x * desktopConfig.scaleMultiplier[0] * scaleFactor, 
        originalScale.y * desktopConfig.scaleMultiplier[1] * scaleFactor, 
        originalScale.z * desktopConfig.scaleMultiplier[2] * scaleFactor
      );
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      geometry={meshData.mesh.geometry} 
      position={meshData.originalPosition} 
      scale={meshData.originalScale} 
      rotation={meshData.originalRotation}
    > 
      <MeshTransmissionMaterial {...materialConfig} /> 
    </mesh>
  );
}

function Model({ backgroundTexture }: { backgroundTexture: Texture }) {
  const gltf = useGLTF('/models/break.glb');
  const groupRef = useRef<Group>(null);
  const { size } = useThree();
  const isMobile = useMemo(() => size.width < 640, [size.width]);
  
  const [optimizedMeshData, setOptimizedMeshData] = useState<OptimizedMeshData[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const meshConfigs = useMeshConfigs();

  const updateMousePosition = useCallback(throttle((e: MouseEvent) => { if (!isMobile) setMousePosition({ x: (e.clientX / window.innerWidth) * 2 - 1, y: -((e.clientY / window.innerHeight) * 2 - 1) }); }, 16), [isMobile]);
  const updateScrollProgress = useCallback(throttle(() => { if (!isMobile) { const scrollTop = window.scrollY; const scrollHeight = document.documentElement.scrollHeight - window.innerHeight; setScrollProgress(scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0); } }, 16), [isMobile]);

  useEffect(() => {
    const meshDataArray: OptimizedMeshData[] = [];
    let meshIndex = 0;
    gltf.scene.traverse((child) => {
      if ((child as Mesh).isMesh && meshIndex < meshConfigs.length) {
        meshDataArray.push({ mesh: child as Mesh, originalPosition: child.position.clone(), originalScale: child.scale.clone(), originalRotation: child.rotation.clone(), config: meshConfigs[meshIndex], index: meshIndex });
        meshIndex++;
      }
    });
    setOptimizedMeshData(meshDataArray);
  }, [gltf.scene, meshConfigs]);

  useEffect(() => {
    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('scroll', updateScrollProgress);
    };
  }, [updateMousePosition, updateScrollProgress]);
  
  useFrame(() => {
    if (groupRef.current && !isMobile) {
      const mouseInfluence = { x: mousePosition.x * 0.15, y: mousePosition.y * 0.15 };
      groupRef.current.rotation.x += (-mouseInfluence.y - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (-mouseInfluence.x - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.z = scrollProgress * 0.5;
    }
  });

  // ✅ OPTIMIZACIÓN DE RENDIMIENTO APLICADA AQUÍ
  const materialConfig = useMemo(() => ({
    background: backgroundTexture,
    // Reducimos drásticamente la resolución y los samples
    resolution: isMobile ? 256 : 512,
    samples: isMobile ? 2 : 4,
    // Mantenemos el resto de propiedades
    transmission: 1,
    roughness: 0,
    thickness: 0.2,
    ior: 1.5,
    chromaticAberration: 0.1,
    anisotropy: 0.1,
    distortion: 0.1,
    distortionScale: 0.2,
    temporalDistortion: 0.0,
    color: '#FF5741'
  }), [isMobile, backgroundTexture]);

  return (
    <group ref={groupRef} scale={0.7} position={[0, 0, 0.7]}>
      {optimizedMeshData.map((data) => (
        <AnimatedMesh key={data.mesh.uuid} meshData={data} isMobile={isMobile} mousePosition={mousePosition} scrollProgress={scrollProgress} materialConfig={materialConfig} />
      ))}
    </group>
  );
}

const TextElements = React.memo(() => {
    const fontSemibold = "/fonts/ClashDisplay-Semibold.ttf";
    const { viewport, size } = useThree();
    const isMobile = useMemo(() => size.width < 640, [size.width]);
    const textConfig = useMemo(() => ({ scale: 1, desktopOffsetX: 1.11, mobileOffsetX: 1.4 }), []);
    const viewportConfig = useMemo(() => ({ leftMargin: -viewport.width / 2 }), [viewport.width]);
    const fontSizes = useMemo(() => ({ mobileFontSize: 0.55 * textConfig.scale, desktopFontSize: 0.75 * textConfig.scale }), [textConfig.scale]);
    const spacing = useMemo(() => ({ mobileVerticalGap: 0.45, desktopVerticalGap: 0.7 }), []);
  
    if (isMobile) {
      const mobileTextGap = spacing.mobileVerticalGap * textConfig.scale;
      const lasTextOffset = textConfig.mobileOffsetX * textConfig.scale;
      return (
        <>
          <Text position={[viewportConfig.leftMargin, 1.05, 0]} color="#B6BCC7" textAlign="left" anchorX="left" anchorY="middle" font={fontSemibold} fontSize={fontSizes.mobileFontSize} whiteSpace="nowrap">ROMPE-</Text>
          <Text position={[viewportConfig.leftMargin, 1.05 - mobileTextGap, 0]} color="#B6BCC7" textAlign="left" anchorX="left" anchorY="middle" font={fontSemibold} fontSize={fontSizes.mobileFontSize} whiteSpace="nowrap">MOS</Text>
          <Text position={[viewportConfig.leftMargin + lasTextOffset, 1.05 - mobileTextGap, 0]} color="#FF5741" textAlign="left" anchorX="left" anchorY="middle" font={fontSemibold} fontSize={fontSizes.mobileFontSize} whiteSpace="nowrap">LAS</Text>
          <Text position={[viewportConfig.leftMargin, 1.05 - mobileTextGap * 2, 0]} color="#FF5741" textAlign="left" anchorX="left" anchorY="middle" font={fontSemibold} fontSize={fontSizes.mobileFontSize} whiteSpace="nowrap">REGLAS</Text>
        </>
      );
    }
    const secondTextOffset = textConfig.desktopOffsetX * textConfig.scale;
    const verticalGap = spacing.desktopVerticalGap * textConfig.scale;
    return (
      <>
        <Text position={[viewportConfig.leftMargin, verticalGap, 0]} color="#B6BCC7" textAlign="left" anchorX="left" anchorY="middle" font={fontSemibold} fontSize={fontSizes.desktopFontSize} whiteSpace="nowrap">ROMPEMOS</Text>
        <Text position={[viewportConfig.leftMargin + secondTextOffset, 0, 0]} color="#B6BCC7" textAlign="left" anchorX="left" anchorY="middle" font={fontSemibold} fontSize={fontSizes.desktopFontSize} whiteSpace="nowrap">LAS REGLAS</Text>
      </>
    );
});

function SceneOrchestrator() {
  const fbo = useFBO();
  const virtualScene = useMemo(() => new Scene(), []);
  const virtualCam = useRef<OrthographicCamera>(null!);
  const { camera, size } = useThree();
  const lastCamPos = useRef(new Vector3());
  const lastCamQuat = useRef(new Quaternion());

  useMemo(() => {
    virtualCam.current = new OrthographicCamera(size.width / -2, size.width / 2, size.height / 2, size.height / -2, 0.1, 1000);
    virtualCam.current.position.z = 5;
  }, [size]);

  useFrame((state) => {
    const camMoved = !lastCamPos.current.equals(camera.position) || !lastCamQuat.current.equals(camera.quaternion);
    if (camMoved) {
      virtualCam.current.position.copy(camera.position);
      virtualCam.current.quaternion.copy(camera.quaternion);
      state.gl.setRenderTarget(fbo);
      state.gl.render(virtualScene, virtualCam.current);
      state.gl.setRenderTarget(null);
      lastCamPos.current.copy(camera.position);
      lastCamQuat.current.copy(camera.quaternion);
    }
  });

  return (
    <>
      {createPortal(<TextElements />, virtualScene)}
      <TextElements />
      <Model backgroundTexture={fbo.texture} />
    </>
  );
}

export default function HeroBackground() {
  const [viewportSize, setViewportSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [isReadyToRender, setIsReadyToRender] = useState(false);

  const checkViewportSize = useCallback(
    debounce(() => {
      const width = window.innerWidth;
      const newSize = width < 640 ? 'mobile' : width <= 1023 ? 'tablet' : 'desktop';
      if (newSize !== viewportSize) {
        setViewportSize(newSize);
      }
    }, 100),
    [viewportSize]
  );

  useEffect(() => {
    checkViewportSize();
    const timer = setTimeout(() => setIsReadyToRender(true), 150);
    window.addEventListener('resize', checkViewportSize, { passive: true });
    return () => {
      window.removeEventListener('resize', checkViewportSize);
      clearTimeout(timer);
    };
  }, [checkViewportSize]);

  const heightClass = useMemo(() => { switch (viewportSize) { case 'mobile': return 'h-[600px]'; case 'tablet': return 'h-[500px]'; default: return 'h-full'; } }, [viewportSize]);
  const globalStyles = useMemo(() => `@font-face { font-family: 'ClashDisplay-Regular'; src: url('/fonts/ClashDisplay-Regular.ttf') format('truetype'); font-weight: normal; font-style: normal; font-display: swap; } @font-face { font-family: 'ClashDisplay-Semibold'; src: url('/fonts/ClashDisplay-Semibold.ttf') format('truetype'); font-weight: 600; font-style: normal; font-display: swap; }`, []);

  if (!isReadyToRender) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
        <div className={`${heightClass} bg-black flex items-center justify-center`}>
          <div className="animate-pulse">
            <div className="w-32 h-8 bg-gray-800 rounded mb-4"></div>
            <div className="w-48 h-8 bg-gray-800 rounded"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <link rel="preload" href="/models/break.glb" as="fetch" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/ClashDisplay-Semibold.ttf" as="font" type="font/truetype" crossOrigin="" />
      </Head>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div className={`inset-0 w-full -z-10 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 ${heightClass}`}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }} className="w-full h-full" frameloop="always" performance={{ min: 0.5 }} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 2]} intensity={1.5} color="#FF5741" />
          <pointLight position={[0, 0, 5]} intensity={1.5} color="#FF5741" distance={20} decay={1} />
          <Suspense fallback={<OptimizedLoader />}>
            <SceneOrchestrator />
            <Environment preset="city" />
            <Preload all />
          </Suspense>
          <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
        </Canvas>
      </div>
    </>
  );
}