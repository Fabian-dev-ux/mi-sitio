'use client';

import React, { useRef, Suspense, useEffect, useState, useMemo, ReactNode, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  useGLTF,
  MeshTransmissionMaterial,
  Text
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

// Throttle utility para event listeners
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

// Debounce para resize events
const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout;
  return function(this: any, ...args: any[]) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

// Definición de tipos para las configuraciones de malla
interface MeshConfig {
  desktop: {
    positionOffset: [number, number, number];
    scaleMultiplier: [number, number, number];
    rotation: { x: number; y: number; z: number };
  };
  mobile: {
    positionOffset: [number, number, number];
    scaleMultiplier: [number, number, number];
    visible: boolean;
    rotation: { x: number; y: number; z: number };
  };
}

// Hook personalizado para configuraciones de malla
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

// Model component optimizado para mobile
function Model() {
  const gltf = useGLTF('/models/break.glb');
  const groupRef = useRef<Group>(null);
  const materialRef = useRef<any>(null);
  const [meshes, setMeshes] = useState<Mesh[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Estados con throttling - solo mouse para desktop, solo scroll para mobile
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  // Get viewport dimensions and determine if mobile
  const { viewport, size } = useThree();
  const isMobile = size.width < 640;

  // Usar hook personalizado para configuraciones
  const meshConfigs = useMeshConfigs();

  // Store original mesh data for restoration
  const originalMeshData = useRef<{
    mesh: Mesh;
    position: Vector3;
    scale: Vector3;
    rotation: Euler;
  }[]>([]);

  // Callbacks memoizados para event listeners - SOLO para desktop
  const updateMousePosition = useCallback(
    throttle((e: MouseEvent) => {
      if (isMobile) return; // Skip en mobile
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1)
      });
    }, 16), // ~60fps
    [isMobile]
  );

  // Callback de scroll - SOLO para desktop
  const updateScrollProgress = useCallback(
    throttle(() => {
      if (isMobile) return; // Skip en mobile
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
      setScrollProgress(progress);
    }, 16), // ~60fps
    [isMobile]
  );

  // Initialize meshes and apply material
  useEffect(() => {
    if (gltf.scene && materialRef.current) {
      const foundMeshes: Mesh[] = [];

      // Get all meshes and apply material
      gltf.scene.traverse((child: Object3D) => {
        if ((child as Mesh).isMesh) {
          const mesh = child as Mesh;
          // Store original data in a ref to maintain across renders
          originalMeshData.current.push({
            mesh,
            position: mesh.position.clone(),
            scale: mesh.scale.clone(),
            rotation: mesh.rotation.clone()
          });

          // Apply material
          mesh.material = materialRef.current!;
          foundMeshes.push(mesh);
        }
      });

      // Keep only up to 5 meshes
      setMeshes(foundMeshes.slice(0, Math.min(5, foundMeshes.length)));
      setInitialized(true);
    }

    // Cleanup function to restore original positions and scales
    return () => {
      if (originalMeshData.current.length > 0) {
        originalMeshData.current.forEach(data => {
          data.mesh.position.copy(data.position);
          data.mesh.scale.copy(data.scale);
          data.mesh.rotation.copy(data.rotation);
        });
      }
    };
  }, [gltf.scene]);

  // Reset meshes to original position when component unmounts or page changes
  useEffect(() => {
    // Function to reset all meshes to their original positions
    const resetMeshes = () => {
      if (originalMeshData.current.length > 0) {
        originalMeshData.current.forEach(data => {
          data.mesh.position.copy(data.position);
          data.mesh.scale.copy(data.scale);
          data.mesh.rotation.copy(data.rotation);
        });
      }
    };

    // Add event listeners for page visibility changes
    document.addEventListener('visibilitychange', resetMeshes);
    window.addEventListener('beforeunload', resetMeshes);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('visibilitychange', resetMeshes);
      window.removeEventListener('beforeunload', resetMeshes);
      resetMeshes();
    };
  }, []);

  // Event listeners optimizados - SOLO para desktop
  useEffect(() => {
    if (!isMobile) {
      window.addEventListener('mousemove', updateMousePosition);
      return () => window.removeEventListener('mousemove', updateMousePosition);
    }
  }, [updateMousePosition, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      updateScrollProgress();
      window.addEventListener('scroll', updateScrollProgress);
      return () => window.removeEventListener('scroll', updateScrollProgress);
    }
  }, [updateScrollProgress, isMobile]);

  // Animation loop optimizado - lógica separada para mobile vs desktop
  useFrame(() => {
    if (!initialized || meshes.length === 0) return;

    // Animate each mesh
    meshes.forEach((mesh, index) => {
      if (!mesh || index >= meshConfigs.length) return;

      // Get the appropriate config based on device
      const config = isMobile ? meshConfigs[index].mobile : meshConfigs[index].desktop;

      // Set visibility for mobile
      if (isMobile) {
        const mobileConfig = config as MeshConfig['mobile'];
        mesh.visible = mobileConfig.visible;
        if (!mesh.visible) return;
      } else {
        mesh.visible = true;
      }

      // Get original values from the stored ref
      const originalData = originalMeshData.current.find(data => data.mesh === mesh);
      if (!originalData) return;

      const origPos = originalData.position;
      const origScale = originalData.scale;

      // Get rotation config based on device
      const rotationConfig = config.rotation;

      // Apply automatic rotation for all devices
      mesh.rotation.x += rotationConfig.x;
      mesh.rotation.y += rotationConfig.y;
      mesh.rotation.z += rotationConfig.z;

      if (isMobile) {
        // ===== MOBILE: Solo rotación automática, posición y escala fijas =====
        mesh.position.set(
          origPos.x + config.positionOffset[0],
          origPos.y + config.positionOffset[1],
          origPos.z + config.positionOffset[2]
        );

        mesh.scale.set(
          origScale.x * config.scaleMultiplier[0],
          origScale.y * config.scaleMultiplier[1],
          origScale.z * config.scaleMultiplier[2]
        );
      } else {
        // ===== DESKTOP: Todas las animaciones (mouse + scroll) =====
        
        // Add mouse-influenced rotation
        const uniqueFactor = 0.03 + (index * 0.01);
        const targetRotationX = mesh.rotation.x - (mousePosition.y * uniqueFactor);
        const targetRotationY = mesh.rotation.y + (mousePosition.x * uniqueFactor);

        // Smooth interpolation
        mesh.rotation.x += (targetRotationX - mesh.rotation.x) * 0.1;
        mesh.rotation.y += (targetRotationY - mesh.rotation.y) * 0.1;

        // Pre-calculate scroll-based values
        const zScrollFactor = 30 + (index * 4);
        const zOffset = scrollProgress * zScrollFactor;

        const xDispersionFactor = (index % 2 === 0 ? 1 : -1) * scrollProgress * (index + 1) * 4;
        const yDispersionFactor = ((index % 3) - 1) * scrollProgress * (index + 1) * 3;

        // Apply position with scroll effects
        mesh.position.set(
          origPos.x + config.positionOffset[0] + xDispersionFactor,
          origPos.y + config.positionOffset[1] + yDispersionFactor,
          origPos.z + config.positionOffset[2] + zOffset
        );

        // Apply scale with scroll factor
        const scaleFactor = 1 + (scrollProgress * 1.2);
        mesh.scale.set(
          origScale.x * config.scaleMultiplier[0] * scaleFactor,
          origScale.y * config.scaleMultiplier[1] * scaleFactor,
          origScale.z * config.scaleMultiplier[2] * scaleFactor
        );
      }
    });

    // Rotate the group based on mouse position - SOLO DESKTOP
    if (groupRef.current && !isMobile) {
      const mouseInfluence = {
        x: mousePosition.x * 0.15,
        y: mousePosition.y * 0.15
      };
      
      const targetRotationX = -mouseInfluence.y;
      const targetRotationY = -mouseInfluence.x;

      groupRef.current.rotation.x += (targetRotationX - groupRef.current.rotation.x) * 0.05;
      groupRef.current.rotation.y += (targetRotationY - groupRef.current.rotation.y) * 0.05;
      groupRef.current.rotation.z = scrollProgress * 0.5;
    }
  });

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
          samples={4}
          resolution={1080}
          anisotropicBlur={0.05}
          temporalDistortion={0.05}
        />
      </mesh>
    </>
  );
}

// Preload del modelo para evitar loading issues
useGLTF.preload('/models/break.glb');

// Definición de tipos para las referencias de texto
type TextRef = React.RefObject<Mesh<BufferGeometry, Material | Material[]>>;

// TextElements optimizado con mejor gestión de state
const TextElements = React.memo(() => {
  const fontSemibold = "/fonts/ClashDisplay-Semibold.ttf";
  const { viewport, size } = useThree();
  const isMobile = size.width < 640;

  // Referencias para medir el ancho del texto
  const rompeRef = useRef<Mesh>(null);
  const mosRef = useRef<Mesh>(null);
  const lasRef = useRef<Mesh>(null);
  const reglasRef = useRef<Mesh>(null);
  const rompemosRef = useRef<Mesh>(null);
  const lasReglasRef = useRef<Mesh>(null);

  // Estado para configuración de texto
  const [textConfig, setTextConfig] = useState({
    scale: 1,
    desktopOffsetX: 1.11,
    mobileOffsetX: 1.4
  });

  // Cálculos memoizados para viewport
  const viewportConfig = useMemo(() => {
    const leftEdge = -viewport.width / 2;
    const safeMargin = 0.0;
    const leftMargin = leftEdge + safeMargin;
    const availableWidth = viewport.width - (safeMargin * 2);
    
    return { leftEdge, safeMargin, leftMargin, availableWidth };
  }, [viewport.width]);

  // Calculamos tamaños de fuente escalados
  const fontSizes = useMemo(() => ({
    mobileFontSize: 0.55 * textConfig.scale,
    desktopFontSize1: 0.75 * textConfig.scale,
    desktopFontSize2: 0.75 * textConfig.scale
  }), [textConfig.scale]);

  // Espaciado vertical base que se escalará
  const spacing = useMemo(() => ({
    baseVerticalGapMobile: 0.45,
    baseVerticalGapDesktop: 0.7
  }), []);

  if (isMobile) {
    const mobileTextGap = spacing.baseVerticalGapMobile * textConfig.scale;
    const lasHorizontalSpacing = 1;
    const lasTextOffset = textConfig.mobileOffsetX * textConfig.scale * lasHorizontalSpacing;

    return (
      <>
        <Text
          ref={rompeRef}
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
          ref={mosRef}
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
          ref={lasRef}
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
          ref={reglasRef}
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
          ref={rompemosRef}
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
          ref={lasReglasRef}
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

// Loader simplificado
const Loader = React.memo(() => {
  return (
    <mesh>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#444444" wireframe />
    </mesh>
  );
});

// Componente principal optimizado
export default function HeroBackground() {
  const [viewportSize, setViewportSize] = useState('desktop');

  const checkViewportSize = useCallback(
    debounce(() => {
      const width = window.innerWidth;
      if (width < 640) {
        setViewportSize('mobile');
      } else if (width >= 640 && width <= 1023) {
        setViewportSize('tablet');
      } else {
        setViewportSize('desktop');
      }
    }, 100),
    []
  );

  useEffect(() => {
    checkViewportSize();
    window.addEventListener('resize', checkViewportSize);
    return () => window.removeEventListener('resize', checkViewportSize);
  }, [checkViewportSize]);

  // Calculate height class based on viewport size
  const heightClass = useMemo(() => {
    return viewportSize === 'mobile' ? 'h-[600px]' :
           viewportSize === 'tablet' ? 'h-[500px]' : 'h-full';
  }, [viewportSize]);

  // Estilos globales memoizados
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

  return (
    <React.Fragment>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div className={`inset-0 w-full -z-10 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 ${heightClass}`}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          className="w-full h-full"
          frameloop="always"
        >
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 2]} intensity={1.5} color="#FF5741" />
          <pointLight position={[0, 0, 5]} intensity={1.5} color="#FF5741" distance={20} decay={1} />
          <Suspense fallback={<Loader />}>
            <Model />
            <TextElements />
            <Environment preset="city" />
          </Suspense>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate={false}
          />
        </Canvas>
      </div>
    </React.Fragment>
  );
}