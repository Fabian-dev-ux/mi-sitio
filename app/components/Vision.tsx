"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsapInit";
import { useGSAP } from "@gsap/react";

interface EncabezadoProps {
  numero: string;
  titulo: string;
  seccion: string;
  espaciadoPalabras?: string;
}

interface ParallaxImageProps {
  src: string;
  alt: string;
}

const ParallaxImage: React.FC<ParallaxImageProps> = ({ src, alt }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  // Detectar si es móvil al montar y en resize
  React.useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      setIsMobile(newIsMobile);
      
      // Si cambia a móvil y hay un ScrollTrigger activo, destruirlo
      if (newIsMobile && scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
        
        // Resetear la posición de la imagen
        if (imageWrapperRef.current) {
          gsap.set(imageWrapperRef.current, {
            y: "0%",
            clearProps: "transform"
          });
        }
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      // Limpiar ScrollTrigger al desmontar
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, []);

  useGSAP(() => {
    if (!containerRef.current || !imageWrapperRef.current || isMobile) {
      // Si es móvil, asegurar que la imagen esté en posición normal
      if (isMobile && imageWrapperRef.current) {
        gsap.set(imageWrapperRef.current, {
          y: "0%",
          clearProps: "transform"
        });
      }
      return;
    }

    // Limpiar ScrollTrigger anterior si existe
    if (scrollTriggerRef.current) {
      scrollTriggerRef.current.kill();
    }

    // Solo crear el ScrollTrigger en desktop
    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress;
        const yPosition = -25 + (progress * 50);
        gsap.set(imageWrapperRef.current, {
          y: `${yPosition}%`,
        });
      }
    });

    return () => {
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
        scrollTriggerRef.current = null;
      }
    };
  }, { scope: containerRef, dependencies: [isMobile] });

  return (
    <div
      ref={containerRef}
      className="h-full w-full overflow-hidden relative"
    >
      <div
        ref={imageWrapperRef}
        style={{
          // En móvil, usar dimensiones normales; en desktop, usar las dimensiones para parallax
          height: isMobile ? "100%" : "130%",
          width: "100%",
          position: "absolute",
          top: isMobile ? "0" : "-15%",
          left: 0,
        }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority={false}
        />
      </div>
    </div>
  );
};

const Encabezado: React.FC<EncabezadoProps> = ({ 
  numero, 
  titulo, 
  seccion,
  espaciadoPalabras = "normal"
}) => {
  const tituloRef = useRef<HTMLSpanElement>(null);
  const numeroRef = useRef<HTMLDivElement>(null);
  const seccionRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!headerRef.current) return;
    
    const scrollTriggerConfig = {
      trigger: headerRef.current,
      start: "top 85%",
      toggleActions: "play none none reset"
    };
    
    // Animación para las líneas horizontales
    if (line1Ref.current && line2Ref.current) {
      gsap.fromTo(
        [line1Ref.current, line2Ref.current],
        { 
          scaleX: 0,
          transformOrigin: "left center"
        },
        {
          scaleX: 1,
          duration: 0.8,
          ease: "power2.out",
          stagger: 0.15,
          scrollTrigger: scrollTriggerConfig
        }
      );
    }

    // Animación para el título
    if (tituloRef.current) {
      const letras = tituloRef.current.querySelectorAll(".letra");
      
      gsap.fromTo(
        letras,
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
            scrub: true,
          }
        }
      );
    }

    // Animaciones de revelación de texto
    [numeroRef, seccionRef, nameRef].forEach((ref) => {
      if (ref.current) {
        const wordContainers = ref.current.querySelectorAll(".word-container");
        
        wordContainers.forEach((container) => {
          const word = container.querySelector(".word");
          
          if (word) {
            gsap.fromTo(
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
                scrollTrigger: scrollTriggerConfig
              }
            );
          }
        });
      }
    });

    // Animación para los puntos pequeños
    if (dotsRef.current) {
      const dots = dotsRef.current.querySelectorAll(".small-dot");
      gsap.fromTo(
        dots,
        { scale: 0 },
        { 
          scale: 1, 
          duration: 0.5, 
          stagger: 0.1,
          ease: "back.out(1.7)",
          scrollTrigger: scrollTriggerConfig
        }
      );
    }
  }, { scope: headerRef });

  const createWordContainers = (text: string) => {
    return text.split(" ").map((word, index) => (
      <span key={index} className="word-container inline-block overflow-hidden mr-1">
        <span className="word inline-block transform translate-y-full opacity-0">{word}</span>
      </span>
    ));
  };

  const renderTitulo = () => {
    const palabras = titulo.split(" ");
    
    return (
      <span className="lg:pl-[4.6ch]" ref={tituloRef}>
        {palabras.map((palabra, palabraIndex) => (
          <span 
            key={palabraIndex} 
            className="palabra-contenedor" 
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
        <div ref={line1Ref} className="hidden lg:block col-span-6 h-[0.25px] bg-gray-800"></div>
        <div ref={line2Ref} className="col-span-12 lg:col-span-6 h-[0.25px] bg-gray-800"></div>
      </div>

      {/* Contenedor principal */}
      <div className="grid grid-cols-12 gap-8 items-stretch h-full pt-5 mt-0 text-xs text-gray-400 uppercase">
        <div className="col-span-12 md:col-span-8 lg:col-span-6 lg:order-2 order-1 flex flex-col justify-between relative">
          <div className="text-[1.2rem] lg:text-[2rem] 2xl:text-[2.1rem] font-display font-medium text-gray-400 uppercase leading-[1.1] max-w-[930px] relative">
            <span ref={seccionRef} className="hidden lg:block absolute left-0 top-[4px] lg:top-[1px] 2xl:top-[4.5px] font-archivo font-normal text-xs lg:text-sm text-gray-700">
              {createWordContainers(`[ ${seccion} ]`)}
            </span>
            {renderTitulo()}
          </div>

          <div ref={nameRef} className="mt-8 lg:mt-[175px] 2xl:mt-[300px] text-xs lg:text-sm font-archivo text-gray-500 uppercase flex items-center relative order-2 lg:order-2">
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

        <div className="col-span-12 md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-1 lg:order-1 order-3 flex flex-col h-full justify-between mt-8 md:mt-0 lg:mt-0">
          <div ref={numeroRef} className="hidden lg:block mt-1 font-archivo font-normal text-sm text-gray-700">
            {createWordContainers(`/ ${numero}`)}
          </div>

          <div ref={dotsRef} className="grid grid-cols-6 h-[350px] lg:h-full items-end">
            <div className="hidden 2xl:flex lg:hidden col-span-1 flex-col justify-between relative h-[100%] lg:h-[75%]">
              <div className="small-dot absolute left-0 top-0 w-0.5 h-0.5 bg-gray-700 rounded-full"></div>
              <div className="small-dot absolute left-0 bottom-0 w-0.5 h-0.5 bg-gray-700 rounded-full"></div>
            </div>

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

const Vision: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  useGSAP(() => {
    ScrollTrigger.refresh();
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef}
      className="relative z-10 bg-dark text-white px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 pt-10 md:pt-16 lg:pt-20 2xl:pt-32 pb-12 lg:pb-24 2xl:pb-32" 
      id="visión"
    >
      <Encabezado
        numero="04"
        seccion="Visión"
        titulo="En un mundo saturado de información, nosotros creamos claridad. En un entorno digital impersonal, construimos conexiones auténticas. Acompañamos a cada cliente entendiendo que detrás de cada marca hay personas con sueños y la determinación de hacer la diferencia."
        espaciadoPalabras="0.6rem"
      />
    </section>
  );
};

export default Vision;