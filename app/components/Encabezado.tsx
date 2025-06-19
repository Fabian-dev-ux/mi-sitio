"use client";
import React, { useRef } from "react";
import { useGSAP } from "@gsap/react";
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

  // useGSAP maneja automáticamente el cleanup y la optimización
  useGSAP(() => {
    if (!headerRef.current) return;
    
    // Configuración compartida para ScrollTrigger
    const scrollTriggerConfig = {
      trigger: headerRef.current,
      start: "top 85%",
      toggleActions: "play none none reset"
    };
    
    // Animación de líneas
    const lineElements = [line2Ref.current];
    if (window.innerWidth > 1024 && line1Ref.current) {
      lineElements.push(line1Ref.current);
    }
    
    if (lineElements.length > 0) {
      gsap.fromTo(lineElements, 
        { 
          scaleX: 0,
          transformOrigin: "left center"
        },
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: scrollTriggerConfig
        }
      );
    }

    // Animación de texto revelado
    const refsToAnimate = [];
    
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
            gsap.fromTo(word,
              { 
                y: "100%",
                opacity: 0
              },
              {
                y: "0%",
                opacity: 1,
                duration: 0.7,
                ease: "power3.out",
                scrollTrigger: scrollTriggerConfig
              }
            );
          }
        });
      }
    });

    // Animación de letras del título
    if (tituloRef.current) {
      const letras = tituloRef.current.querySelectorAll("span");
      
      gsap.fromTo(letras,
        { color: "#1C1C1C" }, 
        { 
          color: "#9CA3AF",
          stagger: 0.02,
          duration: 0.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: tituloRef.current,
            start: "top 80%",
            end: "top 40%",
            scrub: true
          }
        }
      );
    }
    
  }, {
    scope: headerRef, // Define el scope para optimización
    dependencies: [numero, titulo, seccion], // Re-ejecuta si cambian las props
    revertOnUpdate: true // Limpia automáticamente en updates
  });

  // Función para dividir texto en contenedores de palabras
  const createWordContainers = (text: string) => {
    return text.split(" ").map((word, index) => (
      <span key={index} className="word-container inline-block overflow-hidden mr-1">
        <span className="word inline-block transform translate-y-full opacity-0">{word}</span>
      </span>
    ));
  };
  
  // Preparar el título con cada palabra encapsulada
  const tituloProcesado = () => {
    const palabras = titulo.split(" ");
    let resultado = [];
    
    for (let i = 0; i < palabras.length; i++) {
      const palabraSpan = (
        <span 
          key={`palabra-${i}`} 
          className="palabra" 
          style={{ 
            display: "inline-block", 
            whiteSpace: "nowrap"
          }}
        >
          {palabras[i].split("").map((char, j) => (
            <span key={`char-${i}-${j}`} style={{ display: "inline-block" }}>
              {char}
            </span>
          ))}
        </span>
      );
      
      resultado.push(palabraSpan);
      
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
      {/* Border Grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-8 mb-0">
        <div ref={line1Ref} className="hidden lg:block lg:col-span-2 2xl:col-span-3 h-[0.25px] bg-gray-800"></div>
        <div ref={line2Ref} className="col-span-12 md:col-span-12 lg:col-span-10 2xl:col-span-9 h-[0.25px] bg-gray-800"></div>
      </div>

      {/* Encabezado */}
      <div className="grid grid-cols-12 gap-4 md:gap-8 items-start pt-4 md:pt-5 pb-0 mt-0 text-xs text-gray-400 uppercase">
        {/* Number column */}
        <div ref={numeroRef} className="hidden lg:block lg:col-span-2 2xl:col-span-3 mt-1 font-archivo font-normal text-sm text-gray-700">
          <span className="word-container inline-block overflow-hidden">
            <span className="word inline-block transform translate-y-full opacity-0">/ {numero}</span>
          </span>
        </div>
        
        {/* Title and section */}
        <div className="col-span-12 md:col-span-11 lg:col-span-9 2xl:col-span-7 2xl:col-start-4 flex flex-col relative">
          <div className="text-[1.65rem] md:text-3xl lg:text-4xl 2xl:text-5xl font-display font-semibold text-gray-400 uppercase leading-[1.1] max-w-[360px] md:max-w-[900px] lg:max-w-[750px] 2xl:max-w-[1000px] relative">
            <span ref={seccionRef} className="hidden md:block absolute left-0 top-[2.5px] md:top-[4.5px] font-display font-normal text-xs md:text-sm text-gray-700">
              <span className="word-container inline-block overflow-hidden">
                <span className="word inline-block transform translate-y-full opacity-0">[ {seccion} ]</span>
              </span>
            </span>
            <span 
              className="md:pl-[6ch] lg:pl-[4.6ch] 2xl:pl-[4.3ch]" 
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
        
        {/* Copyright */}
        <div ref={copyrightRef} className="hidden lg:block lg:col-span-1 2xl:col-span-2 2xl:col-start-11 text-right mt-1 font-archivo font-normal text-sm text-gray-700">
          <span className="word-container inline-block overflow-hidden">
            <span className="word inline-block transform translate-y-full opacity-0">&copy;2025</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Encabezado;