"use client";
import React, { useEffect, useRef, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Encabezado from "./Encabezado";
import { gsap, ScrollTrigger } from "@/lib/gsapInit";
import Lottie, { AnimationItem } from "lottie-web";

// Definición de interfaces
interface CardData {
  iconPath: string;
  iconPathBlack: string;
  title: string;
  description: string;
  number: string;
  textColor: string;
  tagColor: string;
  tags: string[];
}

const Servicios: React.FC = () => {
  const router = useRouter();
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lottieRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lottieBlackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lottieInstances = useRef<(AnimationItem | null)[]>([]);
  const lottieBlackInstances = useRef<(AnimationItem | null)[]>([]);
  const animationDurations = useRef<number[]>([]);
  const currentPlayingIndex = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Nueva referencia para trackear el estado de hover
  const hoverStates = useRef<boolean[]>([]);
  // Referencias para los intervalos de sincronización
  const syncIntervals = useRef<(NodeJS.Timeout | null)[]>([]);

  // Referencias para mejor gestión de ScrollTrigger y animaciones
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);
  const animationContextRef = useRef<gsap.Context | null>(null);

  // Definición de la secuencia: 1 (Diseño Gráfico), 2 (Redes Sociales), 0 (Diseño Web)
  const animationSequence = [1, 2, 0];
  const sequenceIndexRef = useRef<number>(0);

  // Función para sincronizar continuamente las animaciones durante el hover
  const startSyncInterval = (index: number) => {
    // Limpiar interval previo si existe
    if (syncIntervals.current[index]) {
      clearInterval(syncIntervals.current[index]!);
    }

    syncIntervals.current[index] = setInterval(() => {
      const normalInstance = lottieInstances.current[index];
      const blackInstance = lottieBlackInstances.current[index];
      
      if (normalInstance && blackInstance && hoverStates.current[index]) {
        // Sincronizar el frame actual
        blackInstance.goToAndStop(normalInstance.currentFrame, true);
      }
    }, 1000 / 60); // 60 FPS para sincronización suave
  };

  // Función para detener la sincronización
  const stopSyncInterval = (index: number) => {
    if (syncIntervals.current[index]) {
      clearInterval(syncIntervals.current[index]!);
      syncIntervals.current[index] = null;
    }
  };

  // Función mejorada para alternar entre Lottie normal y negro
  const toggleLottieColor = (index: number, showBlack: boolean) => {
    const normalContainer = lottieRefs.current[index];
    const blackContainer = lottieBlackRefs.current[index];
    
    if (!normalContainer || !blackContainer) return;

    // Actualizar estado de hover
    hoverStates.current[index] = showBlack;

    if (showBlack) {
      // Mostrar versión negra
      gsap.to(normalContainer, { opacity: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(blackContainer, { opacity: 1, duration: 0.3, ease: "power2.out" });
      
      // Sincronizar frame actual
      const normalInstance = lottieInstances.current[index];
      const blackInstance = lottieBlackInstances.current[index];
      if (normalInstance && blackInstance) {
        blackInstance.goToAndStop(normalInstance.currentFrame, true);
      }

      // Iniciar sincronización continua
      startSyncInterval(index);
    } else {
      // Mostrar versión normal
      gsap.to(blackContainer, { opacity: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(normalContainer, { opacity: 1, duration: 0.3, ease: "power2.out" });
      
      // Detener sincronización
      stopSyncInterval(index);
    }
  };

  // Función para manejar clic en servicio y navegar a contacto
  const handleServiceClick = () => {
    router.push('/contacto');
  };

  // Función para reproducir una animación específica
  const playAnimation = (index: number) => {
    const normalInstance = lottieInstances.current[index];
    const blackInstance = lottieBlackInstances.current[index];
    
    if (!normalInstance || !blackInstance) return;

    // Establecemos el nuevo índice y reproducimos ambas animaciones
    currentPlayingIndex.current = index;
    normalInstance.goToAndPlay(0, true);
    blackInstance.goToAndPlay(0, true);

    // Programamos la siguiente animación para que comience medio segundo antes de que termine esta
    const duration = animationDurations.current[index] || 2000;
    const timeToNextAnimation = Math.max(500, duration - 1200);

    setTimeout(() => {
      playNextInSequence();
    }, timeToNextAnimation);
  };

  // Función para reproducir la siguiente animación en la secuencia
  const playNextInSequence = () => {
    sequenceIndexRef.current = (sequenceIndexRef.current + 1) % animationSequence.length;
    const nextIndex = animationSequence[sequenceIndexRef.current];
    playAnimation(nextIndex);
  };

  // Función para inicializar las animaciones Lottie
  const initLottieAnimations = () => {
    // Limpiar instancias previas
    [...lottieInstances.current, ...lottieBlackInstances.current].forEach(instance => {
      if (instance) {
        try {
          instance.destroy();
        } catch (err) {
          console.error("Error cleaning up Lottie instance:", err);
        }
      }
    });
    
    // Limpiar intervalos de sincronización
    syncIntervals.current.forEach(interval => {
      if (interval) clearInterval(interval);
    });
    
    lottieInstances.current = [];
    lottieBlackInstances.current = [];
    syncIntervals.current = [];
    hoverStates.current = [];

    // Inicializar las animaciones normales y negras
    lottieRefs.current.forEach((container, index) => {
      if (!container) return;

      const cardData = cardsData[index];
      
      // Inicializar estados
      hoverStates.current[index] = false;
      syncIntervals.current[index] = null;

      // Animación normal
      const normalAnimation = Lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: cardData.iconPath,
      });

      lottieInstances.current[index] = normalAnimation;

      normalAnimation.addEventListener('DOMLoaded', () => {
        animationDurations.current[index] = normalAnimation.getDuration() * 1000;

        if (currentPlayingIndex.current === null && index === animationSequence[0]) {
          setTimeout(() => {
            playAnimation(animationSequence[0]);
          }, 1000);
        }
      });
    });

    // Inicializar animaciones negras
    lottieBlackRefs.current.forEach((container, index) => {
      if (!container) return;

      const cardData = cardsData[index];

      // Animación negra (inicialmente oculta)
      const blackAnimation = Lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: cardData.iconPathBlack,
      });

      lottieBlackInstances.current[index] = blackAnimation;
      
      // Inicializar como oculta
      gsap.set(container, { opacity: 0 });
    });
  };

  // Función centralizada para configurar todas las animaciones
  const setupAnimations = () => {
    // Limpiar ScrollTriggers existentes para evitar duplicados
    scrollTriggersRef.current.forEach(trigger => trigger.kill());
    scrollTriggersRef.current = [];

    // Revertir el contexto de animación si existe
    if (animationContextRef.current) {
      animationContextRef.current.revert();
    }

    // Inicializar las animaciones Lottie
    initLottieAnimations();

    // Crear nuevo contexto de animación
    animationContextRef.current = gsap.context(() => {
      if (!containerRef.current) return;

      // Animaciones de los cards
      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        const topBorder = card.querySelector<HTMLElement>(".border-top");
        const bottomBorder = card.querySelector<HTMLElement>(".border-bottom");
        const leftBorder = card.querySelector<HTMLElement>(".border-left");
        const rightBorder = card.querySelector<HTMLElement>(".border-right");

        const content = card.querySelectorAll<HTMLElement>(
          ".card-desc, .card-tags span, .card-number, .card-icon"
        );

        const titleContainers = card.querySelectorAll<HTMLElement>(".title-word-container");

        // Establecer estados iniciales
        gsap.set(topBorder, { scaleX: 0, opacity: 0 });
        gsap.set(bottomBorder, { scaleX: 0, opacity: 0 });
        if (leftBorder) gsap.set(leftBorder, { scaleY: 0, opacity: 0 });
        gsap.set(rightBorder, { scaleY: 0, opacity: 0 });

        titleContainers.forEach(container => {
          const word = container.querySelector<HTMLElement>(".title-word");
          if (word) gsap.set(word, { y: "100%", opacity: 0 });
        });

        gsap.set(content, { opacity: 0, y: 20 });

        // Crear ScrollTriggers
        const trigger = ScrollTrigger.create({
          trigger: card,
          start: "top 80%",
          onEnter: () => {
            // Animar bordes
            gsap.to(topBorder, { scaleX: 0.95, opacity: 1, duration: 0.6, ease: "power2.out" });
            gsap.to(bottomBorder, { scaleX: 0.95, opacity: 1, duration: 0.6, ease: "power2.out" });
            if (leftBorder) gsap.to(leftBorder, { scaleY: 0.95, opacity: 1, duration: 0.6, ease: "power2.out" });
            gsap.to(rightBorder, { scaleY: 0.95, opacity: 1, duration: 0.6, ease: "power2.out" });

            // Animar título - TODAS LAS PALABRAS AL MISMO TIEMPO
            titleContainers.forEach((container) => {
              const word = container.querySelector<HTMLElement>(".title-word");
              if (!word) return;

              gsap.to(word, {
                y: "0%",
                opacity: 1,
                duration: 0.7,
                ease: "power3.out",
                delay: 0.03
              });
            });

            // Animar contenido
            gsap.to(content, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.03,
              delay: 0.06
            });
          },
          onLeaveBack: () => {
            // Revertir animaciones cuando se sale del viewport
            gsap.to(topBorder, { scaleX: 0, opacity: 0, duration: 0.4 });
            gsap.to(bottomBorder, { scaleX: 0, opacity: 0, duration: 0.4 });
            if (leftBorder) gsap.to(leftBorder, { scaleY: 0, opacity: 0, duration: 0.4 });
            gsap.to(rightBorder, { scaleY: 0, opacity: 0, duration: 0.4 });

            titleContainers.forEach(container => {
              const word = container.querySelector<HTMLElement>(".title-word");
              if (word) gsap.to(word, { y: "100%", opacity: 0, duration: 0.4 });
            });

            gsap.to(content, { opacity: 0, y: 20, duration: 0.4 });
          }
        });

        // Guardar referencia para limpieza posterior
        scrollTriggersRef.current.push(trigger);

        // Eventos de hover
        const setupHoverEvents = () => {
          const onEnter = () => {
            const bgOverlay = card.querySelector<HTMLElement>(".bg-overlay");
            if (!bgOverlay) return;

            gsap.to(bgOverlay, {
              opacity: 1,
              scale: 1,
              duration: 0.5,
              ease: "power3.out"
            });

            const titleWords = card.querySelectorAll<HTMLElement>(".title-word");
            const descText = card.querySelector<HTMLElement>(".card-desc");
            const numberText = card.querySelector<HTMLElement>(".card-number");
            const tags = card.querySelectorAll<HTMLElement>(".card-tags span");

            if (descText && numberText) {
              gsap.to([...Array.from(titleWords), descText, numberText], {
                color: "#000000",
                duration: 0.4,
                ease: "power2.out"
              });
            }

            gsap.to(Array.from(tags), {
              color: "#000000",
              borderColor: "#000000",
              duration: 0.4,
              ease: "power2.out"
            });

            // Cambiar a Lottie negro con sincronización continua
            toggleLottieColor(index, true);
          };

          const onLeave = () => {
            const bgOverlay = card.querySelector<HTMLElement>(".bg-overlay");
            if (!bgOverlay) return;

            gsap.to(bgOverlay, {
              opacity: 0,
              scale: 0.9,
              duration: 0.5,
              ease: "power3.out"
            });

            const titleWords = card.querySelectorAll<HTMLElement>(".title-word");
            const descText = card.querySelector<HTMLElement>(".card-desc");
            const numberText = card.querySelector<HTMLElement>(".card-number");
            const tags = card.querySelectorAll<HTMLElement>(".card-tags span");

            gsap.to(Array.from(titleWords), {
              color: "#b6bcc7",
              duration: 0.4,
              ease: "power2.out"
            });

            if (descText && numberText) {
              gsap.to([descText], {
                color: "#B6BCC7",
                duration: 0.4,
                ease: "power2.out"
              });

              gsap.to(numberText, {
                color: "#565A63",
                duration: 0.4,
                ease: "power2.out"
              });
            }

            gsap.to(Array.from(tags), {
              color: "#565A63",
              borderColor: "#2D3036",
              duration: 0.4,
              ease: "power2.out"
            });

            // Volver a Lottie normal y detener sincronización
            toggleLottieColor(index, false);
          };

          // Limpiar event listeners anteriores para evitar duplicados
          card.removeEventListener("mouseenter", onEnter);
          card.removeEventListener("mouseleave", onLeave);
          card.removeEventListener("click", handleServiceClick);

          // Agregar nuevos event listeners
          card.addEventListener("mouseenter", onEnter);
          card.addEventListener("mouseleave", onLeave);
          card.addEventListener("click", handleServiceClick);
        };

        setupHoverEvents();
      });
    });
  };

  // Usar useLayoutEffect para las mediciones DOM antes de pintar
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const initTimer = setTimeout(() => {
      setupAnimations();
    }, 100);

    return () => {
      clearTimeout(initTimer);
    };
  }, []);

  // Limpieza cuando el componente se desmonta
  useEffect(() => {
    return () => {
      scrollTriggersRef.current.forEach(trigger => trigger.kill());
      scrollTriggersRef.current = [];

      // Limpiar intervalos de sincronización
      syncIntervals.current.forEach(interval => {
        if (interval) clearInterval(interval);
      });

      if (animationContextRef.current) {
        animationContextRef.current.revert();
        animationContextRef.current = null;
      }

      [...lottieInstances.current, ...lottieBlackInstances.current].forEach(instance => {
        if (instance) {
          try {
            instance.destroy();
          } catch (err) {
            console.error("Error cleaning up Lottie instance:", err);
          }
        }
      });
    };
  }, []);

  // Escuchar cambios de visibilidad y navegación
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        ScrollTrigger.refresh();
        setupAnimations();
      }
    };

    const refreshOnRouteChange = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
        setupAnimations();
      }, 100);
    };

    const handlePageShow = () => {
      setTimeout(() => {
        setupAnimations();
      }, 100);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', refreshOnRouteChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', refreshOnRouteChange);
    };
  }, []);

  const createTitleWordContainers = (title: string) => {
    return title.split(" ").map((word, index) => (
      <span key={index} className="title-word-container inline-block overflow-hidden mr-1">
        <span className="title-word inline-block transform translate-y-full opacity-0">{word}</span>
      </span>
    ));
  };

  const cardsData: CardData[] = [
    {
      iconPath: "/images/lottie/web.json",
      iconPathBlack: "/images/lottie/web-black.json",
      title: "Diseño Web",
      description:
        "Sitios que trabajan para ti: rápidos, responsivos y diseñados para convertir.",
      number: "( 01 )",
      textColor: "text-gray-400",
      tagColor: "border-gray-800",
      tags: ["Diseño UX/UI", "Next.js", "WordPress", "Webflow", "E-commerce", "Landing Pages"],
    },
    {
      iconPath: "/images/lottie/diseño.json",
      iconPathBlack: "/images/lottie/diseño-black.json",
      title: "Diseño Gráfico",
      description:
        "Comunicación visual que destaca, perdura y genera posicionamiento de marca.",
      number: "( 02 )",
      textColor: "text-gray-400",
      tagColor: "border-gray-800",
      tags: [
        "Identidad Visual",
        "Diseño Publicitario",
        "Multimedia",
        "Packaging",
      ],
    },
    {
      iconPath: "/images/lottie/redes-sociales.json",
      iconPathBlack: "/images/lottie/redes-sociales-black.json",
      title: "Redes Sociales",
      description:
        "Contenido que conecta, engagement que crece, comunidades que se comprometen.",
      number: "( 03 )",
      textColor: "text-gray-100",
      tagColor: "border-gray-800",
      tags: ["Community Management", "SEO", "Creación de Contenido", "Analíticas y Reportes"],
    },
  ];

  return (
    <section ref={containerRef} className="bg-dark text-white w-full pb-2 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 pt-10 md:pt-16 lg:pt-20 2xl:pt-32" id="servicios">
      <Encabezado
        numero="02"
        seccion="Servicios"
        titulo="Diseño, desarrollo y contenido que realmente conecta con tu audiencia"
      />

      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 mt-12 md:mt-16 lg:mt-24 2xl:mt-32">
        <div className="col-span-1 md:col-span-12 lg:col-span-12 grid grid-cols-1 lg:grid-cols-3 gap-0">
          {cardsData.map((card, index) => (
            <div
              key={`card-${index}`}
              ref={(el) => { cardsRef.current[index] = el; }}
              className="relative p-4 md:p-8 flex flex-col justify-between overflow-visible group cursor-pointer"
            >
              <div className="bg-overlay absolute top-2 left-2 right-2 bottom-2 bg-primary opacity-0 scale-90 transform-gpu origin-center z-0"></div>

              <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="border-top absolute top-0 left-0 right-0 h-[0.25px] bg-gray-800 transform-gpu origin-center"></div>
                <div className={`border-bottom absolute bottom-0 left-0 right-0 h-[0.25px] bg-gray-800 transform-gpu origin-center ${index < cardsData.length - 1 ? 'md:block hidden' : ''}`}></div>
                <div className={`border-left absolute top-0 left-0 bottom-0 w-[0.25px] bg-gray-800 transform-gpu origin-center ${index !== 0 ? 'lg:hidden' : ''}`}></div>
                <div className="border-right absolute top-0 right-0 bottom-0 w-[0.25px] bg-gray-800 transform-gpu origin-center"></div>
              </div>

              {index < cardsData.length - 1 && (
                <div className="md:hidden absolute bottom-0 left-4 right-4 h-[0.25px] bg-gray-800"></div>
              )}

              <div className="relative z-10">
                <h3 className={`text-2xl md:text-2xl lg:text-[1.625rem] 2xl:text-3xl font-archivo uppercase font-medium text-gray-400 ${card.textColor} mb-0 leading-none whitespace-normal md:whitespace-nowrap`}>
                  {createTitleWordContainers(card.title)}
                </h3>
                <p className={`card-desc ${card.textColor} mb-0 mt-2 font-archivo font-normal text-base text-gray-400 max-w-full md:max-w-[360px]`}>
                  {card.description}
                </p>
                <div className="card-tags gap-y-0 md:gap-y-1 mt-4 md:mt-6 flex gap-0 flex-wrap max-w-full md:max-w-[360px] mr-4 md:mr-8">
                  {card.tags.map((tag, i) => (
                    <span key={i} className={`card-tags-span border-[0.25px] ${card.tagColor} rounded-full px-3 md:px-4 py-1 font-archivo text-xs md:text-xs 2xl:text-sm text-gray-700 mb-2`}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-end mt-6 md:mt-10 relative z-10">
                <span className="card-number font-archivo text-gray-700 text-xs md:text-sm">{card.number}</span>
                <div className="relative w-48 h-48 md:w-[212.5px] md:h-[212.5px]">
                  {/* Lottie normal */}
                  <div
                    ref={(el) => { lottieRefs.current[index] = el; }}
                    className="card-icon absolute inset-0 w-full h-full"
                  ></div>
                  {/* Lottie negro (inicialmente oculto) */}
                  <div
                    ref={(el) => { lottieBlackRefs.current[index] = el; }}
                    className="card-icon-black absolute inset-0 w-full h-full"
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Servicios;