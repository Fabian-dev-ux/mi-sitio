'use client';

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import EntranceAnimation from "@/components/EntranceAnimation";
import PageTransition from "@/components/PageTransition";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const mainContentRef = useRef(null);

  // Función que maneja la finalización de la animación
  const handleAnimationComplete = () => {
    console.log("Animation complete in layout");
    // Iniciar la transición de visibilidad del contenido principal
    setContentVisible(true);
         
    // Una vez que el contenido es visible, podemos remover completamente
    // el componente de animación después de un breve retraso
    setTimeout(() => {
      setAnimationCompleted(true);
    }, 1200); // Este delay debe ser mayor que la duración de las animaciones de las franjas
  };

  return (
    <>
      {/* Contenido principal siempre presente, pero inicialmente invisible */}
      <div
        ref={mainContentRef}
        className={`transition-opacity duration-700 ease-out ${contentVisible ? 'opacity-100' : 'opacity-100'}`}
        style={{
          position: 'relative',  // Cambiado de absolute a relative
          zIndex: 1,             // Por debajo de la animación
          minHeight: '100vh',    // Asegura que ocupe al menos toda la altura de la ventana
          display: 'flex',       // Para organizar navbar, content y footer
          flexDirection: 'column', // En columna vertical
          isolation: 'isolate'   // Crea un nuevo contexto de apilamiento
        }}
      >
        {/* Añadido el Navbar */}
        <Navbar />
                
        {/* Contenido principal con PageTransition */}
        <main 
          className="flex-grow"
          style={{
            position: 'relative',
            zIndex: 2
          }}
        >
          <PageTransition isReady={animationCompleted}>
            {children}
          </PageTransition>
        </main>
                
        {/* Añadido el Footer */}
        <ConditionalFooter />
      </div>
             
      {/* Animación de entrada, se muestra hasta que se complete */}
      {!animationCompleted && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10 // Asegura que esté por encima de todo mientras se muestra
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