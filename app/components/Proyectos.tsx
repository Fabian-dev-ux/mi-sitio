"use client";
import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import CircularRotatingText from './RotatingText';
import Encabezado from './Encabezado';
import { gsap, ScrollTrigger } from "@/lib/gsapInit";

// Interfaces para tipado
interface ProjectData {
  images: string[];
  mobileImages: string[]; // Nueva propiedad para imágenes móviles
  title: string;
  tags: string[];
  year: string;
  url?: string; // Agregamos URL opcional para cada proyecto
}

interface ParallaxImageProps {
  src: string;
  mobileSrc: string; // Nueva propiedad
  alt: string;
}

interface ProjectCardProps {
  project: ProjectData;
  index: number;
}

// Extensión del HTMLElement para agregar propiedades personalizadas
interface HTMLElementWithHandlers extends HTMLElement {
  _mouseEnterHandler?: () => void;
  _mouseLeaveHandler?: () => void;
}

const Proyectos: React.FC = () => {
  const projectsData: ProjectData[] = [
    {
      images: ["/images/proyectos/proyecto1.webp"],
      mobileImages: ["/images/proyectos/proyecto1-mobile.webp"], // Nueva
      title: "Sisawiru",
      tags: ["Branding", "Packaging"],
      year: "/2024",
      url: "https://www.behance.net/gallery/132235883/SISAWIRU-VISUAL-IDENTITY"
    },
    {
      images: ["/images/proyectos/proyecto2.webp"],
      mobileImages: ["/images/proyectos/proyecto2-mobile.webp"], // Nueva
      title: "593 SECURITY",
      tags: ["UX", "UI", "Webflow"],
      year: "/2025",
      url: "https://593security.com"
    },
    {
      images: ["/images/proyectos/proyecto3.webp"],
      mobileImages: ["/images/proyectos/proyecto3-mobile.webp"], // Nueva
      title: "LOGOFOLIO",
      tags: ["Identidad visual", "Logo design"],
      year: "/2023",
      url: "https://www.behance.net/gallery/123418427/LOGOS-2021"
    },
    {
      images: ["/images/proyectos/proyecto4.webp"],
      mobileImages: ["/images/proyectos/proyecto4-mobile.webp"], // Nueva
      title: "YOKUN",
      tags: ["Branding", "Identidad visual"],
      year: "/2025"
      // No URL para YOKUN ya que está "PRÓXIMAMENTE"
    }
  ];

  // Referencia para el contenedor principal de proyectos
  const projectsContainerRef = useRef<HTMLElement>(null);

  // Referencia para almacenar el contexto de animación
  const animationContextRef = useRef<gsap.Context | null>(null);

  // Referencia para almacenar ScrollTriggers
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);

  // Estado para manejar la inicialización
  const [isReady, setIsReady] = useState<boolean>(false);

  // Hook para detectar cambios de ruta en Next.js
  const pathname = usePathname();

  // Función helper para generar srcSet
  const generateSrcSet = (desktopSrc: string, mobileSrc: string): string => {
    return `${mobileSrc} 481w, ${desktopSrc} 1200w`;
  };

  // Función helper para generar sizes
  const generateSizes = (): string => {
    return "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw";
  };

  // Función para manejar el click en un proyecto
  const handleProjectClick = (project: ProjectData): void => {
    if (project.url) {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Función para limpiar animaciones existentes
  const cleanupAnimations = (): void => {
    // Limpiar ScrollTriggers específicos de este componente
    scrollTriggersRef.current.forEach(trigger => {
      if (trigger && trigger.kill) {
        trigger.kill();
      }
    });
    scrollTriggersRef.current = [];

    // Revertir el contexto de animación si existe
    if (animationContextRef.current) {
      animationContextRef.current.revert();
      animationContextRef.current = null;
    }
  };

  // Función para configurar animaciones hover
  const setupHoverAnimations = (): void => {
    if (!projectsContainerRef.current) return;

    const projectCards = projectsContainerRef.current.querySelectorAll('.project-card');

    projectCards.forEach((card) => {
      const cardElement = card as HTMLElementWithHandlers;
      const image = card.querySelector('.project-image') as HTMLElement;

      // Remover handlers anteriores si existen
      if (cardElement._mouseEnterHandler) {
        cardElement.removeEventListener('mouseenter', cardElement._mouseEnterHandler);
      }
      if (cardElement._mouseLeaveHandler) {
        cardElement.removeEventListener('mouseleave', cardElement._mouseLeaveHandler);
      }

      // Crear nuevos handlers para hover de las tarjetas de proyecto
      const handleMouseEnter = (): void => {
        if (image) {
          gsap.to(image, {
            scale: 1.05,
            duration: 0.8,
            ease: "power2.out"
          });
        }
      };

      const handleMouseLeave = (): void => {
        if (image) {
          gsap.to(image, {
            scale: 1,
            duration: 0.8,
            ease: "power2.out"
          });
        }
      };

      // Guardar referencias a los handlers
      cardElement._mouseEnterHandler = handleMouseEnter;
      cardElement._mouseLeaveHandler = handleMouseLeave;

      // Agregar event listeners
      cardElement.addEventListener('mouseenter', handleMouseEnter);
      cardElement.addEventListener('mouseleave', handleMouseLeave);
    });
  };

  // Función para inicializar animaciones
  const setupAnimations = (): void => {
    if (!projectsContainerRef.current || !isReady) return;

    // Limpiar animaciones previas
    cleanupAnimations();

    // Crear nuevo contexto GSAP
    animationContextRef.current = gsap.context(() => {
      // Animaciones para líneas de proyecto
      const lines = projectsContainerRef.current!.querySelectorAll('.project-line');
      lines.forEach((line) => {
        const lineTrigger = ScrollTrigger.create({
          trigger: line as Element,
          start: "top 90%",
          end: "bottom 10%",
          toggleActions: "play none none reverse",
          markers: false,
          animation: gsap.fromTo(
            line,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 1.2, ease: "power2.out" }
          )
        });
        scrollTriggersRef.current.push(lineTrigger);
      });

      // Animaciones para títulos de proyecto
      const projectTitles = projectsContainerRef.current!.querySelectorAll('.project-title');
      projectTitles.forEach((title) => {
        const titleTrigger = ScrollTrigger.create({
          trigger: title.closest('.project-card') as Element,
          start: "top 60%",
          toggleActions: "play none none reverse",
          animation: gsap.fromTo(
            title,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
          )
        });
        scrollTriggersRef.current.push(titleTrigger);
      });

      // Animaciones para etiquetas de proyecto
      const projectTags = projectsContainerRef.current!.querySelectorAll('.project-tags');
      projectTags.forEach((tags) => {
        const tagsTrigger = ScrollTrigger.create({
          trigger: tags.closest('.project-card') as Element,
          start: "top 60%",
          toggleActions: "play none none reverse",
          animation: gsap.fromTo(
            tags,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, delay: 0.1, ease: "power3.out" }
          )
        });
        scrollTriggersRef.current.push(tagsTrigger);
      });

      // Animaciones para año de proyecto
      const projectYears = projectsContainerRef.current!.querySelectorAll('.project-year');
      projectYears.forEach((year) => {
        const yearTrigger = ScrollTrigger.create({
          trigger: year.closest('.project-card') as Element,
          start: "top 60%",
          toggleActions: "play none none reverse",
          animation: gsap.fromTo(
            year,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, delay: 0.2, ease: "power3.out" }
          )
        });
        scrollTriggersRef.current.push(yearTrigger);
      });

      // Configuración de parallax para imágenes
      const parallaxImages = projectsContainerRef.current!.querySelectorAll('.parallax-image-wrapper');
      parallaxImages.forEach((wrapper) => {
        const container = wrapper.closest('.parallax-container');
        const parallaxTrigger = ScrollTrigger.create({
          trigger: container as Element,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true,
          animation: gsap.fromTo(
            wrapper,
            { y: "-35%" },
            { y: "35%", ease: "none" }
          )
        });
        scrollTriggersRef.current.push(parallaxTrigger);
      });
    }, projectsContainerRef);

    // Configurar animaciones hover
    setupHoverAnimations();
  };

  // useLayoutEffect para mediciones DOM antes del renderizado
  useLayoutEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === "undefined") return;

    setIsReady(true);

    return () => {
      cleanupAnimations();
      setIsReady(false);
    };
  }, []);

  // useEffect para inicializar animaciones cuando todo esté listo
  useEffect(() => {
    if (!isReady) return;

    const timer = setTimeout(() => {
      setupAnimations();
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isReady, pathname]);

  // useEffect para manejar cambios de visibilidad y navegación
  useEffect(() => {
    if (!isReady) return;

    const handleVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        // Refrescar animaciones cuando la página vuelve a ser visible
        ScrollTrigger.refresh();
        setTimeout(() => {
          setupAnimations();
        }, 100);
      }
    };

    // Event listener para cambios de visibilidad
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Event listener para cambios de ruta con Next.js
    const handleRouteChange = (): void => {
      setTimeout(() => {
        ScrollTrigger.refresh();
        setupAnimations();
      }, 100);
    };

    // Para navegación con el botón atrás/adelante del navegador
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [isReady]);

  // Componente ParallaxImage con funcionalidad de botón de seguimiento
  const ParallaxImage: React.FC<ParallaxImageProps & { projectTitle?: string; onImageClick?: () => void; index?: number }> = ({ 
    src, 
    mobileSrc, // Nueva prop
    alt, 
    projectTitle, 
    onImageClick,
    index = 0
  }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [showButton, setShowButton] = useState<boolean>(false);

    // Referencias para el seguimiento del cursor
    const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const buttonPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | null>(null);
    const currentAnimationRef = useRef<gsap.core.Tween | null>(null);

    // Referencias para el seguimiento global del cursor
    const lastViewportPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isMouseInside = useRef<boolean>(false);
    const isScrolling = useRef<boolean>(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Función para animar la posición del botón
    const animateButtonPosition = (): void => {
      if (!buttonRef.current || !showButton || !isMouseInside.current) {
        animationFrameRef.current = null;
        return;
      }

      const lerp = (start: number, end: number, factor: number): number => start + (end - start) * factor;
      
      // Durante el scroll, usar actualización más directa para evitar lag
      if (isScrolling.current) {
        // Durante scroll, actualizar posición más directamente
        buttonPosition.current.x = mousePosition.current.x;
        buttonPosition.current.y = mousePosition.current.y;
      } else {
        // Fuera del scroll, usar animación suave normal
        const ease = 0.2;
        buttonPosition.current.x = lerp(buttonPosition.current.x, mousePosition.current.x, ease);
        buttonPosition.current.y = lerp(buttonPosition.current.y, mousePosition.current.y, ease);
      }

      gsap.set(buttonRef.current, {
        x: buttonPosition.current.x,
        y: buttonPosition.current.y,
        xPercent: -50,
        yPercent: -50
      });

      const deltaX = Math.abs(mousePosition.current.x - buttonPosition.current.x);
      const deltaY = Math.abs(mousePosition.current.y - buttonPosition.current.y);

      // Continuar animando mientras haya diferencia significativa o durante scroll
      if ((deltaX > 0.3 || deltaY > 0.3 || isScrolling.current) && showButton && isMouseInside.current) {
        animationFrameRef.current = requestAnimationFrame(animateButtonPosition);
      } else {
        animationFrameRef.current = null;
      }
    };

    // Función para manejar el scroll
    const handleScroll = (): void => {
      if (!showButton || !isMouseInside.current || !containerRef.current) {
        return;
      }

      // Marcar que estamos scrolleando
      isScrolling.current = true;

      // Limpiar timeout anterior
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Recalcular la posición relativa del cursor respecto al elemento
      const rect = containerRef.current.getBoundingClientRect();
      const cursorX = lastViewportPosition.current.x;
      const cursorY = lastViewportPosition.current.y;
      
      // Calcular nueva posición relativa
      const newRelativeX = cursorX - rect.left;
      const newRelativeY = cursorY - rect.top;
      
      // Verificar si el cursor sigue dentro del elemento después del scroll
      const isStillInside = newRelativeX >= 0 && newRelativeX <= rect.width && 
                           newRelativeY >= 0 && newRelativeY <= rect.height;

      if (isStillInside) {
        // Actualizar la posición del cursor relativa al elemento
        mousePosition.current = { x: newRelativeX, y: newRelativeY };
        
        // Forzar actualización inmediata de la posición del botón
        if (buttonRef.current) {
          // Actualizar directamente la posición objetivo del botón
          gsap.set(buttonRef.current, {
            x: newRelativeX,
            y: newRelativeY,
            xPercent: -50,
            yPercent: -50
          });
          
          // Actualizar también la posición de seguimiento
          buttonPosition.current = { x: newRelativeX, y: newRelativeY };
        }
        
        // Iniciar/continuar la animación suave si no está corriendo
        if (!animationFrameRef.current) {
          animationFrameRef.current = requestAnimationFrame(animateButtonPosition);
        }
      } else {
        // Si el cursor ya no está dentro después del scroll, ocultar el botón
        isMouseInside.current = false;
        handleMouseLeave();
        return;
      }

      // Resetear el flag de scroll después de un delay
      scrollTimeoutRef.current = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!containerRef.current || !showButton) return;

      // Actualizar posición global del cursor
      lastViewportPosition.current = { x: e.clientX, y: e.clientY };

      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      mousePosition.current = { x: relativeX, y: relativeY };

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(animateButtonPosition);
      }
    };

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>): void => {
      if (!containerRef.current) return;

      isMouseInside.current = true;
      
      // Guardar posición inicial
      lastViewportPosition.current = { x: e.clientX, y: e.clientY };
      
      const rect = containerRef.current.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;
      
      mousePosition.current = { x: relativeX, y: relativeY };
      buttonPosition.current = { x: relativeX, y: relativeY };

      setShowButton(true);
    };

    const handleMouseLeave = (): void => {
      isMouseInside.current = false;

      if (currentAnimationRef.current) {
        currentAnimationRef.current.kill();
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (buttonRef.current) {
        currentAnimationRef.current = gsap.to(buttonRef.current, {
          scale: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            setShowButton(false);
          }
        });
      }
    };

    // Manejar click en el contenedor
    const handleContainerClick = (): void => {
      if (onImageClick) {
        onImageClick();
      }
    };

    // Efecto para animar la entrada del botón
    useEffect(() => {
      if (showButton && buttonRef.current) {
        gsap.set(buttonRef.current, {
          x: buttonPosition.current.x,
          y: buttonPosition.current.y,
          xPercent: -50,
          yPercent: -50,
          scale: 0,
          opacity: 0
        });

        currentAnimationRef.current = gsap.to(buttonRef.current, {
          scale: 1,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
          onComplete: () => {
            // Iniciar seguimiento después de que aparezca
            if (!animationFrameRef.current) {
              animationFrameRef.current = requestAnimationFrame(animateButtonPosition);
            }
          }
        });
      }
    }, [showButton]);

    // Listener para el scroll
    useEffect(() => {
      window.addEventListener('scroll', handleScroll, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, [showButton]);

    // Cleanup
    useEffect(() => {
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        if (currentAnimationRef.current) {
          currentAnimationRef.current.kill();
        }
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }, []);

    return (
      <div className="relative h-[250px] md:h-[300px] lg:h-[310px] xl:h-[350px] 2xl:h-[450px]">
        <div
          ref={containerRef}
          className="parallax-container h-full w-full relative cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleContainerClick}
        >
          <div className="absolute inset-0 overflow-hidden">
            <div
              className="parallax-image-wrapper"
              style={{
                height: "130%",
                width: "100%",
                position: "absolute",
                top: "-15%",
                left: 0,
              }}
            >
              <Image
                src={src} // Imagen por defecto (desktop)
                alt={alt}
                fill
                // Implementación responsive
                srcSet={generateSrcSet(src, mobileSrc)}
                sizes={generateSizes()}
                priority={index === 0} // Solo la primera imagen tiene prioridad
                className="object-cover project-image transition-transform duration-100"
                style={{
                  transition: "transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  transform: `scale(1)`
                }}
              />
            </div>
          </div>

          {/* Botón píldora redondeado */}
          <div
            ref={buttonRef}
            className="absolute h-12 px-6 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center text-gray-300 font-archivo font-medium text-sm md:text-base uppercase tracking-wider pointer-events-none"
            style={{
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
              zIndex: 50,
              left: 0,
              top: 0,
              opacity: 0,
              transform: 'scale(0) translate(-50%, -50%)',
              display: showButton ? 'flex' : 'none',
              borderRadius: '24px', // Hace el botón tipo píldora
              minWidth: 'fit-content',
              whiteSpace: 'nowrap'
            }}
          >
            {projectTitle === 'YOKUN' ? 'PRÓXIMAMENTE' : '[VER]'}
          </div>
        </div>
      </div>
    );
  };

  const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => (
    <div 
      className="project-card flex flex-col h-full shadow-lg cursor-pointer" 
      style={{ position: 'relative', overflow: 'visible' }}
      onClick={() => handleProjectClick(project)}
    >
      <ParallaxImage 
        src={project.images[0]} 
        mobileSrc={project.mobileImages[0]} // Nueva prop
        alt={`${project.title} Image`} 
        projectTitle={project.title}
        onImageClick={() => handleProjectClick(project)}
        index={index} // Pasar el índice para prioridad
      />
      <div className="pt-5 pb-1 flex-grow flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="overflow-hidden">
            <h2 className="project-title text-[1.05rem] md-[1.125rem] font-archivo font-medium uppercase text-gray-400">
              {project.title}
            </h2>
          </div>

          <div className="overflow-hidden">
            <div className="project-tags flex items-center space-x-1">
              {project.tags.map((tag, tagIndex) => (
                <span key={tagIndex} className="text-sm font-archivo text-gray-700">
                  {tagIndex > 0 && "·"} {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="project-year text-sm font-archivo text-gray-700">
            {project.year}
          </div>
        </div>
      </div>
      {/* Línea consistente con altura fija en píxeles y sin border-radius */}
      <div
        className="project-line w-full bg-gray-800 mt-2"
        style={{ 
          height: '0.25px',
          transformOrigin: "left center", 
          transform: "scaleX(0)",
          borderRadius: '0',
          minHeight: '0.25px',
          maxHeight: '0.25px'
        }}
      ></div>
    </div>
  );

  return (
    <section ref={projectsContainerRef} className="bg-dark text-white w-full py-2 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 pt-10 md:pt-16 lg:pt-20  2xl:pt-32" id="proyectos">
      <Encabezado numero="02" seccion="Proyectos" titulo="Convertimos los retos creativos en oportunidades de crear algo memorable" />

      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 mt-12 md:mt-16 lg:mt-24 2xl:mt-32" style={{ overflow: 'visible' }}>
        <div className="hidden 2xl:flex md:col-span-1 flex-col justify-between relative">
          <div className="absolute left-0 top-0 w-0.5 h-0.5 bg-gray-700"></div>
          <div className="absolute left-0 bottom-0 w-0.5 h-0.5 bg-gray-700"></div>
        </div>

        <div className="col-span-1 md:col-span-12 2xl:col-span-11">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8" style={{ overflow: 'visible' }}>
            <div className="col-span-1 md:col-span-3 w-full">
              <ProjectCard project={projectsData[0]} index={0} />
            </div>
            <div className="col-span-1 md:col-span-3 w-full">
              <ProjectCard project={projectsData[1]} index={1} />
            </div>
            <div className="col-span-1 md:col-span-3 lg:col-span-2 w-full">
              <ProjectCard project={projectsData[2]} index={2} />
            </div>
            <div className="col-span-1 md:col-span-3 lg:col-span-2 w-full">
              <ProjectCard project={projectsData[3]} index={3} />
            </div>
            <div className="col-span-1 md:hidden lg:block lg:col-span-2 pt-4 md:pt-0 w-full relative h-auto lg:h-full 2xl:max-h-[500px] 2xl:aspect-square flex items-center justify-center">
              <CircularRotatingText />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Proyectos;