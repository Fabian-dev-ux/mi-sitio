// ClientLayout.tsx (CORREGIDO)
'use client';

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import EntranceAnimation from "@/components/EntranceAnimation";
import PageTransition from "@/components/PageTransition";
import GsapManager from "@/components/GsapManager";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cambia el estado inicial de contentVisible a false
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const mainContentRef = useRef(null);

  // Esta función ahora actualiza el estado de forma síncrona y lógica
  const handleAnimationComplete = () => {
    console.log("Entrance Animation is officially complete.");
    // 1. Marca la animación como completada para que el componente se desmonte.
    setAnimationCompleted(true);
    // 2. Inmediatamente después, haz visible el contenido principal.
    setContentVisible(true);
  };

  return (
    <>
      <GsapManager />

      {/* Contenido principal: corregimos la lógica de opacidad */}
      <div
        ref={mainContentRef}
        className={`transition-opacity duration-700 ease-out ${contentVisible ? 'opacity-100' : 'opacity-0'}`} // <-- CORREGIDO
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          isolation: 'isolate'
        }}
      >
        <Navbar />
                
        <main 
          className="flex-grow"
          style={{
            position: 'relative',
            zIndex: 2
          }}
        >
          {/* PageTransition ahora recibe el estado correcto en el momento correcto */}
          <PageTransition isReady={animationCompleted}>
            {children}
          </PageTransition>
        </main>
                
        <ConditionalFooter />
      </div>
             
      {/* Este bloque ahora se eliminará del DOM en el momento justo */}
      {!animationCompleted && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10
          }}
        >
          <EntranceAnimation
            devMode={false}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>
      )}
    </>
  );
}