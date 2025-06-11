'use client';
import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapInit';

const VideoReel = () => {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !videoRef.current) return;

      // OPCIÓN 3: Parallax con clip-path (ACTIVA)
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

      // OPCIÓN 1: Parallax con transform scale manteniendo proporción
      // Descomenta este bloque para probar la opción 1
      /*
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        animation: gsap.fromTo(
          videoRef.current,
          { 
            yPercent: -15,
            scale: 1.05  // Escalado mínimo solo para cubrir el movimiento
          },
          { 
            yPercent: 15,
            scale: 1.05,
            ease: "none" 
          }
        )
      });
      */

      // OPCIÓN 2: Parallax solo con translateY (sin escalar)
      // Descomenta este bloque para probar la opción 2
      /*
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
        animation: gsap.fromTo(
          videoRef.current,
          { yPercent: -10 },
          { yPercent: 10, ease: "none" }
        )
      });
      */
    });

    return () => ctx.revert();
  }, []);

  return (
    <section 
      id="VideoReel"
      ref={sectionRef}
      className="h-96 md:h-[32rem] lg:h-screen flex justify-center items-center bg-dark px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 py-4 md:py-8 overflow-hidden"
    >
      <div className="relative w-full h-full overflow-hidden">
        {/* Video con tamaño natural, sin sobre-dimensionar el contenedor */}
        <video
          ref={videoRef}
          src="/videos/vid-antagonik.webm"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            // Asegurar que el video mantenga su aspect ratio
            transformOrigin: "center center"
          }}
        />
      </div>
    </section>
  );
};

export default VideoReel;