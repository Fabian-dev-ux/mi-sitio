'use client';

import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import ConditionalFooter from "@/components/ConditionalFooter";
import EntranceAnimation from "@/components/EntranceAnimation";
import PageTransition from "@/components/PageTransition";
import GsapManager from "@/components/GsapManager"; // <-- RUTA CORREGIDA

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const mainContentRef = useRef(null);

  const handleAnimationComplete = () => {
    console.log("Animation complete in layout");
    setContentVisible(true);
    setTimeout(() => {
      setAnimationCompleted(true);
    }, 1200);
  };

  return (
    <>
      <GsapManager />

      {/* Contenido principal siempre presente, pero inicialmente invisible */}
      <div
        ref={mainContentRef}
        className={`transition-opacity duration-700 ease-out ${contentVisible ? 'opacity-100' : 'opacity-100'}`}
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
          <PageTransition isReady={animationCompleted}>
            {children}
          </PageTransition>
        </main>
                
        <ConditionalFooter />
      </div>
             
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