'use client';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Encabezado from './Encabezado';

// Dynamic import del componente Fragmento con loading mejorado
const Fragmento = dynamic(() => import('./Fragmento'), {
  loading: () => null, // Sin loading placeholder aquí
  ssr: false // Importante: Three.js requiere APIs del navegador
});

interface Etapa {
  numero: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  tags: string[];
}

interface CardProps {
  etapa: Etapa;
  index: number;
}

const ProcesoSectionSticky: React.FC = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  
  // Estados para controlar el modelo 3D
  const [should3DLoad, setShould3DLoad] = useState<boolean>(false);
  const [is3DLoaded, setIs3DLoaded] = useState<boolean>(false);

  const etapas: Etapa[] = [
    {
      numero: "01",
      titulo: "Descubrimiento",
      descripcion: "Analizamos objetivos, marca y audiencia para comprender necesidades y definir la dirección creativa del proyecto.",
      imagen: "/images/proceso/diseno.jpg",
      tags: ["Research", "Branding"]
    },
    {
      numero: "02", 
      titulo: "Planificación",
      descripcion: "Desarrollamos conceptos visuales, definimos identidad gráfica y creamos propuestas que conecten con tu audiencia.",
      imagen: "/images/proceso/estrategia.jpg",
      tags: ["Concept", "Design"]
    },
    {
      numero: "03",
      titulo: "Desarrollo",
      descripcion: " Ejecutamos la propuesta creativa aplicando las mejores técnicas de diseño y desarrollo para cada medio específico.",
      imagen: "/images/proceso/desarrollo.jpg",
      tags: ["Creation", "Development"]
    },
    {
      numero: "04",
      titulo: "Entrega",
      descripcion: "Entregamos el proyecto finalizado con todos los recursos necesarios y acompañamiento para su correcta aplicación.",
      imagen: "/images/proceso/lanzamiento.jpg",
      tags: ["Delivery", "Support"]
    }
  ];

  // Crear slides extendidos para el loop infinito
  const extendedEtapas: Etapa[] = [
    etapas[etapas.length - 1], // Último slide al inicio
    ...etapas, // Slides originales
    etapas[0] // Primer slide al final
  ];

  // Detectar si es mobile
  useEffect(() => {
    const checkIsMobile = (): void => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Efecto para inicializar la carga del modelo 3D
  useEffect(() => {
    if (!isMobile) {
      // Pequeño delay para cargar el modelo 3D
      const timer = setTimeout(() => {
        setShould3DLoad(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isMobile]);

  // Simular el evento de carga del modelo 3D
  useEffect(() => {
    if (should3DLoad && !isMobile) {
      // Simular tiempo de carga del modelo 3D
      const loadTimer = setTimeout(() => {
        setIs3DLoaded(true);
      }, 1500);
      
      return () => clearTimeout(loadTimer);
    }
  }, [should3DLoad, isMobile]);

  // Inicializar en el primer slide real
  useEffect(() => {
    if (isMobile) {
      setCurrentSlide(1); // Empezar en el primer slide real (no en el duplicado)
      setIsTransitioning(false);
    }
  }, [isMobile]);

  // Funciones para el carousel mobile con loop infinito suave
  const nextSlide = (): void => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSlide(prev => prev + 1);
  };

  const prevSlide = (): void => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSlide(prev => prev - 1);
  };

  // Función para ir a un slide específico
  const goToSlide = (index: number): void => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setCurrentSlide(index + 1); // +1 porque el primer slide real está en índice 1
  };

  // Manejar el loop infinito después de la transición
  useEffect(() => {
    if (!isMobile || !isTransitioning) return;

    const handleTransitionEnd = (): void => {
      setIsTransitioning(false);
      
      // Si llegamos al slide duplicado del final, saltar al inicio real
      if (currentSlide >= extendedEtapas.length - 1) {
        setCurrentSlide(1); // Ir al primer slide real
      }
      // Si llegamos al slide duplicado del inicio, saltar al final real
      else if (currentSlide <= 0) {
        setCurrentSlide(etapas.length); // Ir al último slide real
      }
    };

    const timer = setTimeout(handleTransitionEnd, 500); // Duración de la transición CSS
    return () => clearTimeout(timer);
  }, [currentSlide, isTransitioning, isMobile, extendedEtapas.length, etapas.length]);

  // Función para animar imágenes sincronizadamente
  const animateImages = (activeIndex: number, images: HTMLImageElement[]): void => {
    images.forEach((image, index) => {
      if (index === activeIndex) {
        // Imagen que aparece
        image.style.transform = 'translateY(0)';
        image.style.opacity = '1';
        image.style.transition = 'all 0.5s ease-out';
      } else {
        // Imagen que desaparece
        image.style.transform = 'translateY(-50px)';
        image.style.opacity = '0';
        image.style.transition = 'all 0.5s ease-out';
      }
    });
  };

  // Efecto para manejar animaciones de imágenes en mobile - VERSIÓN SINCRONIZADA
  useEffect(() => {
    if (isMobile && cardsRef.current) {
      const images = cardsRef.current.querySelectorAll<HTMLImageElement>('.card-image');
      const activeIndex = currentSlide;
      
      // Ejecutar animaciones simultáneamente
      animateImages(activeIndex, Array.from(images));
    }
  }, [currentSlide, isMobile]);

  // Efecto para el scroll en desktop - VERSIÓN SINCRONIZADA
  useEffect(() => {
    if (isMobile) return;

    let ticking = false;
    let lastActiveIndex = 0;

    const handleScroll = (): void => {
      if (!ticking && cardsRef.current && containerRef.current) {
        requestAnimationFrame(() => {
          // Add null checks here as well
          if (!cardsRef.current || !containerRef.current) {
            ticking = false;
            return;
          }

          const container = containerRef.current;
          const containerRect = container.getBoundingClientRect();
          const containerTop = containerRect.top;
          const containerHeight = container.offsetHeight;
          const windowHeight = window.innerHeight;

          // Calcular el progreso de manera más rápida
          const startTrigger = windowHeight * 0.3;
          const endTrigger = -containerHeight + windowHeight * 0.7;

          let progress = 0;
          
          if (containerTop <= startTrigger && containerTop >= endTrigger) {
            const totalScrollDistance = startTrigger - endTrigger;
            const currentScrollDistance = startTrigger - containerTop;
            progress = Math.max(0, Math.min(1, currentScrollDistance / totalScrollDistance));
            progress = Math.pow(progress, 0.8);
          } else if (containerTop < endTrigger) {
            progress = 1;
          }

          const smoothProgress = progress;
          
          // Aplicar transformación con centrado perfecto
          const cardWidth = 400;
          const cardGap = 48;
          const cardTotalWidth = cardWidth + cardGap;
          const maxTranslateX = (etapas.length - 1) * cardTotalWidth;
          
          const viewportWidth = window.innerWidth;
          const cardHalfWidth = cardWidth / 2;
          const perfectCenter = (viewportWidth / 2) - cardHalfWidth;
          
          const translateX = perfectCenter - (smoothProgress * maxTranslateX);
          
          // Additional null check before applying transform
          if (cardsRef.current) {
            cardsRef.current.style.transform = `translateX(${translateX}px)`;
          }

          // Determinar card activo con mejor precisión
          const rawActiveIndex = smoothProgress * (etapas.length - 1);
          const activeIndex = Math.round(rawActiveIndex);
          
          // Solo animar si cambió el índice activo
          if (activeIndex !== lastActiveIndex && cardsRef.current) {
            const cards = cardsRef.current.children;
            const images = Array.from(cards).map(card => card.querySelector<HTMLImageElement>('.card-image')).filter((img): img is HTMLImageElement => img !== null);
            
            // Ejecutar animaciones sincronizadas
            animateImages(activeIndex, images);
            
            lastActiveIndex = activeIndex;
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Configuración inicial con centrado perfecto
    const setupCards = (): void => {
      if (!cardsRef.current) return;
      
      const cardWidth = 400;
      const cardGap = 48;
      
      // Configurar estilos iniciales
      cardsRef.current.style.display = 'flex';
      cardsRef.current.style.gap = `${cardGap}px`;
      cardsRef.current.style.paddingLeft = '0px';
      cardsRef.current.style.paddingRight = '10vw';
      cardsRef.current.style.willChange = 'transform';
      
      const viewportWidth = window.innerWidth;
      const cardHalfWidth = cardWidth / 2;
      const perfectCenter = (viewportWidth / 2) - cardHalfWidth;
      
      cardsRef.current.style.transform = `translateX(${perfectCenter}px)`;
      
      // Configurar cada card e inicializar imágenes
      Array.from(cardsRef.current.children).forEach((card, index) => {
        const cardElement = card as HTMLElement;
        cardElement.style.minWidth = `${cardWidth}px`;
        cardElement.style.flexShrink = '0';
        
        const image = cardElement.querySelector<HTMLImageElement>('.card-image');
        if (image) {
          if (index === 0) {
            image.style.transform = 'translateY(0)';
            image.style.opacity = '1';
          } else {
            image.style.transform = 'translateY(-50px)';
            image.style.opacity = '0';
          }
          image.style.transition = 'all 0.5s ease-out';
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setupCards();
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, etapas.length]);

  // Componente Card para reutilizar
  const Card: React.FC<CardProps> = ({ etapa, index }) => (
    <div className={`flex-shrink-0 ${isMobile ? 'w-full' : 'w-[400px]'}`}>
      <div className="flex flex-col h-full p-6">
        
        {/* Número */}
        <div className="text-sm text-gray-700 mb-4 font-['Clash_Display',sans-serif]">
          {etapa.numero}
        </div>
        
        {/* Línea divisoria */}
        <div className="w-full h-[0.25px] bg-gray-800 mb-4"></div>
        
        {/* Título */}
        <h3 className={`${isMobile ? 'text-3xl' : 'text-3xl'} font-medium text-gray-400 mb-4 uppercase font-archivo`}>
          {etapa.titulo}
        </h3>
        
        {/* Descripción */}
        <p className="text-base text-gray-400 mb-4 flex-grow leading-relaxed font-['Archivo',sans-serif]">
          {etapa.descripcion}
        </p>
        
        {/* Tags */}
        <div className="flex gap-2 flex-wrap mb-6">
          {etapa.tags.map((tag, tagIndex) => (
            <span 
              key={tagIndex}
              className="text-sm text-gray-700 border border-gray-800 rounded-full px-3 py-1 font-['Archivo',sans-serif]"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {/* Imagen */}
        <div className="w-full h-[250px] overflow-hidden">
          <img 
            src={etapa.imagen}
            alt={`Imagen de ${etapa.titulo}`}
            className="card-image w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <section id="proceso" className="bg-dark text-white w-full py-2 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 pt-10 md:pt-16 lg:pt-20 2xl:pt-32 overflow-hidden relative ">
        
        {/* Contenido principal */}
        <div className="relative z-[3]">
          {/* Encabezado */}
          <Encabezado 
            numero="03" 
            seccion="Proceso" 
            titulo="Un enfoque estructurado y metodológico para garantizar el éxito sostenible de cada proyecto digital" 
          />

          {/* Navegación del carousel */}
          <div className="flex justify-start items-center gap-4 mb-8 mt-8">
            <button
              onClick={prevSlide}
              className="w-12 h-12 rounded-full border border-gray-700 bg-transparent text-gray-400 flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-gray-600 hover:text-gray-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            
            <button
              onClick={nextSlide}
              className="w-12 h-12 rounded-full border border-gray-700 bg-transparent text-gray-400 flex items-center justify-center cursor-pointer transition-all duration-300 hover:border-gray-600 hover:text-gray-300"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Carousel container */}
          <div className="w-full overflow-hidden relative">
            <div 
              ref={cardsRef}
              className="flex"
              style={{
                transition: isTransitioning ? 'transform 0.5s ease-in-out' : 'none',
                transform: `translateX(-${currentSlide * 100}%)`,
              }}
            >
              {extendedEtapas.map((etapa, index) => (
                <div 
                  key={`slide-${index}`}
                  className="w-full flex-shrink-0"
                >
                  <Card etapa={etapa} index={index} />
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores */}
          <div className="flex justify-center gap-2 mt-8">
            {etapas.map((_, index) => {
              let activeIndex = currentSlide - 1;
              if (currentSlide === 0) activeIndex = etapas.length - 1;
              if (currentSlide === extendedEtapas.length - 1) activeIndex = 0;
              
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full border-none cursor-pointer transition-colors duration-300 ${
                    index === activeIndex ? 'bg-gray-400' : 'bg-gray-700'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Versión desktop
  return (
    <section id="proceso" className="bg-dark text-white w-full py-2 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 pt-10 md:pt-16 lg:pt-20 2xl:pt-32 relative">
      
      {/* Contenido principal */}
      <div className="relative z-[2]">
        {/* Encabezado */}
        <Encabezado 
          numero="03" 
          seccion="Proceso" 
          titulo="Un enfoque estructurado para garantizar el éxito de cada proyecto digital" 
        />

        {/* Contenedor sticky */}
        <div 
          ref={containerRef}
          className="w-full relative mt-0"
          style={{ height: '250vh' }}
        >
          
          {/* Elemento sticky */}
          <div 
            ref={stickyRef}
            className="sticky w-full flex flex-col justify-center items-start z-10 overflow-hidden"
            style={{ 
              top: '50px',
              height: 'calc(100vh - 100px)'
            }}
          >
            
            {/* FONDO 3D - FRAGMENTO CON MANEJO DE ESTADOS */}
            <div className="absolute top-1/2 left-[50px] w-[500px] h-[500px] -translate-y-1/2 z-[1] pointer-events-none opacity-40">
              {!should3DLoad ? (
                // Estado inicial - sin placeholder visible
                <div className="w-full h-full" />
              ) : !is3DLoaded ? (
                // Loading placeholder mientras carga el modelo
                <div className="w-full h-full bg-gray-900/10 animate-pulse rounded-lg flex items-center justify-center">
                  <div className="text-gray-600 text-sm opacity-50">Cargando modelo 3D...</div>
                </div>
              ) : (
                // Modelo 3D cargado
                <div className="w-full h-full">
                  <Fragmento />
                </div>
              )}
            </div>
            
            {/* Contenedor de cards */}
            <div 
              ref={cardsRef}
              className="flex relative z-[2]"
              style={{
                gap: '48px',
                willChange: 'transform',
                transition: 'none'
              }}
            >
              {etapas.map((etapa, index) => (
                <Card key={index} etapa={etapa} index={index} />
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcesoSectionSticky;