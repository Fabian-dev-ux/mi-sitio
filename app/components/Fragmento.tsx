import React, { useRef, useMemo, useEffect } from 'react'
import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import { 
  Environment, 
  MeshTransmissionMaterial, 
  Center 
} from '@react-three/drei'

// Model component with realistic crystal effect and random rotation
const Model = () => {
  const gltf = useLoader(GLTFLoader, '/models/fragmento.glb')
  const { camera } = useThree()
  const modelRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  
  // Random rotation speeds for each axis
  const rotationSpeeds = useMemo(() => ({
    x: (Math.random() - 0.5) * 0.02, // Random speed between -0.01 and 0.01
    y: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02
  }), [])
  
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

  // Set camera position for frontal view
  useEffect(() => {
    camera.position.set(0, 0, 5)
    camera.lookAt(0, 0, 0)
  }, [camera])

  // Apply the model's geometry to our mesh
  useEffect(() => {
    let targetGeometry: THREE.BufferGeometry | null = null;
    
    gltf.scene.traverse((object: THREE.Object3D) => {
      if (object instanceof THREE.Mesh && object.geometry) {
        targetGeometry = object.geometry;
      }
    });
    
    if (targetGeometry && modelRef.current) {
      modelRef.current.geometry = targetGeometry;
    }
  }, [gltf.scene]);

  // Animation loop for random rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.x += rotationSpeeds.x
      groupRef.current.rotation.y += rotationSpeeds.y
      groupRef.current.rotation.z += rotationSpeeds.z
    }
  })

  return (
    <Center>
      <group ref={groupRef} scale={1.4}>
        <mesh ref={modelRef}>
          {transmissionMaterial}
        </mesh>
      </group>
    </Center>
  )
}

// Main component
const Fragmento = () => {
  return (
    <div className="w-full h-full bg-black relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 35 }}
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
        <directionalLight position={[-5, -5, -5]} intensity={0.5} color="#FFFFFF" />
        
        {/* Environment map para reflecciones realistas */}
        <Environment preset="city" />
        
        {/* Modelo con suspense para carga */}
        <React.Suspense fallback={null}>
          <Model />
        </React.Suspense>
      </Canvas>
    </div>
  )
}

export default Fragmento