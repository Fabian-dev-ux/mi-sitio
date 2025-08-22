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
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 1. Usamos matchMedia para manejar las animaciones responsivas.
    // GSAP se encargará de añadir y quitar estas animaciones si el usuario redimensiona la ventana.
    let mm = gsap.matchMedia();

    // Configuración compartida para el trigger
    const scrollTriggerConfig = {
      trigger: headerRef.current,
      start: "top 85%",
      toggleActions: "play none none reset"
    };

    // Animaciones para todas las pantallas
    gsap.fromTo(".linea-animada", 
      { scaleX: 0, transformOrigin: "left center" },
      { scaleX: 1, duration: 0.8, ease: "power2.out", scrollTrigger: scrollTriggerConfig }
    );
    
    gsap.fromTo(".titulo-char",
      { color: "#1C1C1C" }, 
      { 
        color: "#9CA3AF",
        stagger: 0.02,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".titulo-principal",
          start: "top 80%",
          end: "top 40%",
          scrub: true
        }
      }
    );

    // Animaciones solo para pantallas medianas (md) y más grandes (768px+)
    mm.add("(min-width: 768px)", () => {
      gsap.fromTo(".seccion-word",
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.7, ease: "power3.out", scrollTrigger: scrollTriggerConfig }
      );
    });

    // Animaciones solo para pantallas grandes (lg) y más grandes (1024px+)
    mm.add("(min-width: 1024px)", () => {
      // 2. Simplificamos la selección usando gsap.utils.toArray y un selector común.
      const elements = gsap.utils.toArray(['.numero-word', '.copyright-word']);
      gsap.fromTo(elements,
        { y: "100%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.7, ease: "power3.out", scrollTrigger: scrollTriggerConfig }
      );
    });

  }, {
    scope: headerRef,
    dependencies: [numero, titulo, seccion],
    revertOnUpdate: true
  });

  const tituloProcesado = () => {
    return titulo.split(" ").map((palabra, i, arr) => (
      <React.Fragment key={`frag-${i}`}>
        <span className="palabra inline-block whitespace-nowrap">
          {palabra.split("").map((char, j) => (
            <span key={`char-${i}-${j}`} className="titulo-char inline-block">{char}</span>
          ))}
        </span>
        {i < arr.length - 1 && <span className="espacio inline-block">&nbsp;</span>}
      </React.Fragment>
    ));
  };

  return (
    <div ref={headerRef}>
      {/* Border Grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-8 mb-0">
        {/* 3. Añadimos clases para poder seleccionarlas fácilmente en GSAP */}
        <div className="linea-animada hidden lg:block lg:col-span-2 2xl:col-span-3 h-[0.25px] bg-gray-800"></div>
        <div className="linea-animada col-span-12 md:col-span-12 lg:col-span-10 2xl:col-span-9 h-[0.25px] bg-gray-800"></div>
      </div>

      {/* Encabezado */}
      <div className="grid grid-cols-12 gap-4 md:gap-8 items-start pt-4 md:pt-5 pb-0 mt-0 text-xs text-gray-400 uppercase">
        {/* Number column */}
        <div className="hidden lg:block lg:col-span-2 2xl:col-span-3 mt-1 font-archivo font-normal text-sm xl:text-xs 2xl:text-sm text-gray-700">
          <span className="inline-block overflow-hidden">
            <span className="numero-word inline-block">/ {numero}</span>
          </span>
        </div>
        
        {/* Title and section */}
        <div className="col-span-12 md:col-span-11 lg:col-span-9 2xl:col-span-7 2xl:col-start-4 flex flex-col relative">
          <div className="text-[1.65rem] md:text-3xl lg:text-4xl 2xl:text-5xl font-display font-semibold text-gray-400 uppercase leading-[1.1] max-w-[360px] md:max-w-[900px] lg:max-w-[750px] 2xl:max-w-[1000px] relative">
            <span className="hidden md:block absolute left-0 top-[2.5px] md:top-[4.5px] font-archivo font-normal text-xs md:text-sm xl:text-xs 2xl:text-sm text-gray-700">
              <span className="inline-block overflow-hidden">
                <span className="seccion-word inline-block">[ {seccion} ]</span>
              </span>
            </span>
            <span 
              className="titulo-principal md:pl-[6ch] lg:pl-[4.6ch] 2xl:pl-[4.3ch]" 
              style={{ wordSpacing: espaciadoPalabras, overflowWrap: "normal", wordBreak: "keep-all" }}
            >
              {tituloProcesado()}
            </span>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="hidden lg:block lg:col-span-1 2xl:col-span-2 2xl:col-start-11 text-right mt-1 font-archivo font-normal text-sm xl:text-xs 2xl:text-sm text-gray-700">
          <span className="inline-block overflow-hidden">
            <span className="copyright-word inline-block">&copy;2025</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Encabezado;