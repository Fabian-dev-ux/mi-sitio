'use client';

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const mainContentRef = useRef(null);

  // Función mejorada para manejar la finalización de la animación
  const handleAnimationComplete = useCallback(() => {
    console.log("Entrance Animation is officially complete.");
    
    // En móviles, añadimos un pequeño delay para asegurar el renderizado
    const isMobile = typeof window !== 'undefined' && 
                    (window.innerWidth <= 768 || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    
    const delay = isMobile ? 50 : 0;
    
    setTimeout(() => {
      setAnimationCompleted(true);
      // Usar requestAnimationFrame para mejor sincronización
      requestAnimationFrame(() => {
        setContentVisible(true);
      });
    }, delay);
  }, []);

  // Efecto para debug en desarrollo
  useEffect(() => {
    console.log('ClientLayout State:', {
      animationCompleted,
      contentVisible
    });
  }, [animationCompleted, contentVisible]);

  return (
    <>
      <GsapManager />

      {/* Contenido principal */}
      <div
        ref={mainContentRef}
        className={`transition-opacity duration-300 ease-out ${
          contentVisible ? 'opacity-100' : 'opacity-0'
        }`}
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
          <PageTransition isReady={animationCompleted && contentVisible}>
            {children}
          </PageTransition>
        </main>
                        
        <ConditionalFooter />
      </div>
                    
      {/* Animación de entrada */}
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