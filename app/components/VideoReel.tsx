'use client';
import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapInit';
import { useGSAP } from "@gsap/react";

const VideoReel = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      const mobileChanged = mobile !== isMobile;
      
      setIsMobile(mobile);
      
      // Solo recargar video si realmente cambió el estado mobile/desktop
      if (videoRef.current && mobileChanged && !initialLoad) {
        videoRef.current.load();
      }
      
      if (initialLoad) {
        setInitialLoad(false);
      }
    };

    checkIsMobile();
    
    // Debounce para evitar múltiples recargas
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkIsMobile, 300);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, [isMobile, initialLoad]);

  // Configuración de GSAP solo para desktop
  useGSAP(() => {
    if (!sectionRef.current || !videoRef.current || isMobile) return;

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      animation: gsap.fromTo(
        videoRef.current,
        { yPercent: -30 },
        { yPercent: 30, ease: "none" }
      )
    });

  }, { dependencies: [isMobile], scope: sectionRef });

  // Efecto para recargar video solo cuando realmente cambia mobile/desktop
  useEffect(() => {
    if (videoRef.current && !initialLoad) {
      const currentTime = videoRef.current.currentTime;
      videoRef.current.load();
      
      // Mantener el tiempo de reproducción
      videoRef.current.addEventListener('loadedmetadata', () => {
        if (videoRef.current) {
          videoRef.current.currentTime = currentTime;
        }
      }, { once: true });
    }
  }, [isMobile]);

  // Determinar fuentes de video
  const videoSources = {
    webm: isMobile ? '/videos/vid-antagonik-mobile.webm' : '/videos/vid-antagonik.webm',
    mp4: isMobile ? '/videos/vid-antagonik-mobile.mp4' : '/videos/vid-antagonik.mp4'
  };

  return (
    <section 
      id="VideoReel"
      ref={sectionRef}
      className="h-96 md:h-[32rem] lg:h-screen flex justify-center items-center bg-dark px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 py-4 md:py-8 overflow-hidden"
    >
      <div className="relative w-full h-full overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transformOrigin: "center center",
            transform: isMobile ? 'none' : undefined, // Sin transformaciones en mobile
            willChange: isMobile ? 'auto' : 'transform' // Optimización de rendering
          }}
        >
          <source src={videoSources.webm} type="video/webm" />
          <source src={videoSources.mp4} type="video/mp4" />
        </video>
      </div>
    </section>
  );
};

export default VideoReel;