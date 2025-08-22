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

  const handleAnimationComplete = useCallback(() => {
    // Ya no es necesario un delay complejo aquí. 
    // Cuando la animación termina, marcamos como completado y visible.
    setAnimationCompleted(true);
    requestAnimationFrame(() => {
      setContentVisible(true);
    });
  }, []);

  return (
    <>
      <GsapManager />

      {/* Contenido principal */}
      <div
        ref={mainContentRef}
        className={`transition-opacity duration-500 ease-out ${
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
          {/* PageTransition ya no necesita el prop 'isReady'.
              Esto lo hace independiente del estado de la animación de entrada,
              solucionando el problema en móviles. */}
          <PageTransition>
            {children}
          </PageTransition>
        </main>
                        
        <ConditionalFooter />
      </div>
                    
      {/* Animación de entrada: se renderiza condicionalmente y se elimina del DOM al completarse */}
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