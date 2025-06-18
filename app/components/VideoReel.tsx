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

      // Solo aplicar parallax en desktop (pantallas >= 768px)
      const mediaQuery = window.matchMedia('(min-width: 768px)');
      
      if (mediaQuery.matches) {
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
  }, []);

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
          {/* Versión desktop */}
          <source src="/videos/vid-antagonik.webm" media="(min-width: 768px)" type="video/webm" />
          {/* Versión mobile */}
          <source src="/videos/vid-antagonik-mobile.webm" media="(max-width: 767px)" type="video/webm" />
          {/* Fallback para navegadores que no soporten webm */}
          <source src="/videos/vid-antagonik.mp4" media="(min-width: 768px)" type="video/mp4" />
          <source src="/videos/vid-antagonik-mobile.mp4" media="(max-width: 767px)" type="video/mp4" />
        </video>
      </div>
    </section>
  );
};

export default VideoReel;