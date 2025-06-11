"use client";
import React, { useEffect, useRef, useLayoutEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsapInit";

interface EncabezadoProps {
  numero: string;
  titulo: string;
  seccion: string;
  espaciadoPalabras?: string;
}

const Encabezado: React.FC<EncabezadoProps> = ({
  numero,
  titulo,
  seccion,
  espaciadoPalabras = "0.4rem"
}) => {
  const tituloRef = useRef<HTMLSpanElement>(null);
  const numeroRef = useRef<HTMLDivElement>(null);
  const seccionRef = useRef<HTMLSpanElement>(null);
  const copyrightRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Store animation contexts to clean them up later
  const animationContextRef = useRef<gsap.Context | null>(null);
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);

  // Function to set up all animations
  const setupAnimations = () => {
    // Kill any existing ScrollTriggers to prevent duplicates
    scrollTriggersRef.current.forEach(trigger => trigger.kill());
    scrollTriggersRef.current = [];
    
    // Create a GSAP context for proper cleanup
    if (animationContextRef.current) {
      animationContextRef.current.revert();
    }
    
    // Create new animation context
    animationContextRef.current = gsap.context(() => {
      if (!headerRef.current) return;
      
      // Shared ScrollTrigger configuration
      const scrollTriggerConfig = {
        trigger: headerRef.current,
        start: "top 85%",
        toggleActions: "play none none reset"
      };
      
      // Line animations
      const lineElements = [line2Ref.current];
      // Only include line1Ref if it's visible (large screens only now)
      if (window.innerWidth > 1024) {
        lineElements.push(line1Ref.current);
      }
      
      if (lineElements.length > 0) {
        const lineTrigger = ScrollTrigger.create({
          ...scrollTriggerConfig,
          animation: gsap.fromTo(
            lineElements,
            { 
              scaleX: 0,
              transformOrigin: "left center"
            },
            {
              scaleX: 1,
              duration: 0.8,
              ease: "power2.out",
            }
          )
        });
        
        scrollTriggersRef.current.push(lineTrigger);
      }

      // Text reveal animations - only animate visible elements
      const refsToAnimate = [];
      
      // Only include refs if they're visible (now including seccionRef for md+)
      if (window.innerWidth > 1024) {
        refsToAnimate.push(numeroRef, copyrightRef);
      }
      if (window.innerWidth > 768) {
        refsToAnimate.push(seccionRef);
      }
      
      refsToAnimate.forEach((ref) => {
        if (ref.current) {
          const wordContainers = ref.current.querySelectorAll(".word-container");
          
          wordContainers.forEach((container) => {
            const word = container.querySelector(".word");
            
            if (word) {
              const textTrigger = ScrollTrigger.create({
                ...scrollTriggerConfig,
                animation: gsap.fromTo(
                  word,
                  { 
                    y: "100%",
                    opacity: 0
                  },
                  {
                    y: "0%",
                    opacity: 1,
                    duration: 0.7,
                    ease: "power3.out",
                  }
                )
              });
              
              scrollTriggersRef.current.push(textTrigger);
            }
          });
        }
      });

      // Title letter animation
      if (tituloRef.current) {
        const letras = tituloRef.current.querySelectorAll("span");
        
        const titleTrigger = ScrollTrigger.create({
          trigger: tituloRef.current,
          start: "top 80%",
          end: "top 40%",
          scrub: true,
          animation: gsap.fromTo(
            letras,
            { color: "#1C1C1C" }, 
            { 
              color: "#9CA3AF",
              stagger: 0.02,
              duration: 0.5,
              ease: "power2.out",
            }
          )
        });
        
        scrollTriggersRef.current.push(titleTrigger);
      }
    });
  };

  // Use useLayoutEffect for DOM measurements before painting
  useLayoutEffect(() => {
    // Only run on client-side
    if (typeof window === "undefined") return;
    
    // Adding a small delay ensures the DOM is fully ready
    const initTimer = setTimeout(() => {
      setupAnimations();
    }, 100);
    
    return () => {
      clearTimeout(initTimer);
    };
  }, []);
  
  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all ScrollTriggers and GSAP animations
      scrollTriggersRef.current.forEach(trigger => trigger.kill());
      scrollTriggersRef.current = [];
      
      if (animationContextRef.current) {
        animationContextRef.current.revert();
        animationContextRef.current = null;
      }
    };
  }, []);
  
  // Event listener for page visibility changes and responsive layout updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // When returning to the page, refresh animations
        ScrollTrigger.refresh();
      }
    };
    
    const handleResize = () => {
      // Refresh animations on resize to account for responsive changes
      setupAnimations();
    };
    
    // Add listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('resize', handleResize);
    
    // Force a refresh when router change completes
    const refreshOnRouteChange = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
        setupAnimations();
      }, 100);
    };
    
    window.addEventListener('popstate', refreshOnRouteChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('popstate', refreshOnRouteChange);
    };
  }, []);

  // Función para dividir texto en contenedores de palabras para animación
  const createWordContainers = (text: string) => {
    return text.split(" ").map((word, index) => (
      <span key={index} className="word-container inline-block overflow-hidden mr-1">
        <span className="word inline-block transform translate-y-full opacity-0">{word}</span>
      </span>
    ));
  };
  
  // Preparar el título con cada palabra encapsulada en un span para evitar cortes
  const tituloProcesado = () => {
    const palabras = titulo.split(" ");
    let resultado = [];
    
    for (let i = 0; i < palabras.length; i++) {
      // Añadir la palabra completa en un span (para prevenir su separación)
      const palabraSpan = (
        <span 
          key={`palabra-${i}`} 
          className="palabra" 
          style={{ 
            display: "inline-block", 
            whiteSpace: "nowrap" // Evita cortes dentro de la palabra
          }}
        >
          {/* Añadir cada letra de la palabra */}
          {palabras[i].split("").map((char, j) => (
            <span key={`char-${i}-${j}`} style={{ display: "inline-block" }}>
              {char}
            </span>
          ))}
        </span>
      );
      
      resultado.push(palabraSpan);
      
      // Añadir espacio después de cada palabra (excepto la última)
      if (i < palabras.length - 1) {
        resultado.push(
          <span key={`space-${i}`} className="espacio" style={{ display: "inline-block" }}>
            &nbsp;
          </span>
        );
      }
    }
    
    return resultado;
  };

  return (
    <div ref={headerRef}>
      {/* Border Grid - Modified for mobile responsiveness */}
      <div className="grid grid-cols-12 gap-4 md:gap-8 mb-0">
        {/* First line only visible on large screens and up */}
        <div ref={line1Ref} className="hidden lg:block lg:col-span-2 2xl:col-span-3 h-[0.25px] bg-gray-800"></div>
        {/* Second line takes full width on mobile and md, adjusted for responsive layout */}
        <div ref={line2Ref} className="col-span-12 md:col-span-12 lg:col-span-10 2xl:col-span-9 h-[0.25px] bg-gray-800"></div>
      </div>

      {/* Encabezado - Modified for responsive layouts */}
      <div className="grid grid-cols-12 gap-4 md:gap-8 items-start pt-4 md:pt-5 pb-0 mt-0 text-xs text-gray-400 uppercase">
        {/* Number column - only visible on large screens and up */}
        <div ref={numeroRef} className="hidden lg:block lg:col-span-2 2xl:col-span-3 mt-1 font-archivo font-normal text-sm text-gray-700">
          <span className="word-container inline-block overflow-hidden">
            <span className="word inline-block transform translate-y-full opacity-0">/ {numero}</span>
          </span>
        </div>
        {/* Title and section - adjusted for responsive layouts */}
        <div className="col-span-12 md:col-span-11 lg:col-span-9 2xl:col-span-8 flex flex-col relative">
          <div className="text-[1.65rem] md:text-3xl lg:text-4xl  2xl:text-5xl font-display font-semibold text-gray-400 uppercase leading-[1.1] max-w-[360px] md:max-w-[900px] lg:max-w-[750px] 2xl:max-w-[975px] relative">
            {/* Section only visible on medium screens and up */}
            <span ref={seccionRef} className="hidden md:block absolute left-0 top-[2.5px] md:top-[4.5px] font-display font-normal text-xs md:text-sm text-gray-700">
              <span className="word-container inline-block overflow-hidden">
                <span className="word inline-block transform translate-y-full opacity-0">[ {seccion} ]</span>
              </span>
            </span>
            <span 
              className="md:pl-[6ch] lg:pl-[4.6ch]" 
              ref={tituloRef} 
              style={{ 
                wordSpacing: espaciadoPalabras,
                overflowWrap: "normal",
                wordBreak: "keep-all"
              }}
            >
              {tituloProcesado()}
            </span>
          </div>
        </div>
        {/* Copyright - only visible on large screens and up */}
        <div ref={copyrightRef} className="hidden lg:block lg:col-span-1 text-right mt-1 font-archivo font-normal text-sm text-gray-700">
          <span className="word-container inline-block overflow-hidden">
            <span className="word inline-block transform translate-y-full opacity-0">&copy;2025</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Encabezado;