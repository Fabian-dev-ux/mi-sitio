// app/page.tsx
'use client';

import React from 'react';
// 1. Importar 'dynamic' de Next.js para la carga diferida
import dynamic from 'next/dynamic';

// 2. Mantener todas las importaciones estáticas para los componentes que se cargan al inicio
import Hero from './components/Hero';
import Servicios from './components/Servicios';
import Proceso from './components/Proceso';
import Marquee from './components/Marquee';
import Proyectos from './components/Proyectos';
import Antagonik from './components/Antagonik';
import Vision from './components/Vision';

// 3. Crear una versión dinámica del componente VideoReel
const VideoReel = dynamic(() => import('./components/VideoReel'), {
  // ssr: false es crucial aquí porque tu componente usa 'window' y lógica del lado del cliente.
  ssr: false, 
  
  // Opcional pero recomendado: Muestra un placeholder mientras el componente real se carga.
  // Esto evita que la página "salte" (Layout Shift) y mejora la experiencia del usuario.
  // Usamos una clase que imita la altura del componente para mantener el flujo de la página.
  loading: () => <div className="h-96 md:h-[32rem] lg:h-screen bg-dark" />,
});


export default function Page() {
  return (
    <>
      <Hero />
      
      {/* 4. Aquí se renderizará la versión dinámica de VideoReel. */}
      {/*    Al principio mostrará el 'loading' placeholder, y una vez cargado, */}
      {/*    se reemplazará por el componente real. */}
      <VideoReel />
      
      <Servicios /> 
      <Marquee />
      <Proyectos />
      <Proceso />
      <Antagonik />
      <Vision />
    </>
  );
}