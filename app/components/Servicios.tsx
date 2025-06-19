"use client";
import React, { useEffect, useRef, useLayoutEffect, useCallback, useMemo } from "react";
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

// Constantes extraídas para evitar re-creación
const SYNC_FPS = 60;
const SYNC_INTERVAL = 1000 / SYNC_FPS;
const ANIMATION_OVERLAP = 1200;
const MIN_ANIMATION_DELAY = 500;
const INITIAL_PLAY_DELAY = 1000;
const SETUP_DELAY = 100;

const Servicios: React.FC = () => {
  const router = useRouter();
  
  // Referencias optimizadas con inicialización lazy
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const lottieRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lottieBlackRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lottieInstances = useRef<(AnimationItem | null)[]>([]);
  const lottieBlackInstances = useRef<(AnimationItem | null)[]>([]);
  const animationDurations = useRef<number[]>([]);
  const currentPlayingIndex = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverStates = useRef<boolean[]>([]);
  const syncIntervals = useRef<(NodeJS.Timeout | null)[]>([]);
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);
  const animationContextRef = useRef<gsap.Context | null>(null);
  const sequenceIndexRef = useRef<number>(0);
  
  // Referencias para timeouts y RAF para mejor limpieza
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const rafIdsRef = useRef<Set<number>>(new Set());

  // Secuencia de animaciones como constante
  const animationSequence = useMemo(() => [1, 2, 0], []);

  // Datos de las cards memoizados para evitar re-renderizado
  const cardsData: CardData[] = useMemo(() => [
    {
      iconPath: "/images/lottie/web.json",
      iconPathBlack: "/images/lottie/web-black.json",
      title: "Diseño Web",
      description: "Sitios que trabajan para ti: rápidos, responsivos y diseñados para convertir.",
      number: "( 01 )",
      textColor: "text-gray-400",
      tagColor: "border-gray-800",
      tags: ["Diseño UX/UI", "Next.js", "WordPress", "Webflow", "E-commerce", "Landing Pages"],
    },
    {
      iconPath: "/images/lottie/diseño.json",
      iconPathBlack: "/images/lottie/diseño-black.json",
      title: "Diseño Gráfico",
      description: "Comunicación visual que destaca, perdura y genera posicionamiento de marca.",
      number: "( 02 )",
      textColor: "text-gray-400",
      tagColor: "border-gray-800",
      tags: ["Identidad Visual", "Diseño Publicitario", "Multimedia", "Packaging"],
    },
    {
      iconPath: "/images/lottie/redes-sociales.json",
      iconPathBlack: "/images/lottie/redes-sociales-black.json",
      title: "Redes Sociales",
      description: "Contenido que conecta, engagement que crece, comunidades que se comprometen.",
      number: "( 03 )",
      textColor: "text-gray-100",
      tagColor: "border-gray-800",
      tags: ["Community Management", "SEO", "Creación de Contenido", "Analíticas y Reportes"],
    },
  ], []);

  // Función optimizada con useCallback para evitar re-creación
  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    timeoutsRef.current.clear();
  }, []);

  const clearRAFs = useCallback(() => {
    rafIdsRef.current.forEach(id => cancelAnimationFrame(id));
    rafIdsRef.current.clear();
  }, []);

  // Función optimizada para sincronización usando RAF en lugar de setInterval
  const startSyncInterval = useCallback((index: number) => {
    if (syncIntervals.current[index]) {
      clearInterval(syncIntervals.current[index]!);
    }

    let lastTime = 0;
    const syncFrame = (currentTime: number) => {
      if (currentTime - lastTime >= SYNC_INTERVAL) {
        const normalInstance = lottieInstances.current[index];
        const blackInstance = lottieBlackInstances.current[index];
        
        if (normalInstance && blackInstance && hoverStates.current[index]) {
          blackInstance.goToAndStop(normalInstance.currentFrame, true);
        }
        lastTime = currentTime;
      }
      
      if (hoverStates.current[index]) {
        const rafId = requestAnimationFrame(syncFrame);
        rafIdsRef.current.add(rafId);
      }
    };

    const rafId = requestAnimationFrame(syncFrame);
    rafIdsRef.current.add(rafId);
  }, []);

  const stopSyncInterval = useCallback((index: number) => {
    if (syncIntervals.current[index]) {
      clearInterval(syncIntervals.current[index]!);
      syncIntervals.current[index] = null;
    }
  }, []);

  // Función optimizada para toggle de colores
  const toggleLottieColor = useCallback((index: number, showBlack: boolean) => {
    const normalContainer = lottieRefs.current[index];
    const blackContainer = lottieBlackRefs.current[index];
    
    if (!normalContainer || !blackContainer) return;

    hoverStates.current[index] = showBlack;

    if (showBlack) {
      gsap.to(normalContainer, { opacity: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(blackContainer, { opacity: 1, duration: 0.3, ease: "power2.out" });
      
      const normalInstance = lottieInstances.current[index];
      const blackInstance = lottieBlackInstances.current[index];
      if (normalInstance && blackInstance) {
        blackInstance.goToAndStop(normalInstance.currentFrame, true);
      }

      startSyncInterval(index);
    } else {
      gsap.to(blackContainer, { opacity: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(normalContainer, { opacity: 1, duration: 0.3, ease: "power2.out" });
      stopSyncInterval(index);
    }
  }, [startSyncInterval, stopSyncInterval]);

  // Función memoizada para navegación
  const handleServiceClick = useCallback(() => {
    router.push('/contacto');
  }, [router]);

  // Función optimizada para reproducir animaciones
  const playAnimation = useCallback((index: number) => {
    const normalInstance = lottieInstances.current[index];
    const blackInstance = lottieBlackInstances.current[index];
    
    if (!normalInstance || !blackInstance) return;

    currentPlayingIndex.current = index;
    normalInstance.goToAndPlay(0, true);
    blackInstance.goToAndPlay(0, true);

    const duration = animationDurations.current[index] || 2000;
    const timeToNextAnimation = Math.max(MIN_ANIMATION_DELAY, duration - ANIMATION_OVERLAP);

    const timeout = setTimeout(() => {
      playNextInSequence();
    }, timeToNextAnimation);
    
    timeoutsRef.current.add(timeout);
  }, []);

  const playNextInSequence = useCallback(() => {
    sequenceIndexRef.current = (sequenceIndexRef.current + 1) % animationSequence.length;
    const nextIndex = animationSequence[sequenceIndexRef.current];
    playAnimation(nextIndex);
  }, [animationSequence, playAnimation]);

  // Función optimizada para cleanup de Lottie
  const cleanupLottieInstances = useCallback(() => {
    [...lottieInstances.current, ...lottieBlackInstances.current].forEach(instance => {
      if (instance) {
        try {
          instance.destroy();
        } catch (err) {
          console.error("Error cleaning up Lottie instance:", err);
        }
      }
    });
    
    syncIntervals.current.forEach(interval => {
      if (interval) clearInterval(interval);
    });
    
    lottieInstances.current = [];
    lottieBlackInstances.current = [];
    syncIntervals.current = [];
    hoverStates.current = [];
  }, []);

  // Función de inicialización de Lottie optimizada
  const initLottieAnimations = useCallback(() => {
    cleanupLottieInstances();

    // Inicializar animaciones normales
    lottieRefs.current.forEach((container, index) => {
      if (!container) return;

      const cardData = cardsData[index];
      hoverStates.current[index] = false;
      syncIntervals.current[index] = null;

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
          const timeout = setTimeout(() => {
            playAnimation(animationSequence[0]);
          }, INITIAL_PLAY_DELAY);
          
          timeoutsRef.current.add(timeout);
        }
      });
    });

    // Inicializar animaciones negras
    lottieBlackRefs.current.forEach((container, index) => {
      if (!container) return;

      const cardData = cardsData[index];

      const blackAnimation = Lottie.loadAnimation({
        container: container,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        path: cardData.iconPathBlack,
      });

      lottieBlackInstances.current[index] = blackAnimation;
      gsap.set(container, { opacity: 0 });
    });
  }, [cardsData, animationSequence, playAnimation, cleanupLottieInstances]);

  // Función para crear contenedores de palabras del título (memoizada)
  const createTitleWordContainers = useCallback((title: string) => {
    return title.split(" ").map((word, index) => (
      <span key={index} className="title-word-container inline-block overflow-hidden mr-1">
        <span className="title-word inline-block transform translate-y-full opacity-0">{word}</span>
      </span>
    ));
  }, []);

  // Función de setup de animaciones optimizada
  const setupAnimations = useCallback(() => {
    // Limpiar ScrollTriggers y contexto previo
    scrollTriggersRef.current.forEach(trigger => trigger.kill());
    scrollTriggersRef.current = [];

    if (animationContextRef.current) {
      animationContextRef.current.revert();
    }

    initLottieAnimations();

    // Crear nuevo contexto de animación
    animationContextRef.current = gsap.context(() => {
      if (!containerRef.current) return;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        // Seleccionar elementos una sola vez
        const elements = {
          topBorder: card.querySelector<HTMLElement>(".border-top"),
          bottomBorder: card.querySelector<HTMLElement>(".border-bottom"),
          leftBorder: card.querySelector<HTMLElement>(".border-left"),
          rightBorder: card.querySelector<HTMLElement>(".border-right"),
          content: card.querySelectorAll<HTMLElement>(".card-desc, .card-tags span, .card-number, .card-icon"),
          titleContainers: card.querySelectorAll<HTMLElement>(".title-word-container"),
          bgOverlay: card.querySelector<HTMLElement>(".bg-overlay"),
          titleWords: card.querySelectorAll<HTMLElement>(".title-word"),
          descText: card.querySelector<HTMLElement>(".card-desc"),
          numberText: card.querySelector<HTMLElement>(".card-number"),
          tags: card.querySelectorAll<HTMLElement>(".card-tags span")
        };

        // Establecer estados iniciales
        gsap.set(elements.topBorder, { scaleX: 0, opacity: 0 });
        gsap.set(elements.bottomBorder, { scaleX: 0, opacity: 0 });
        if (elements.leftBorder) gsap.set(elements.leftBorder, { scaleY: 0, opacity: 0 });
        gsap.set(elements.rightBorder, { scaleY: 0, opacity: 0 });

        elements.titleContainers.forEach(container => {
          const word = container.querySelector<HTMLElement>(".title-word");
          if (word) gsap.set(word, { y: "100%", opacity: 0 });
        });

        gsap.set(elements.content, { opacity: 0, y: 20 });

        // Crear ScrollTrigger optimizado
        const trigger = ScrollTrigger.create({
          trigger: card,
          start: "top 80%",
          onEnter: () => {
            // Animar bordes
            gsap.to(elements.topBorder, { scaleX: 0.95, opacity: 1, duration: 0.6, ease: "power2.out" });
            gsap.to(elements.bottomBorder, { scaleX: 0.95, opacity: 1, duration: 0.6, ease: "power2.out" });
            if (elements.leftBorder) gsap.to(elements.leftBorder, { scaleY: 0.95, opacity: 1, duration: 0.6, ease: "power2.out" });
            gsap.to(elements.rightBorder, { scaleY: 0.95, opacity: 1, duration: 0.6, ease: "power2.out" });

            // Animar título
            elements.titleContainers.forEach((container) => {
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
            gsap.to(elements.content, {
              opacity: 1,
              y: 0,
              duration: 0.6,
              ease: "power2.out",
              stagger: 0.03,
              delay: 0.06
            });
          },
          onLeaveBack: () => {
            gsap.to(elements.topBorder, { scaleX: 0, opacity: 0, duration: 0.4 });
            gsap.to(elements.bottomBorder, { scaleX: 0, opacity: 0, duration: 0.4 });
            if (elements.leftBorder) gsap.to(elements.leftBorder, { scaleY: 0, opacity: 0, duration: 0.4 });
            gsap.to(elements.rightBorder, { scaleY: 0, opacity: 0, duration: 0.4 });

            elements.titleContainers.forEach(container => {
              const word = container.querySelector<HTMLElement>(".title-word");
              if (word) gsap.to(word, { y: "100%", opacity: 0, duration: 0.4 });
            });

            gsap.to(elements.content, { opacity: 0, y: 20, duration: 0.4 });
          }
        });

        scrollTriggersRef.current.push(trigger);

        // Event handlers optimizados con funciones reutilizables
        const onEnter = () => {
          if (!elements.bgOverlay) return;

          gsap.to(elements.bgOverlay, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "power3.out"
          });

          if (elements.descText && elements.numberText) {
            gsap.to([...Array.from(elements.titleWords), elements.descText, elements.numberText], {
              color: "#000000",
              duration: 0.4,
              ease: "power2.out"
            });
          }

          gsap.to(Array.from(elements.tags), {
            color: "#000000",
            borderColor: "#000000",
            duration: 0.4,
            ease: "power2.out"
          });

          toggleLottieColor(index, true);
        };

        const onLeave = () => {
          if (!elements.bgOverlay) return;

          gsap.to(elements.bgOverlay, {
            opacity: 0,
            scale: 0.9,
            duration: 0.5,
            ease: "power3.out"
          });

          gsap.to(Array.from(elements.titleWords), {
            color: "#b6bcc7",
            duration: 0.4,
            ease: "power2.out"
          });

          if (elements.descText && elements.numberText) {
            gsap.to([elements.descText], {
              color: "#B6BCC7",
              duration: 0.4,
              ease: "power2.out"
            });

            gsap.to(elements.numberText, {
              color: "#565A63",
              duration: 0.4,
              ease: "power2.out"
            });
          }

          gsap.to(Array.from(elements.tags), {
            color: "#565A63",
            borderColor: "#2D3036",
            duration: 0.4,
            ease: "power2.out"
          });

          toggleLottieColor(index, false);
        };

        // Configurar event listeners una sola vez
        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);
        card.addEventListener("click", handleServiceClick);
      });
    });
  }, [initLottieAnimations, toggleLottieColor, handleServiceClick]);

  // useLayoutEffect optimizado
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const initTimer = setTimeout(() => {
      setupAnimations();
    }, SETUP_DELAY);

    timeoutsRef.current.add(initTimer);

    return () => {
      clearTimeout(initTimer);
      timeoutsRef.current.delete(initTimer);
    };
  }, [setupAnimations]);

  // Cleanup effect optimizado
  useEffect(() => {
    return () => {
      // Limpiar timeouts y RAFs
      clearTimeouts();
      clearRAFs();
      
      // Limpiar ScrollTriggers
      scrollTriggersRef.current.forEach(trigger => trigger.kill());
      scrollTriggersRef.current = [];

      // Limpiar intervalos de sincronización
      syncIntervals.current.forEach(interval => {
        if (interval) clearInterval(interval);
      });

      // Limpiar contexto de animación
      if (animationContextRef.current) {
        animationContextRef.current.revert();
        animationContextRef.current = null;
      }

      // Limpiar instancias de Lottie
      cleanupLottieInstances();
    };
  }, [clearTimeouts, clearRAFs, cleanupLottieInstances]);

  // Event listeners optimizados con throttling
  useEffect(() => {
    let refreshTimeout: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(refreshTimeout);
        refreshTimeout = setTimeout(() => {
          ScrollTrigger.refresh();
          setupAnimations();
        }, 100);
        timeoutsRef.current.add(refreshTimeout);
      }
    };

    const refreshOnRouteChange = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
        setupAnimations();
      }, 100);
      timeoutsRef.current.add(refreshTimeout);
    };

    const handlePageShow = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        setupAnimations();
      }, 100);
      timeoutsRef.current.add(refreshTimeout);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange, { passive: true });
    window.addEventListener('pageshow', handlePageShow, { passive: true });
    window.addEventListener('popstate', refreshOnRouteChange, { passive: true });

    return () => {
      clearTimeout(refreshTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', refreshOnRouteChange);
    };
  }, [setupAnimations, clearTimeouts]);

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
                  <div
                    ref={(el) => { lottieRefs.current[index] = el; }}
                    className="card-icon absolute inset-0 w-full h-full"
                  ></div>
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