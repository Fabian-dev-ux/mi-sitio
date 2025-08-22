// app/page.tsx
'use client';

// PASO 1: Importar el hook 'useEffect' de React  <-- PUEDES QUITAR ESTA LÍNEA SI YA NO USAS useEffect
import React from 'react';

// ASEGÚRATE DE QUE TODAS ESTAS IMPORTACIONES ESTÉN PRESENTES
import Hero from './components/Hero';
import VideoReel from './components/VideoReel';
import Servicios from './components/Servicios'; // <--- ¡ESTA LÍNEA ES LA CLAVE! PROBABLEMENTE SE BORRÓ
import Proceso from './components/Proceso';
import Marquee from './components/Marquee';
import Proyectos from './components/Proyectos';
import Antagonik from './components/Antagonik';
import Vision from './components/Vision';

export default function Page() {
  // Aquí ya no debería estar el useEffect que manejaba el scroll
  
  return (
    <>
      <Hero />
      <VideoReel />
      {/* Al tener la importación arriba, React ya sabe qué renderizar aquí */}
      <Servicios /> 
      <Marquee />
      <Proyectos />
      <Proceso />
      <Antagonik />
      <Vision />
    </>
  );
}