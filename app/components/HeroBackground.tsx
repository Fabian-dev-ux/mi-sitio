import React, { useRef, Suspense, useEffect, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, MeshTransmissionMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';

// Model component that loads and renders the 3D model
// Model component that loads and renders the 3D model
function Model() {
  const gltf = useGLTF('/models/break.glb');
  const groupRef = useRef();
  const materialRef = useRef();
  
  // Meshes and configuration state
  const [meshes, setMeshes] = useState([]);
  const [initialized, setInitialized] = useState(false);
  
  // Mouse and scroll position state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Get viewport dimensions and determine if mobile
  const { viewport, size } = useThree();
  const isMobile = size.width < 640;
  
  // Define mesh configurations using useMemo to prevent recreation
  const meshConfigs = useMemo(() => [
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

  // Store original mesh data for restoration
  const originalMeshData = useRef([]);

  // Initialize meshes and apply material
  useEffect(() => {
    if (gltf.scene && materialRef.current) {
      const foundMeshes = [];
      
      // Get all meshes and apply material
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          // Store original data in a ref to maintain across renders
          originalMeshData.current.push({
            mesh: child,
            position: child.position.clone(),
            scale: child.scale.clone(),
            rotation: child.rotation.clone()
          });
          
          // Apply material
          child.material = materialRef.current;
          foundMeshes.push(child);
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

  // Mouse movement listener
  useEffect(() => {
    const updateMousePosition = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -((e.clientY / window.innerHeight) * 2 - 1)
      });
    };
    
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  // Scroll listener
  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = Math.min(Math.max(scrollTop / scrollHeight, 0), 1);
      setScrollProgress(progress);
    };
    
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress);
    return () => window.removeEventListener('scroll', updateScrollProgress);
  }, []);

  // Animation loop
  useFrame(() => {
    if (!initialized || meshes.length === 0) return;
    
    // Animate each mesh
    meshes.forEach((mesh, index) => {
      if (!mesh || index >= meshConfigs.length) return;
      
      // Get the appropriate config based on device
      const config = isMobile ? meshConfigs[index].mobile : meshConfigs[index].desktop;
      
      // Set visibility for mobile
      if (isMobile) {
        mesh.visible = config.visible;
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
      
      // Add mouse-influenced rotation only for desktop
      if (!isMobile) {
        const uniqueFactor = 0.03 + (index * 0.01);
        const targetRotationX = mesh.rotation.x - (mousePosition.y * uniqueFactor);
        const targetRotationY = mesh.rotation.y + (mousePosition.x * uniqueFactor);
        
        // Smooth interpolation
        mesh.rotation.x += (targetRotationX - mesh.rotation.x) * 0.1;
        mesh.rotation.y += (targetRotationY - mesh.rotation.y) * 0.1;
      }
      
      // Calculate scroll-based transformations
      const zScrollFactor = 30 + (index * 4);
      const zOffset = scrollProgress * zScrollFactor;
      
      const xDispersionFactor = (index % 2 === 0 ? 1 : -1) * scrollProgress * (index + 1) * 4;
      const yDispersionFactor = ((index % 3) - 1) * scrollProgress * (index + 1) * 3;
      
      // Apply position
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
    });
    
    // Rotate the group based on mouse position
    if (groupRef.current) {
      const targetRotationX = -mousePosition.y * 0.15;
      const targetRotationY = -mousePosition.x * 0.15;
      
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

// Make sure to preload the model to avoid loading issues
useGLTF.preload('/models/break.glb');


// Componente TextElements mejorado con escalado responsivo
// Componente TextElements mejorado con escalado responsivo y reversible
// Componente TextElements mejorado con escalado responsivo y reversible
const TextElements = () => {
  const fontSemibold = "/fonts/ClashDisplay-Semibold.ttf";
  const { viewport, size } = useThree();
  // Usamos el tamaño real de la ventana en lugar del viewport de Three.js
  const isMobile = size.width < 640;
  
  // Referencias para medir el ancho del texto
  const rompeRef = useRef();
  const mosRef = useRef();
  const lasRef = useRef();
  const reglasRef = useRef();
  const rompemosRef = useRef();
  const lasReglasRef = useRef();
  
  // Estado para almacenar el factor de escala y posiciones
  const [textConfig, setTextConfig] = useState({
    scale: 1,
    desktopOffsetX: 1.11,
    mobileOffsetX: 1.4
  });
  
  // Valores iniciales para escala base y offsets
  const initialConfig = useMemo(() => ({
    scale: 1, 
    desktopOffsetX: 1.11,
    mobileOffsetX: 1.4
  }), []);
  
  // Calcular el límite izquierdo del área visible con margen de seguridad
  const leftEdge = -viewport.width / 2;
  const safeMargin = 0.0;
  const leftMargin = leftEdge + safeMargin;
  
  // Calcular el ancho disponible (viewport.width menos márgenes de seguridad)
  const availableWidth = viewport.width - (safeMargin * 2);
  
  // Ajustar el tamaño y posición del texto según el espacio disponible
  useFrame(() => {
    // Determinar el ancho total necesario para los textos
    let needsUpdate = false;
    let newScale = textConfig.scale;
    let newDesktopOffsetX = textConfig.desktopOffsetX;
    let newMobileOffsetX = textConfig.mobileOffsetX;
    
    // Intentar restaurar hacia el tamaño original cuando hay espacio
    const shouldTryRestore = viewport.width > 3.5; // Más espacio que el mínimo
    
    if (isMobile) {
      // Obtener anchos actuales de los textos para mobile
      const rompeWidth = rompeRef.current?.geometry.boundingBox.max.x - rompeRef.current?.geometry.boundingBox.min.x || 0;
      const reglasWidth = reglasRef.current?.geometry.boundingBox.max.x - reglasRef.current?.geometry.boundingBox.min.x || 0;
      const lasWidth = lasRef.current?.geometry.boundingBox.max.x - lasRef.current?.geometry.boundingBox.min.x || 0;
      
      // Comprobar si "LAS" + "REGLAS" supera el espacio disponible
      const totalLasReglasWidth = lasWidth + reglasWidth + 0.3; // Añadimos un pequeño margen
      
      // Calcular si el texto "ROMPE-" cabe en el espacio disponible
      const rompeRequiredWidth = rompeWidth + 0.3;
      
      // Calcular espacio necesario para el texto "LAS" en su posición actual
      const lasPosition = leftMargin + newMobileOffsetX * newScale;
      const lasEndPosition = lasPosition + (lasWidth * newScale);
      const rightEdge = leftEdge + viewport.width - safeMargin;
      
      // Determinar el factor de escala óptimo para que todo quepa
      const optimalScale = Math.min(
        availableWidth / Math.max(rompeRequiredWidth, totalLasReglasWidth),
        initialConfig.scale // No aumentar más allá del tamaño original
      );
      
      // Ajustar el offset de "LAS" si es necesario para que no se salga del viewport
      if (lasEndPosition > rightEdge) {
        // Calcular un nuevo offset que mantenga "LAS" dentro del viewport
        const maxOffset = (rightEdge - leftMargin - (lasWidth * optimalScale)) / optimalScale;
        newMobileOffsetX = Math.max(0.8, Math.min(newMobileOffsetX, maxOffset));
        needsUpdate = true;
      } else if (shouldTryRestore) {
        // Intentar restaurar hacia el offset original si hay espacio
        const targetOffset = initialConfig.mobileOffsetX;
        if (Math.abs(newMobileOffsetX - targetOffset) > 0.01) {
          newMobileOffsetX = newMobileOffsetX + (targetOffset - newMobileOffsetX) * 0.1; // Suavizar la transición
          needsUpdate = true;
        }
      }
      
      // Actualizar la escala con un umbral para evitar actualizaciones constantes
      if (Math.abs(optimalScale - newScale) > 0.01) {
        // Si hay más espacio, aumentar gradualmente hacia 1; si hay menos, reducir inmediatamente
        if (optimalScale > newScale) {
          newScale = newScale + (optimalScale - newScale) * 0.1; // Suavizar el aumento
        } else {
          newScale = optimalScale; // Reducción inmediata para evitar desbordamiento
        }
        newScale = Math.max(0.5, newScale); // Limitar la reducción para mantener legibilidad
        needsUpdate = true;
      }
    } else {
      // Para escritorio/tablet
      const rompemosWidth = rompemosRef.current?.geometry.boundingBox.max.x - rompemosRef.current?.geometry.boundingBox.min.x || 0;
      const lasReglasWidth = lasReglasRef.current?.geometry.boundingBox.max.x - lasReglasRef.current?.geometry.boundingBox.min.x || 0;
      
      // Calcular posición del segundo texto con el offset actual
      const secondTextPosition = leftMargin + (newDesktopOffsetX * newScale);
      const secondTextRightEdge = secondTextPosition + (lasReglasWidth * newScale);
      
      // Calcular el borde derecho del viewport
      const rightEdge = leftEdge + viewport.width - safeMargin;
      
      // Verificar si el texto se sale por la derecha
      if (secondTextRightEdge > rightEdge) {
        // Calcular un nuevo offset que mantenga el texto dentro del viewport
        const maxTextWidth = Math.max(rompemosWidth, lasReglasWidth);
        
        // Calcular factor de escala óptimo
        const optimalScale = Math.min(
          (availableWidth - newDesktopOffsetX) / maxTextWidth,
          (availableWidth / 2) / rompemosWidth, // Asegurar que el primer texto quede bien
          initialConfig.scale // No aumentar más allá del tamaño original
        );
        
        // Si el texto sigue sin caber, ajustar el offset
        if (secondTextRightEdge * (optimalScale / newScale) > rightEdge) {
          // Calcular un offset máximo que mantenga el texto dentro
          const maxOffset = Math.max(0.5, (rightEdge - leftMargin - (lasReglasWidth * optimalScale)) / optimalScale);
          newDesktopOffsetX = Math.min(newDesktopOffsetX, maxOffset);
          needsUpdate = true;
        } else if (shouldTryRestore) {
          // Intentar restaurar hacia el offset original si hay espacio
          const targetOffset = initialConfig.desktopOffsetX;
          if (Math.abs(newDesktopOffsetX - targetOffset) > 0.01) {
            newDesktopOffsetX = newDesktopOffsetX + (targetOffset - newDesktopOffsetX) * 0.1; // Suavizar la transición
            needsUpdate = true;
          }
        }
        
        // Actualizar la escala si es necesario
        if (Math.abs(optimalScale - newScale) > 0.01) {
          // Si hay más espacio, aumentar gradualmente; si hay menos, reducir inmediatamente
          if (optimalScale > newScale) {
            newScale = newScale + (optimalScale - newScale) * 0.1; // Suavizar el aumento
          } else {
            newScale = optimalScale; // Reducción inmediata para evitar desbordamiento
          }
          newScale = Math.max(0.5, newScale);
          needsUpdate = true;
        }
      } else if (shouldTryRestore) {
        // Restaurar gradualmente hacia los valores originales si hay suficiente espacio
        const targetScale = initialConfig.scale; 
        const targetOffset = initialConfig.desktopOffsetX;
        
        // Verificar si el texto cabe con los valores restaurados
        const projectedRightEdge = leftMargin + (targetOffset * targetScale) + (lasReglasWidth * targetScale);
        
        if (projectedRightEdge < rightEdge) {
          // Hay suficiente espacio para restaurar gradualmente
          if (Math.abs(newScale - targetScale) > 0.01) {
            newScale = newScale + (targetScale - newScale) * 0.1; // Suavizar la transición
            needsUpdate = true;
          }
          
          if (Math.abs(newDesktopOffsetX - targetOffset) > 0.01) {
            newDesktopOffsetX = newDesktopOffsetX + (targetOffset - newDesktopOffsetX) * 0.1; // Suavizar la transición
            needsUpdate = true;
          }
        }
      }
    }
    
    // Actualizar la configuración si es necesario
    if (needsUpdate) {
      setTextConfig({
        scale: newScale,
        desktopOffsetX: newDesktopOffsetX,
        mobileOffsetX: newMobileOffsetX
      });
    }
  });
  
  // Calculamos tamaños de fuente escalados
  const mobileFontSize = 0.78 * textConfig.scale;
  const desktopFontSize1 = 0.75 * textConfig.scale;
  const desktopFontSize2 = 0.75 * textConfig.scale;
  
  // Espaciado vertical base que se escalará
  const baseVerticalGapMobile = 0.64;
  const baseVerticalGapDesktop = 0.7; // Espaciado entre ROMPEMOS y LAS REGLAS
  
  if (isMobile) {
    // Posiciones escaladas para mantener la proporción original
    const mobileTextGap = baseVerticalGapMobile * textConfig.scale; // Espacio entre textos que se escala
    
    // MODIFICACIÓN AQUÍ: Reducción del offset de "LAS" para acercarlo a "MOS"
    // Ajusta este multiplicador según la separación deseada (0.7 es más cerca que 1.4)
    const lasHorizontalSpacing = 1.4; // Puedes ajustar este valor entre 0.1 y 1.4 según desees
    const lasTextOffset = textConfig.mobileOffsetX * textConfig.scale * lasHorizontalSpacing;
    
    return (
      <>
        <Text
          ref={rompeRef}
          position={[leftMargin, 1.05, 0]}
          color="#B6BCC7"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={mobileFontSize}
          whiteSpace="nowrap" // Impide el salto de línea
        >
          ROMPE-
        </Text>
        <Text
          ref={mosRef}
          position={[leftMargin, 1.05 - mobileTextGap, 0]}
          color="#B6BCC7"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={mobileFontSize}
          whiteSpace="nowrap" // Impide el salto de línea
        >
          MOS
        </Text>
        <Text
          ref={lasRef}
          position={[leftMargin + lasTextOffset, 1.05 - mobileTextGap, 0]}
          color="#FF5741"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={mobileFontSize}
          whiteSpace="nowrap" // Impide el salto de línea
        >
          LAS
        </Text>
        <Text
          ref={reglasRef}
          position={[leftMargin, 1.05 - (mobileTextGap * 2), 0]}
          color="#FF5741"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={mobileFontSize}
          whiteSpace="nowrap" // Impide el salto de línea
        >
          REGLAS
        </Text>
      </>
    );
  } else {
    // Versión de escritorio con escalado automático y posicionamiento adaptativo
    const secondTextOffset = textConfig.desktopOffsetX * textConfig.scale; // Desplazamiento horizontal ajustado
    const verticalGap = baseVerticalGapDesktop * textConfig.scale; // Espaciado vertical escalado
    
    return (
      <>
        <Text
          ref={rompemosRef}
          position={[leftMargin, verticalGap, 0]}
          color="#B6BCC7"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={desktopFontSize1}
          whiteSpace="nowrap" // Impide el salto de línea
        >
          ROMPEMOS
        </Text>
        <Text
          ref={lasReglasRef}
          position={[leftMargin + secondTextOffset, 0, 0]}
          color="#B6BCC7"
          textAlign="left"
          anchorX="left"
          anchorY="middle"
          font={fontSemibold}
          fontSize={desktopFontSize2}
          whiteSpace="nowrap" // Impide el salto de línea
        >
          LAS REGLAS
        </Text>
      </>
    );
  }
};

// Simple loader component
function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[1, 16, 16]} />
      <meshStandardMaterial color="#444444" wireframe />
    </mesh>
  );
}

// Global styles
const globalStyles = `
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
`;

// Create a React context to persist state between page navigation
const ThreeDStateContext = React.createContext();

export function ThreeDProvider({ children }) {
  const [viewportSize, setViewportSize] = useState('desktop');
  
  useEffect(() => {
    const checkViewportSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setViewportSize('mobile');
      } else if (width >= 640 && width <= 1023) {
        setViewportSize('tablet');
      } else {
        setViewportSize('desktop');
      }
    };
    
    checkViewportSize();
    window.addEventListener('resize', checkViewportSize);
    return () => window.removeEventListener('resize', checkViewportSize);
  }, []);
  
  const value = { viewportSize };
  
  return (
    <ThreeDStateContext.Provider value={value}>
      {children}
    </ThreeDStateContext.Provider>
  );
}

export default function HeroBackground() {
  // Use context or state management if this component is unmounted and remounted
  const [viewportSize, setViewportSize] = useState('desktop');
  
  useEffect(() => {
    const checkViewportSize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setViewportSize('mobile');
      } else if (width >= 640 && width <= 1023) {
        setViewportSize('tablet');
      } else {
        setViewportSize('desktop');
      }
    };
    
    checkViewportSize();
    window.addEventListener('resize', checkViewportSize);
    return () => window.removeEventListener('resize', checkViewportSize);
  }, []);

  // Calculate height class based on viewport size
  const heightClass = viewportSize === 'mobile' ? 'h-[600px]' : 
                      viewportSize === 'tablet' ? 'h-[500px]' : 'h-full';
  
  // Key for Canvas to force remount if needed
  const canvasKey = React.useRef(Math.random().toString()).current;

  return (
    <React.Fragment>
      <style dangerouslySetInnerHTML={{ __html: globalStyles }} />
      <div className={`inset-0 w-full -z-10 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 ${heightClass}`}>
        <Canvas 
          key={canvasKey}
          camera={{ position: [0, 0, 5], fov: 50 }} 
          className="w-full h-full"
          // Force Three.js to maintain state when component is unmounted temporarily
          frameloop="always"
          onCreated={state => {
            // Store the state in window for persistence
            window.__threeState = state;
          }}
        >
          <color attach="background" args={['#000000']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[0, 0, 2]} intensity={1.5} color="#FF5741" distance={20} decay={1} />
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