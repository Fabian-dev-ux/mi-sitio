"use client";
import React, { useEffect, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsapInit";

interface EncabezadoProps {
  numero: string;
  titulo: string;
  seccion: string;
  espaciadoPalabras?: string; // Parámetro para espaciado entre palabras
}

// Reemplazando ParallaxImage con versión GSAP
const ParallaxImage = ({ src, alt }) => {
  const containerRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const parallaxRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !imageWrapperRef.current) return;

    const parallaxTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        // Mover la imagen en dirección opuesta al scroll (efecto parallax)
        // Moviendo de -25% a 25% según la posición del scroll
        const progress = self.progress;
        const yPosition = -25 + (progress * 50); // De -25% a 25%
        gsap.set(imageWrapperRef.current, {
          y: `${yPosition}%`,
        });
      }
    });

    parallaxRef.current = parallaxTrigger;

    return () => {
      if (parallaxRef.current) {
        parallaxRef.current.kill();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden relative"
    >
      <div
        ref={imageWrapperRef}
        style={{
          height: "130%",
          width: "100%",
          position: "absolute",
          top: "-15%",
          left: 0,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
    </div>
  );
};

const Encabezado: React.FC<EncabezadoProps> = ({ 
  numero, 
  titulo, 
  seccion,
  espaciadoPalabras = "normal" // Valor predeterminado
}) => {
  const tituloRef = useRef<HTMLSpanElement>(null);
  const numeroRef = useRef<HTMLDivElement>(null);
  const seccionRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  
  // Referencias para el manejo de animaciones
  const animationContextRef = useRef<gsap.Context | null>(null);
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);

  // Función para configurar todas las animaciones
  const setupAnimations = () => {
    // Eliminar ScrollTriggers existentes para evitar duplicados
    scrollTriggersRef.current.forEach(trigger => trigger.kill());
    scrollTriggersRef.current = [];
    
    // Eliminar el contexto de animación previo si existe
    if (animationContextRef.current) {
      animationContextRef.current.revert();
    }
    
    // Crear nuevo contexto de animación
    animationContextRef.current = gsap.context(() => {
      if (!headerRef.current) return;
      
      // Configuración compartida para ScrollTrigger
      const scrollTriggerConfig = {
        trigger: headerRef.current,
        start: "top 85%",
        toggleActions: "play none none reset"
      };
      
      // Animación para las líneas horizontales
      if (line1Ref.current && line2Ref.current) {
        const lineTrigger = ScrollTrigger.create({
          ...scrollTriggerConfig,
          animation: gsap.fromTo(
            [line1Ref.current, line2Ref.current],
            { 
              scaleX: 0,
              transformOrigin: "left center"
            },
            {
              scaleX: 1,
              duration: 0.8,
              ease: "power2.out",
              stagger: 0.15
            }
          )
        });
        
        scrollTriggersRef.current.push(lineTrigger);
      }

      // Animación para el título
      if (tituloRef.current) {
        const letras = tituloRef.current.querySelectorAll(".letra");
        
        const tituloTrigger = ScrollTrigger.create({
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
              ease: "power2.out"
            }
          )
        });
        
        scrollTriggersRef.current.push(tituloTrigger);
      }

      // Animaciones de revelación de texto para número, sección y nombre
      [numeroRef, seccionRef, nameRef].forEach((ref) => {
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
                    ease: "power3.out"
                  }
                )
              });
              
              scrollTriggersRef.current.push(textTrigger);
            }
          });
        }
      });

      // Animación para los puntos pequeños
      if (dotsRef.current) {
        const dots = dotsRef.current.querySelectorAll(".small-dot");
        const dotsTrigger = ScrollTrigger.create({
          ...scrollTriggerConfig,
          animation: gsap.fromTo(
            dots,
            { scale: 0 },
            { 
              scale: 1, 
              duration: 0.5, 
              stagger: 0.1,
              ease: "back.out(1.7)"
            }
          )
        });
        
        scrollTriggersRef.current.push(dotsTrigger);
      }
    });
  };

  // useLayoutEffect para mediciones DOM antes de pintar
  useLayoutEffect(() => {
    // Solo ejecutar del lado del cliente
    if (typeof window === "undefined") return;
    
    // Pequeño retraso para asegurar que el DOM esté listo
    const initTimer = setTimeout(() => {
      setupAnimations();
    }, 100);
    
    return () => {
      clearTimeout(initTimer);
    };
  }, []);
  
  // Limpiar cuando el componente se desmonta
  useEffect(() => {
    return () => {
      // Limpiar todos los ScrollTriggers y animaciones GSAP
      scrollTriggersRef.current.forEach(trigger => trigger.kill());
      scrollTriggersRef.current = [];
      
      if (animationContextRef.current) {
        animationContextRef.current.revert();
        animationContextRef.current = null;
      }
    };
  }, []);
  
  // Listener para cambios de visibilidad de página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Al volver a la página, refrescar animaciones
        ScrollTrigger.refresh();
        setupAnimations();
      }
    };
    
    // Agregar listener para cuando el usuario regresa a la pestaña
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Forzar refresco cuando se completa el cambio de ruta
    const refreshOnRouteChange = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
        setupAnimations();
      }, 100);
    };
    
    window.addEventListener('popstate', refreshOnRouteChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  // Renderizado del título con espaciado entre palabras explícito
  const renderTitulo = () => {
    // Dividir el título en palabras
    const palabras = titulo.split(" ");
    
    return (
      <span className="lg:pl-[4.6ch]" ref={tituloRef}>
        {palabras.map((palabra, palabraIndex) => (
          <span 
            key={palabraIndex} 
            className="palabra-contenedor" 
            // Aplicar margen a todas las palabras excepto la última
            style={{ 
              display: "inline-block", 
              marginRight: palabraIndex < palabras.length - 1 ? espaciadoPalabras : "0"
            }}
          >
            {palabra.split("").map((char, charIndex) => (
              <span 
                key={`${palabraIndex}-${charIndex}`} 
                className="letra" 
                style={{ display: "inline-block" }}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
      </span>
    );
  };

  return (
    <div ref={headerRef}>
      {/* Border Grid */}
      <div className="grid grid-cols-12 gap-8 mb-0">
        {/* Línea izquierda (oculta en mobile y md) */}
        <div ref={line1Ref} className="hidden lg:block col-span-6 h-[0.25px] bg-gray-800"></div>
        {/* Línea derecha (ocupa todo el ancho en mobile y md) */}
        <div ref={line2Ref} className="col-span-12 lg:col-span-6 h-[0.25px] bg-gray-800"></div>
      </div>

      {/* Contenedor principal con altura uniforme */}
      <div className="grid grid-cols-12 gap-8 items-stretch h-full pt-5 mt-0 text-xs text-gray-400 uppercase">
        {/* Reordenamos las columnas para mobile y md: título primero, luego nombre CEO, luego foto */}
        
        {/* Columna derecha con título y nombre (aparece primero en mobile y md) */}
        <div className="col-span-12 md:col-span-8 lg:col-span-6 lg:order-2 order-1 flex flex-col justify-between relative">
          {/* Título */}
          <div className="text-[1.2rem] lg:text-[2rem] 2xl:text-[2.1rem] font-display font-medium text-gray-400 uppercase leading-[1.1] max-w-[930px] relative">
            <span ref={seccionRef} className="hidden lg:block absolute left-0 top-[4px] lg:top-[1px] 2xl:top-[4.5px] font-archivo font-normal text-xs lg:text-sm text-gray-700">
              {createWordContainers(`[ ${seccion} ]`)}
            </span>
            {renderTitulo()}
          </div>

          {/* Nombre CEO (aparece segundo en mobile y md) */}
          <div ref={nameRef} className="mt-8 lg:mt-[175px] 2xl:mt-[300px] text-xs lg:text-sm font-archivo text-gray-500 uppercase flex items-center relative order-2 lg:order-2">
            {/* Círculo junto al nombre con la misma animación que el texto */}
            <span className="word-container inline-block overflow-hidden mr-2">
              <span className="word inline-block transform translate-y-full opacity-0 text-lg text-gray-700">●</span>
            </span>
            <span className="word-container inline-block overflow-hidden mr-2">
              <span className="word inline-block transform translate-y-full opacity-0">Fabian Barriga C.</span>
            </span>
            <span className="word-container inline-block overflow-hidden">
              <span className="word inline-block transform translate-y-full opacity-0">// CEO ANTAGONICK</span>
            </span>
          </div>
        </div>

        {/* Columna izquierda con número y foto (aparece tercero en mobile y md) */}
        <div className="col-span-12 md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-1 lg:order-1 order-3 flex flex-col h-full justify-between mt-8 md:mt-0 lg:mt-0">
          {/* Número (oculto en mobile y md) */}
          <div ref={numeroRef} className="hidden lg:block mt-1 font-archivo font-normal text-sm text-gray-700">
            {createWordContainers(`/ ${numero}`)}
          </div>

          {/* Contenedor con imagen y esferas */}
          <div ref={dotsRef} className="grid grid-cols-6 h-[350px] lg:h-full items-end">
            {/* Esferas laterales (visibles solo en 2xl, ocultas en lg y xl) */}
            <div className="hidden 2xl:flex lg:hidden col-span-1 flex-col justify-between relative h-[100%] lg:h-[75%]">
              <div className="small-dot absolute left-0 top-0 w-0.5 h-0.5 bg-gray-700 rounded-full"></div>
              <div className="small-dot absolute left-0 bottom-0 w-0.5 h-0.5 bg-gray-700 rounded-full"></div>
            </div>

            {/* Imagen con Parallax - Ocupa columnas 1-4 en lg y xl, y mantiene configuración original en 2xl */}
            <div className="relative w-full h-full lg:h-[75%] col-span-6 
                           lg:col-span-4 xl:col-span-4 2xl:col-span-3 
                           lg:col-start-1 xl:col-start-1 2xl:col-start-2 flex items-end">
              <ParallaxImage src="/images/fabian.bc.webp" alt="Imagen de visión" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Vision = () => {
  // Referencias para el manejo de animaciones
  const sectionRef = useRef<HTMLElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  
  // Configuración inicial y reinicio de animaciones al montar/desmontar
  useLayoutEffect(() => {
    // Solo ejecutar del lado del cliente
    if (typeof window === "undefined") return;
    
    // Crear contexto GSAP
    ctxRef.current = gsap.context(() => {
      // Actualizar ScrollTrigger para que reconozca nuevos elementos en el DOM
      ScrollTrigger.refresh();
    }, sectionRef);
    
    // Pequeño retraso para asegurar que el DOM esté completamente renderizado
    const initTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);
    
    return () => {
      clearTimeout(initTimer);
      
      // Limpiar contexto GSAP al desmontar
      if (ctxRef.current) {
        ctxRef.current.revert();
        ctxRef.current = null;
      }
    };
  }, []);
  
  // Listener para eventos de navegación y visibilidad
  useEffect(() => {
    // Manejar cambios de visibilidad (cuando el usuario regresa a la pestaña)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        ScrollTrigger.refresh();
      }
    };
    
    // Manejar navegación entre páginas
    const handleRouteChange = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    };
    
    // Agregar event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      // Remover event listeners al desmontar
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleRouteChange);
      
      // Matar todos los ScrollTriggers asociados a esta sección
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger && 
            sectionRef.current?.contains(trigger.vars.trigger as Element)) {
          trigger.kill();
        }
      });
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative z-10 bg-dark text-white px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 pt-10 md:pt-16 lg:pt-20 2xl:pt-32 pb-12 lg:pb-24 2xl:pb-32" 
      id="perspectiva"
    >
      <Encabezado
        numero="04"
        seccion="Visión"
        titulo="En un mundo saturado de información, nosotros creamos claridad. En un entorno digital impersonal, construimos conexiones auténticas. Acompañamos a cada cliente entendiendo que detrás de cada marca hay personas con sueños y la determinación de hacer la diferencia."
        espaciadoPalabras="0.6rem" // Define el espaciado entre palabras
      />
    </section>
  );
};

export default Vision;