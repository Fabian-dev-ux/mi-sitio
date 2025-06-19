'use client';

import React, { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger } from "@/lib/gsapInit";
import { useGSAP } from "@gsap/react";

// Cargar el componente AntagonikAni dinámicamente para evitar problemas de SSR
const AntagonikAni = dynamic(() => import("./AntagonikAni"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />
});

// Definir tipos para las interfaces
interface ContainerBounds {
  top: number;
  left: number;
  width: number;
  height: number;
}

export default function Antagonik(): JSX.Element {
  const tituloRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const persianaRef = useRef<HTMLDivElement>(null);
  
  // Estado para almacenar las dimensiones del contenedor
  const [containerBounds, setContainerBounds] = useState<ContainerBounds>({ 
    top: 0, 
    left: 0, 
    width: 0, 
    height: 0 
  });
  
  // Número de franjas de la persiana
  const numBlinds: number = 12;

  // Crear las franjas de la persiana
  const createBlinds = (): JSX.Element[] => {
    const blindElements: JSX.Element[] = [];
    for (let i = 0; i < numBlinds; i++) {
      blindElements.push(
        <div 
          key={i} 
          className="blind-stripe bg-dark absolute left-0 w-full transform origin-top"
          style={{ 
            top: `${(i * 100) / numBlinds}%`, 
            height: `${100 / numBlinds}%`,
            transformOrigin: 'top',
            transform: 'scaleY(1)'
          }}
        />
      );
    }
    return blindElements;
  };

  // Función para actualizar las dimensiones del contenedor y del fondo
  const updateBounds = (): void => {
    if (containerRef.current && backgroundRef.current && persianaRef.current) {
      const rect: DOMRect = containerRef.current.getBoundingClientRect();
      
      // Calcular las coordenadas relativas al componente padre
      const parentElement = containerRef.current.offsetParent as HTMLElement | null;
      const parentRect: DOMRect = parentElement?.getBoundingClientRect() || new DOMRect(0, 0, 0, 0);
      
      const bounds: ContainerBounds = {
        top: rect.top - parentRect.top,
        left: rect.left - parentRect.left,
        width: rect.width,
        height: rect.height
      };
      
      setContainerBounds(bounds);
      
      // Actualizar el estilo del fondo y la persiana para que coincidan con el contenedor
      backgroundRef.current.style.top = `${bounds.top}px`;
      backgroundRef.current.style.left = `${bounds.left}px`;
      backgroundRef.current.style.width = `${bounds.width}px`;
      backgroundRef.current.style.height = `${bounds.height}px`;
      
      persianaRef.current.style.top = `${bounds.top}px`;
      persianaRef.current.style.left = `${bounds.left}px`;
      persianaRef.current.style.width = `${bounds.width}px`;
      persianaRef.current.style.height = `${bounds.height}px`;
    }
  };

  // Usar useGSAP en lugar de useEffect para las animaciones
  useGSAP(() => {
    // Actualizar las dimensiones inicialmente
    updateBounds();
    
    // Animación para las tres líneas del título
    if (tituloRef.current) {
      const lineas: NodeListOf<Element> = tituloRef.current.querySelectorAll(".linea-titulo");
      
      ScrollTrigger.create({
        trigger: tituloRef.current,
        start: "top 80%",
        end: "top 40%",
        toggleActions: "play none none reverse",
        animation: gsap.fromTo(
          lineas,
          { 
            y: "100%",
            opacity: 0
          },
          { 
            y: "0%",
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.1
          }
        )
      });
    }

    // Animación para las franjas de la persiana
    if (persianaRef.current) {
      const blindStripes: NodeListOf<Element> = persianaRef.current.querySelectorAll(".blind-stripe");
      
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        end: "top 20%",
        toggleActions: "play none none reverse",
        animation: gsap.to(blindStripes, {
          scaleY: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: "power2.inOut"
        })
      });
    }

    // Manejar resize
    const handleResize = (): void => {
      updateBounds();
      ScrollTrigger.refresh();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Manejar visibilidad
    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Manejar cambios de ruta
    const refreshOnRouteChange = (): void => {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    };
    
    window.addEventListener('popstate', refreshOnRouteChange);
    
    // Función de limpieza (useGSAP la maneja automáticamente, pero podemos limpiar eventos)
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', refreshOnRouteChange);
    };
  }, { scope: containerRef }); // Usar scope para mejor rendimiento

  // Función para renderizar el título con efecto de revelación de texto en 3 líneas
  const renderTitulo = (): JSX.Element => {
    return (
      <div ref={tituloRef} className="flex flex-col">
        {/* Primera línea con el círculo */}
        <div className="overflow-hidden h-[1.1em] md:h-[1.1em] mb-0.5 md:mb-1">
          <div 
            className="linea-titulo text-gray-400"
            style={{ 
              transform: "translateY(100%)",
              opacity: 0
            }}
          >
            <div 
              className="inline-block w-[1rem] h-[1rem] md:w-[1.4rem] md:h-[1.4rem] rounded-full bg-primary mr-2 md:mr-3 align-middle"
              style={{ transform: "translateY(-0.15rem) md:translateY(-0.20rem)" }}
            ></div>
            <span style={{ wordSpacing: "0.11em" }}>INNOVAMOS CON</span>
          </div>
        </div>
        
        {/* Segunda línea */}
        <div className="overflow-hidden h-[1.1em] md:h-[1.1em] mb-0.5 md:mb-1">
          <div 
            className="linea-titulo text-gray-400"
            style={{ 
              transform: "translateY(100%)",
              opacity: 0,
              wordSpacing: "0.11em"
            }}
          >
            TECNOLOGÍA DE
          </div>
        </div>
        
        {/* Tercera línea */}
        <div className="overflow-hidden h-[1.1em] md:h-[1.1em] mb-0.5 md:mb-1">
          <div 
            className="linea-titulo text-gray-400"
            style={{ 
              transform: "translateY(100%)",
              opacity: 0,
              wordSpacing: "0.11em"
            }}
          >
            VANGUARDIA
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative h-screen bg-dark text-white overflow-hidden px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 py-6">
      {/* Fondo de color gray-900 - Capa del fondo (z-index más bajo) */}
      <div 
        ref={backgroundRef} 
        className="absolute z-0 bg-gray-900 bg-opacity-50"
        style={{ position: 'absolute' }}
      />
      
      {/* Efecto persiana - Capa sobre el fondo */}
      <div 
        ref={persianaRef} 
        className="absolute z-5 overflow-hidden"
        style={{ position: 'absolute' }}
      >
        {createBlinds()}
      </div>
      
      {/* Componente de animación AntagonikAni - Capa intermedia */}
      <div className="absolute inset-0 z-10">
        <AntagonikAni containerBounds={containerBounds} />
      </div>
      
      {/* Contenido principal (textos, logo) - Capa frontal */}
      <div 
        ref={containerRef} 
        className="relative z-20 flex flex-col justify-between h-full pl-4 pr-4 pb-6 pt-6 md:pl-12 md:pr-12 md:pb-10 md:pt-12"
      >
        {/* Contenedor para título e indicador de sección */}
        <div className="relative">
          {/* Indicadores de nivel - OCULTOS EN MOBILE */}
          <div className="absolute top-0 right-0 text-sm font-archivo uppercase flex-col items-end hidden md:flex">
            <div className="mb-1">
              <span className="text-gray-700 pr-1">Avanzado </span>
              <span className="text-primary font-bold">●</span>
            </div>
            <div>
              <span className="text-gray-700 pr-1">Intermedio </span>
              <span className="text-gray-600 font-bold">●</span>
            </div>
          </div>
          <div className="max-w-xl">
            <div className="font-display text-[1.5rem] leading-[0.9] md:text-[2rem] md:leading-[1] font-medium">
              {renderTitulo()}
            </div>
          </div>
        </div>

        {/* Logo */}
        <div className="flex justify-end">
          <div className="w-[45vw] max-w-[550px]">
            <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 138.4 30.29" className="w-full h-auto">
              <defs>
                <style>
                  {`.cls-1 { stroke-width: 0px; fill: #808591; }`}
                </style>
              </defs>
              <path className="cls-1" d="m14.16,4.4h3.37v16.66h-3.37v-2.13c-1.44,1.67-3.35,2.5-5.73,2.5-1.47,0-2.85-.38-4.15-1.13-1.3-.75-2.34-1.79-3.12-3.12-.78-1.32-1.17-2.8-1.17-4.45s.39-3.13,1.17-4.45c.78-1.32,1.82-2.36,3.12-3.12,1.3-.75,2.68-1.13,4.15-1.13,2.38,0,4.29.83,5.73,2.5v-2.13Zm-2.57,13.08c.82-.48,1.47-1.13,1.93-1.97.47-.83.7-1.76.7-2.78s-.23-1.95-.7-2.78c-.47-.83-1.11-1.49-1.93-1.97-.82-.48-1.73-.72-2.73-.72s-1.91.24-2.73.72c-.82.48-1.47,1.13-1.93,1.97-.47.83-.7,1.76-.7,2.78s.23,1.95.7,2.78c.47.83,1.11,1.49,1.93,1.97.82.48,1.73.72,2.73.72s1.91-.24,2.73-.72Z"/>
              <path className="cls-1" d="m32.4,4.98c1.03.63,1.84,1.5,2.42,2.6.58,1.1.87,2.33.87,3.68v9.8h-3.47v-9.36c0-1.33-.36-2.4-1.08-3.22-.72-.81-1.7-1.22-2.95-1.22s-2.24.41-3.07,1.23-1.23,1.89-1.23,3.2v9.36h-3.46V4.4h3.37v1.97c.67-.75,1.43-1.33,2.3-1.73.87-.4,1.8-.6,2.8-.6,1.31,0,2.48.32,3.51.95Z"/>
              <path className="cls-1" d="m38.17,0h3.46v4.4h4.1v3.2h-4.1v7.6c0,.82.23,1.47.7,1.93s1.11.7,1.93.7h1.47v3.23h-2.1c-1.67,0-2.99-.49-3.98-1.47-.99-.98-1.48-2.28-1.48-3.9V0Z"/>
              <path className="cls-1" d="m60.77,4.4h3.37v16.66h-3.37v-2.13c-1.44,1.67-3.35,2.5-5.73,2.5-1.47,0-2.85-.38-4.15-1.13-1.3-.75-2.34-1.79-3.12-3.12-.78-1.32-1.17-2.8-1.17-4.45s.39-3.13,1.17-4.45c.78-1.32,1.82-2.36,3.12-3.12,1.3-.75,2.68-1.13,4.15-1.13,2.38,0,4.29.83,5.73,2.5v-2.13Zm-2.57,13.08c.82-.48,1.47-1.13,1.93-1.97.47-.83.7-1.76.7-2.78s-.23-1.95-.7-2.78c-.47-.83-1.11-1.49-1.93-1.97-.82-.48-1.73-.72-2.73-.72s-1.91.24-2.73.72c-.82.48-1.47,1.13-1.93,1.97-.47.83-.7,1.76-.7,2.78s.23,1.95.7,2.78c.47.83,1.11,1.49,1.93,1.97.82.48,1.73.72,2.73.72s1.91-.24,2.73-.72Z"/>
              <path className="cls-1" d="m90.22,20.31c-1.36-.74-2.44-1.78-3.25-3.1-.81-1.32-1.22-2.82-1.22-4.48s.41-3.16,1.22-4.48c.81-1.32,1.89-2.35,3.25-3.1,1.35-.74,2.82-1.12,4.4-1.12s3.04.37,4.4,1.12c1.35.74,2.44,1.78,3.25,3.1.81,1.32,1.22,2.82,1.22,4.48s-.41,3.16-1.22,4.48c-.81,1.32-1.89,2.35-3.25,3.1-1.36.74-2.82,1.12-4.4,1.12s-3.04-.37-4.4-1.12Zm7.1-2.83c.82-.48,1.47-1.13,1.93-1.97.47-.83.7-1.76.7-2.78s-.23-1.95-.7-2.78c-.47-.83-1.11-1.49-1.93-1.97-.82-.48-1.72-.72-2.7-.72s-1.91.24-2.73.72c-.82.48-1.47,1.13-1.93,1.97-.47.83-.7,1.76-.7,2.78s.23,1.95.7,2.78c.47.83,1.11,1.49,1.93,1.97.82.48,1.73.72,2.73.72s1.88-.24,2.7-.72Z"/>
              <path className="cls-1" d="m117.27,4.98c1.03.63,1.84,1.5,2.42,2.6.58,1.1.87,2.33.87,3.68v9.8h-3.47v-9.36c0-1.33-.36-2.4-1.08-3.22-.72-.81-1.7-1.22-2.95-1.22s-2.24.41-3.07,1.23-1.23,1.89-1.23,3.2v9.36h-3.46V4.4h3.37v1.97c.67-.75,1.43-1.33,2.3-1.73.87-.4,1.8-.6,2.8-.6,1.31,0,2.48.32,3.51.95Z"/>
              <g>
                <rect className="cls-1" x="123.04" width="3.46" height="2.58"/>
                <rect className="cls-1" x="123.14" y="4.4" width="3.47" height="16.66"/>
              </g>
              <polygon className="cls-1" points="131.38 12.25 137.54 4.4 133.61 4.4 127.5 12.41 134.28 21.06 138.4 21.06 131.38 12.25"/>
              <g>
                <path className="cls-1" d="m74.92,26.75v3.53c4.89,0,8.86-3.97,8.86-8.86h-3.53c0,2.94-2.39,5.33-5.33,5.33Z"/>
                <path className="cls-1" d="m84.93,4.4h-4.1v1.82c-.46-.4-.96-.77-1.52-1.07-1.36-.74-2.82-1.12-4.4-1.12s-3.04.37-4.4,1.12c-1.36.74-2.44,1.78-3.25,3.1-.81,1.32-1.22,2.82-1.22,4.48s.41,3.16,1.22,4.48c.81,1.32,1.89,2.35,3.25,3.1,1.35.74,2.82,1.12,4.4,1.12s3.04-.37,4.4-1.12c1.35-.74,2.44-1.78,3.25-3.1.81-1.32,1.22-2.82,1.22-4.48s-.41-3.16-1.22-4.48c-.14-.23-.30-.44-.46-.65h2.83v-3.2Zm-5.38,11.11c-.47.83-1.11,1.49-1.93,1.97-.82.48-1.72.72-2.7.72s-1.91-.24-2.73-.72c-.82-.48-1.47-1.13-1.93-1.97-.47-.83-.7-1.76-.7-2.78s.23-1.95.7-2.78c.47-.83,1.11-1.49,1.93-1.97.82-.48,1.73-.72,2.73-.72s1.88.24,2.7.72c.82.48,1.47,1.13,1.93,1.97.47.83.7,1.76.7,2.78s-.23,1.95-.7,2.78Z"/>
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}