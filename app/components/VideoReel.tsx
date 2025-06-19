'use client';
import React, { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapInit';

const VideoReel = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [videoSources, setVideoSources] = useState({ webm: '', mp4: '' });

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Función para detectar si es mobile
    const checkIsMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Establecer las fuentes del video según el tamaño de pantalla
      if (mobile) {
        setVideoSources({
          webm: '/videos/vid-antagonik-mobile.webm',
          mp4: '/videos/vid-antagonik-mobile.mp4'
        });
      } else {
        setVideoSources({
          webm: '/videos/vid-antagonik.webm',
          mp4: '/videos/vid-antagonik.mp4'
        });
      }
    };

    // Verificar inicialmente
    checkIsMobile();

    // Escuchar cambios de tamaño de ventana
    const handleResize = () => {
      checkIsMobile();
    };

    window.addEventListener('resize', handleResize);

    // Limpiar listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !videoRef.current) return;

      // Solo aplicar parallax en desktop (pantallas >= 768px)
      if (!isMobile) {
        // OPCIÓN 3: Parallax con clip-path (SOLO DESKTOP)
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          animation: gsap.fromTo(
            videoRef.current,
            { 
              yPercent: -45,
              clipPath: "inset(0% 0% 0% 0%)"
            },
            { 
              yPercent: 45,
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none" 
            }
          )
        });
      }
    });

    return () => ctx.revert();
  }, [isMobile]);

  // Función para recargar el video cuando cambien las fuentes
  useEffect(() => {
    if (videoRef.current && videoSources.webm) {
      const video = videoRef.current;
      const currentTime = video.currentTime;
      
      // Recargar el video con las nuevas fuentes
      video.load();
      
      // Mantener el tiempo actual si es posible
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = currentTime;
      }, { once: true });
    }
  }, [videoSources]);

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
            transformOrigin: "center center"
          }}
        >
          {/* Fuentes dinámicas basadas en el estado */}
          {videoSources.webm && (
            <source src={videoSources.webm} type="video/webm" />
          )}
          {videoSources.mp4 && (
            <source src={videoSources.mp4} type="video/mp4" />
          )}
        </video>
      </div>
    </section>
  );
};

export default VideoReel;