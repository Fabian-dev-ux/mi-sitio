import React, { useRef, useMemo, useEffect, useState } from 'react'
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { 
  Environment, 
  MeshTransmissionMaterial, 
  Center 
} from '@react-three/drei'
import { Vector2, Vector3, Raycaster, Quaternion, Mesh } from 'three'

// Contexto para compartir la posición del cursor
const CursorContext = React.createContext({ x: 0, y: 0 });

// Model component with realistic crystal effect and cursor tracking
const Model = ({ spinSpeed = 1.5 }) => {
  const gltf = useLoader(GLTFLoader, '/models/a1.glb')
  const { camera, size } = useThree()
  const modelRef = useRef()
  const groupRef = useRef()
  const raycaster = new Raycaster()
  const mouse = new Vector2()
  
  // Referencia al tiempo transcurrido para la animación de rotación
  const timeRef = useRef(0);
  
  // Consumimos el contexto del cursor
  const cursorPosition = React.useContext(CursorContext);
  
  // Set camera position for frontal view
  useMemo(() => {
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
    return null
  }, [camera])

  // Transmission material for crystal effect
  const transmissionMaterial = useMemo(() => (
 <MeshTransmissionMaterial
      thickness={0.1}
      roughness={0.15}
      transmission={1}
      ior={1.75}
      chromaticAberration={0.5}
      backside={true}
      color="#ffffff"
      samples={3}
      resolution={1024}
      anisotropicBlur={0.1}
      temporalDistortion={0.1}
    />
  ), []);

  // Apply the model's geometry to our mesh
  useEffect(() => {
    gltf.scene.traverse((object: any) => {
      if (object.isMesh && modelRef.current) {
        (modelRef.current as any).geometry = object.geometry;
      }
    });
  }, [gltf.scene]);

  // Track cursor and make arrow rotate to point at cursor in 3D space while spinning
  useFrame((state, delta) => {
    if (!groupRef.current || !size.width || !size.height) return;
    
    // Incrementamos el tiempo para la animación de rotación
    timeRef.current += delta;

    // Obtener el elemento canvas
    let canvasElement = document.querySelector('canvas');
    if (!canvasElement) return;
    
    const rect = canvasElement.getBoundingClientRect();
    
    // Convertir la posición del cursor a coordenadas normalizadas (-1 a 1)
    mouse.x = ((cursorPosition.x - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((cursorPosition.y - rect.top) / rect.height) * 2 + 1;
    
    // Configurar el raycaster desde la cámara hacia la posición del cursor
    raycaster.setFromCamera(mouse, camera);
    
    // Calcular el punto en el espacio 3D donde apunta el cursor
    const targetPoint = new Vector3();
    raycaster.ray.at(10, targetPoint);
    
    // Posición central de la flecha
    const arrowPosition = new Vector3(0, 0, 0);
    
    // Configuramos la posición inicial del grupo
    groupRef.current.position.copy(arrowPosition);
    
    // Resetear la rotación para empezar desde cero
    groupRef.current.rotation.set(0, 0, 0);
    
    // Hacer que la flecha mire hacia el punto del cursor
    groupRef.current.lookAt(targetPoint);
    
    // Ajuste de orientación para este modelo específico
    groupRef.current.rotateX(Math.PI/2);
    
    // Convertimos la rotación actual a un quaternion
    const currentRotation = groupRef.current.quaternion.clone();
    
    // Creamos un eje local Y para la rotación de trompo
    const localSpinAxis = new Vector3(0, 1, 0);
    localSpinAxis.applyQuaternion(currentRotation);
    
    // Creamos un quaternion para la rotación de trompo
    const spinQuaternion = new Quaternion().setFromAxisAngle(
      localSpinAxis,
      timeRef.current * spinSpeed
    );
    
    // Aplicamos la rotación de trompo a la rotación actual
    groupRef.current.quaternion.multiplyQuaternions(spinQuaternion, currentRotation);
  });

  return (
    <Center>
      <group ref={groupRef} scale={2.1}>
        <mesh ref={modelRef}>
          {transmissionMaterial}
        </mesh>
      </group>
    </Center>
  )
}

// Custom cursor tracker component that reports cursor position
const CursorTracker = ({ children }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const updatePosition = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', updatePosition);
    return () => window.removeEventListener('mousemove', updatePosition);
  }, []);
  
  return (
    <CursorContext.Provider value={position}>
      {children}
    </CursorContext.Provider>
  );
};

// Main component
const ArrowAni = () => {
  return (
    <div className="w-full h-full bg-black relative">
      <CursorTracker>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 65 }}
          gl={{ 
            alpha: false,
            antialias: true,
            powerPreference: "high-performance",
            preserveDrawingBuffer: true
          }}
          dpr={[1, 2]}
        >
          <color attach="background" args={['#000000']} />
          
          {/* Iluminación para el efecto cristalino */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1.5} color="#FFFFFF" />
          <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#AAAAFF" />
          
          {/* Environment map para reflecciones realistas */}
          <Environment preset="city" />
          
          {/* Modelo con suspense para carga */}
          <React.Suspense fallback={null}>
            <Model spinSpeed={1.5} />
          </React.Suspense>
        </Canvas>
      </CursorTracker>
    </div>
  )
}

export default ArrowAni