'use client';

import React, { useRef, Suspense, useEffect, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  useGLTF,
  MeshTransmissionMaterial,
  Text,
  Preload
} from '@react-three/drei';
import { 
  Group, 
  Mesh, 
  Vector3, 
  Euler, 
  Object3D,
  BufferGeometry,
  Material
} from 'three';
import Head from 'next/head';

// ============= PRECARGAS CRÍTICAS =============
// Precargar inmediatamente el modelo más crítico
useGLTF.preload('/models/break.glb');

// Precargar fuentes de forma async
if (typeof window !== 'undefined') {
  // Precarga asíncrona de fuentes
  const preloadFont = (url: string) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'font';
    link.type = 'font/truetype';
    link.crossOrigin = '';
    document.head.appendChild(link);
  };

  preloadFont('/fonts/ClashDisplay-Semibold.ttf');
  preloadFont('/fonts/ClashDisplay-Regular.ttf');
}

// ============= UTILIDADES OPTIMIZADAS =============
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function(this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
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

interface DesktopMeshConfig extends BaseMeshConfig {}

interface MobileMeshConfig extends BaseMeshConfig {
  visible: boolean;
}

interface MeshConfig {
  desktop: DesktopMeshConfig;
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

// ============= HOOKS OPTIMIZADOS =============
const useMeshConfigs = (): MeshConfig[] => {
  return useMemo<MeshConfig[]>(() => [
    {
      desktop: {
        positionOffset: [0.7, 0.3, 1],
        scaleMultiplier: [0.6, 0.6, 0.6],
        rotation: { x: 0.005, y: -0.003, z: 0.002 }
      },
      mobile: {
        positionOffset: [-0.6, -0.2, 1],
        scaleMultiplier: [0.7, 0.7, 0.7],
        visible: true,
        rotation: { x: 0.005, y: -0.003, z: 0.002 }
      }
    },
    {
      desktop: {
        positionOffset: [0, -0.1, -4],
        scaleMultiplier: [0.6, 0.6, 0.6],
        rotation: { x: -0.002, y: 0.005, z: -0.001 }
      },
      mobile: {
        positionOffset: [3.2, 3.5, 1],
        scaleMultiplier: [0.4, 0.4, 0.4],
        visible: true,
        rotation: { x: -0.002, y: 0.005, z: -0.001 }
      }
    },
    {
      desktop: {
        positionOffset: [1.5, 1.4, -4],
        scaleMultiplier: [0.5, 0.5, 0.5],
        rotation: { x: 0.003, y: -0.004, z: 0.002 }
      },
      mobile: {
        positionOffset: [-1.8, -3.1, 1],
        scaleMultiplier: [0.3, 0.3, 0.3],
        visible: true,
        rotation: { x: 0.003, y: -0.004, z: 0.002 }
      }
    },
    {
      desktop: {
        positionOffset: [2, -0.4, 1],
        scaleMultiplier: [0.3, 0.3, 0.5],
        rotation: { x: -0.003, y: 0.002, z: 0.004 }
      },
      mobile: {
        positionOffset: [0, 0, 0],
        scaleMultiplier: [0, 0, 0],
        visible: false,
        rotation: { x: -0.003, y: 0.002, z: 0.004 }
      }
    },
    {
      desktop: {
        positionOffset: [0.4, 0.5, 1],
        scaleMultiplier: [0.4, 0.4, 0.4],
        rotation: { x: 0.002, y: -0.001, z: 0.003 }
      },
      mobile: {
        positionOffset: [0, 0, 0],
        scaleMultiplier: [0, 0, 0],
        visible: false,
        rotation: { x: 0.002, y: -0.001, z: 0.003 }
      }
    }
  ], []);
};

// ============= COMPONENTES =============

// Loader mejorado con menos geometría
const OptimizedLoader = React.memo(() => (
  <mesh>
    <boxGeometry args={[0.5, 0.5, 0.5]} />
    <meshBasicMaterial color="#FF5741" wireframe />
  </mesh>
));

// Componente para manejar las precargas
const PreloadManager = React.memo(() => {
  useEffect(() => {
    // Precarga adicional para recursos de Three.js
    const preloadResources = async () => {
      try {
        // Forzar la carga del modelo si no está cargado
        await useGLTF.preload('/models/break.glb');
        
        // Precarga del environment preset
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            // Precarga en tiempo idle
          });
        }
      } catch (error) {
        console.warn('Error precargando recursos:', error);
      }
    };

    preloadResources();
  }, []);

  return null;
});

// Model component con mejor manejo de errores
function Model() {
  const gltf = useGLTF('/models/break.glb');
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<any>(null);
  
  const [optimizedMeshData, setOptimizedMeshData] = useState<OptimizedMeshData[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  const { viewport, size } = useThree();
  const isMobile = useMemo(() => size.width < 640, [size.width]);
  const meshConfigs = useMeshConfigs();

  const animationConstants = useMemo(() => ({
    mouseInfluenceDesktop: 0.15,
    rotationLerpFactor: 0.05,
    mouseRotationLerpFactor: 0.1,
    scrollZBaseFactor: 30,
    scrollZIncrementFactor: 4,
    scrollDispersionBaseFactor: 4,
    scrollScaleFactor: 1.2
  }), []);

  const updateMousePosition = useCallback(
    throttle((e: MouseEvent) => {
      if (isMobile) return;
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1)
      });
    }, 16),
    [isMobile]
  );

  const updateScrollProgress = useCallback(
    throttle(() => {
      if (isMobile) return;
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.min(Math.max(scrollTop / scrollHeight, 0), 1) : 0;
      setScrollProgress(progress);
    }, 16),
    [isMobile]
  );

  useEffect(() => {
    if (!gltf.scene || !materialRef.current) return;

    const meshDataArray: OptimizedMeshData[] = [];
    let meshIndex = 0;

    gltf.scene.traverse((child: Object3D) => {
      if ((child as Mesh).isMesh && meshIndex < meshConfigs.length) {
        const mesh = child as Mesh;
        
        meshDataArray.push({
          mesh,
          originalPosition: mesh.position.clone(),
          originalScale: mesh.scale.clone(),
          originalRotation: mesh.rotation.clone(),
          config: meshConfigs[meshIndex],
          index: meshIndex
        });

        mesh.material = materialRef.current;
        meshIndex++;
      }
    });

    setOptimizedMeshData(meshDataArray);
    setInitialized(true);

    return () => {
      meshDataArray.forEach(data => {
        data.mesh.position.copy(data.originalPosition);
        data.mesh.scale.copy(data.originalScale);
        data.mesh.rotation.copy(data.originalRotation);
      });
    };
  }, [gltf.scene, meshConfigs]);

  useEffect(() => {
    if (isMobile) return;

    const cleanup = () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('scroll', updateScrollProgress);
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    return cleanup;
  }, [updateMousePosition, updateScrollProgress, isMobile]);

  useEffect(() => {
    const resetMeshes = () => {
      optimizedMeshData.forEach(data => {
        data.mesh.position.copy(data.originalPosition);
        data.mesh.scale.copy(data.originalScale);
        data.mesh.rotation.copy(data.originalRotation);
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) resetMeshes();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', resetMeshes);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', resetMeshes);
      resetMeshes();
    };
  }, [optimizedMeshData]);

  useFrame(() => {
    if (!initialized || optimizedMeshData.length === 0) return;

    optimizedMeshData.forEach((data) => {
      const { mesh, originalPosition, originalScale, config, index } = data;
      const activeConfig = isMobile ? config.mobile : config.desktop;

      if (isMobile) {
        mesh.visible = config.mobile.visible;
        if (!mesh.visible) return;
      } else {
        mesh.visible = true;
      }

      const { rotation: rotConfig } = activeConfig;

      mesh.rotation.x += rotConfig.x;
      mesh.rotation.y += rotConfig.y;
      mesh.rotation.z += rotConfig.z;

      if (isMobile) {
        mesh.position.set(
          originalPosition.x + activeConfig.positionOffset[0],
          originalPosition.y + activeConfig.positionOffset[1],
          originalPosition.z + activeConfig.positionOffset[2]
        );

        mesh.scale.set(
          originalScale.x * activeConfig.scaleMultiplier[0],
          originalScale.y * activeConfig.scaleMultiplier[1],
          originalScale.z * activeConfig.scaleMultiplier[2]
        );
      } else {
        const uniqueFactor = 0.03 + (index * 0.01);
        const targetRotX = mesh.rotation.x - (mousePosition.y * uniqueFactor);
        const targetRotY = mesh.rotation.y + (mousePosition.x * uniqueFactor);

        mesh.rotation.x += (targetRotX - mesh.rotation.x) * animationConstants.mouseRotationLerpFactor;
        mesh.rotation.y += (targetRotY - mesh.rotation.y) * animationConstants.mouseRotationLerpFactor;

        const zOffset = scrollProgress * (animationConstants.scrollZBaseFactor + (index * animationConstants.scrollZIncrementFactor));
        const xDispersion = (index % 2 === 0 ? 1 : -1) * scrollProgress * (index + 1) * animationConstants.scrollDispersionBaseFactor;
        const yDispersion = ((index % 3) - 1) * scrollProgress * (index + 1) * 3;
        const scaleFactor = 1 + (scrollProgress * animationConstants.scrollScaleFactor);

        mesh.position.set(
          originalPosition.x + activeConfig.positionOffset[0] + xDispersion,
          originalPosition.y + activeConfig.positionOffset[1] + yDispersion,
          originalPosition.z + activeConfig.positionOffset[2] + zOffset
        );

        mesh.scale.set(
          originalScale.x * activeConfig.scaleMultiplier[0] * scaleFactor,
          originalScale.y * activeConfig.scaleMultiplier[1] * scaleFactor,
          originalScale.z * activeConfig.scaleMultiplier[2] * scaleFactor
        );
      }
    });

    if (groupRef.current && !isMobile) {
      const mouseInfluence = {
        x: mousePosition.x * animationConstants.mouseInfluenceDesktop,
        y: mousePosition.y * animationConstants.mouseInfluenceDesktop
      };
      
      const targetRotX = -mouseInfluence.y;
      const targetRotY = -mouseInfluence.x;

      groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * animationConstants.rotationLerpFactor;
      groupRef.current.rotation.y += (targetRotY - groupRef.current.rotation.y) * animationConstants.rotationLerpFactor;
      groupRef.current.rotation.z = scrollProgress * 0.5;
    }
  });

  const materialConfig = useMemo(() => (
    isMobile 
      ? { samples: 1, resolution: 720 }
      : { samples: 3, resolution: 1080 }
  ), [isMobile]);

  return (
    <>
      <primitive
        ref={groupRef}
        object={gltf.scene}
        scale={0.7}
        position={[0, 0, 0.7]}
      />
      <mesh visible={false} position={[0, 0, -10]} renderOrder={-1}>
        <sphereGeometry args={[0.01, 4, 4]} />
        <MeshTransmissionMaterial
          ref={materialRef}
          thickness={0.1}
          roughness={0.1}
          transmission={1}
          ior={1.75}
          chromaticAberration={1}
          backside={false}
          color="#FF5741"
          samples={materialConfig.samples}
          resolution={materialConfig.resolution}
          anisotropicBlur={0.05}
          temporalDistortion={0.05}
        />
      </mesh>
    </>
  );
}

const TextElements = React.memo(() => {
  const fontSemibold = "/fonts/ClashDisplay-Semibold.ttf";
  const { viewport, size } = useThree();
  const isMobile = useMemo(() => size.width < 640, [size.width]);

  const textConfig = useMemo(() => ({
    scale: 1,
    desktopOffsetX: 1.11,
    mobileOffsetX: 1.4
  }), []);

  const viewportConfig = useMemo(() => {
    const leftEdge = -viewport.width / 2;
    const safeMargin = 0.0;
    const leftMargin = leftEdge + safeMargin;
    
    return { leftMargin };
  }, [viewport.width]);

  const fontSizes = useMemo(() => ({
    mobileFontSize: 0.55 * textConfig.scale,
    desktopFontSize1: 0.75 * textConfig.scale,
    desktopFontSize2: 0.75 * textConfig.scale
  }), [textConfig.scale]);

  const spacing = useMemo(() => ({
    baseVerticalGapMobile: 0.45,
    baseVerticalGapDesktop: 0.7
  }), []);

  if (isMobile) {
    const mobileTextGap = spacing.baseVerticalGapMobile * textConfig.scale;
    const lasTextOffset = textConfig.mobileOffsetX * textConfig.scale;

    return (
      <>
        <Text
          position={[viewportConfig.leftMargin, 1.05, 0]}
          color="#B6BCC7"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={fontSizes.mobileFontSize}
          whiteSpace="nowrap"
        >
          ROMPE-
        </Text>
        <Text
          position={[viewportConfig.leftMargin, 1.05 - mobileTextGap, 0]}
          color="#B6BCC7"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={fontSizes.mobileFontSize}
          whiteSpace="nowrap"
        >
          MOS
        </Text>
        <Text
          position={[viewportConfig.leftMargin + lasTextOffset, 1.05 - mobileTextGap, 0]}
          color="#FF5741"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={fontSizes.mobileFontSize}
          whiteSpace="nowrap"
        >
          LAS
        </Text>
        <Text
          position={[viewportConfig.leftMargin, 1.05 - (mobileTextGap * 2), 0]}
          color="#FF5741"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={fontSizes.mobileFontSize}
          whiteSpace="nowrap"
        >
          REGLAS
        </Text>
      </>
    );
  } else {
    const secondTextOffset = textConfig.desktopOffsetX * textConfig.scale;
    const verticalGap = spacing.baseVerticalGapDesktop * textConfig.scale;

    return (
      <>
        <Text
          position={[viewportConfig.leftMargin, verticalGap, 0]}
          color="#B6BCC7"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={fontSizes.desktopFontSize1}
          whiteSpace="nowrap"
        >
          ROMPEMOS
        </Text>
        <Text
          position={[viewportConfig.leftMargin + secondTextOffset, 0, 0]}
          color="#B6BCC7"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={fontSizes.desktopFontSize2}
          whiteSpace="nowrap"
        >
          LAS REGLAS
        </Text>
      </>
    );
  }
});

// ============= COMPONENTE PRINCIPAL =============
export default function HeroBackground() {
  const [viewportSize, setViewportSize] = useState('desktop');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showFallback, setShowFallback] = useState(true);

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
    setIsInitialized(true);
    
    // Ocultar fallback después de un tiempo mínimo
    const timer = setTimeout(() => setShowFallback(false), 100);
    
    window.addEventListener('resize', checkViewportSize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', checkViewportSize);
      clearTimeout(timer);
    };
  }, [checkViewportSize]);

  const heightClass = useMemo(() => {
    switch (viewportSize) {
      case 'mobile': return 'h-[600px]';
      case 'tablet': return 'h-[500px]';
      default: return 'h-full';
    }
  }, [viewportSize]);

  const globalStyles = useMemo(() => `
    @font-face {
      font-family: 'ClashDisplay-Regular';
      src: url('/fonts/ClashDisplay-Regular.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
    
    @font-face {
      font-family: 'ClashDisplay-Semibold';
      src: url('/fonts/ClashDisplay-Semibold.ttf') format('truetype');
      font-weight: 600;
      font-style: normal;
      font-display: swap;
    }
  `, []);

  // Fallback mejorado mientras carga
  if (!isInitialized || showFallback) {
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
        {/* Precarga crítica de recursos */}
        <link
          rel="preload"
          href="/models/break.glb"
          as="fetch"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/ClashDisplay-Semibold.ttf"
          as="font"
          type="font/truetype"
          crossOrigin=""
        />
      </Head>
      
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      
      <div className={`inset-0 w-full -z-10 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 ${heightClass}`}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          className="w-full h-full"
          frameloop={isInitialized ? "always" : "never"}
          performance={{ min: 0.5 }}
          gl={{ 
            antialias: false,
            powerPreference: "high-performance"
          }}
        >
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 2]} intensity={1.5} color="#FF5741" />
          <pointLight position={[0, 0, 5]} intensity={1.5} color="#FF5741" distance={20} decay={1} />
          
          <Suspense fallback={<OptimizedLoader />}>
            <PreloadManager />
            <Model />
            <TextElements />
            <Environment preset="city" />
            <Preload all />
          </Suspense>
          
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
          />
        </Canvas>
      </div>
    </>
  );
}