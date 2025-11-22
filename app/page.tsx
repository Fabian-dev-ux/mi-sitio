// app/page.tsx
'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// ===================================================================
//  COMPONENTES LIGEROS - Se importan de forma normal (estática)
// ===================================================================
import Servicios from './components/Servicios';
import Marquee from './components/Marquee';
import Vision from './components/Vision';

// ===================================================================
//  COMPONENTES PESADOS - Se importan con carga dinámica
// ===================================================================

const Hero = dynamic(() => import('./components/Hero'), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-black" /> 
});

const VideoReel = dynamic(() => import('./components/VideoReel'), {
  ssr: false,
  loading: () => <div className="h-96 md:h-[32rem] lg:h-screen bg-dark" />
});

const Proyectos = dynamic(() => import('./components/Proyectos'), {
  // Un placeholder simple es suficiente si no es visible al inicio
  loading: () => <div className="h-screen w-full bg-dark" /> 
});

const Proceso = dynamic(() => import('./components/Proceso'), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-dark" /> 
});

const Antagonik = dynamic(() => import('./components/Antagonik'), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-dark" /> 
});


export default function Page() {
  return (
    <>
      {/* Componentes pesados (se cargarán justo cuando React intente renderizarlos) */}
      <Hero />
      <VideoReel />

      {/* Componentes ligeros (ya estaban en el bundle inicial) */}
      <Servicios /> 
      <Marquee />

      {/* Más componentes pesados */}
      <Proyectos />
      <Proceso />
      <Antagonik />
      
      {/* Componente ligero final */}
      <Vision />
    </>
  );
}