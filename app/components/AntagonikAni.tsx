import React, { useEffect, useRef, useState } from 'react';
import { Engine, Render, World, Bodies, Runner, Composite, Body } from 'matter-js';
import { gsap, ScrollTrigger } from "@/lib/gsapInit";
import { useGSAP } from "@gsap/react";

interface AntagonikAniProps {
  containerBounds: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  animationSpeed?: number;
}

const AntagonikAni: React.FC<AntagonikAniProps> = ({ 
  containerBounds, 
  animationSpeed = 2.0
}) => {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const rendererRef = useRef<Matter.Render | null>(null);
  const requestRef = useRef<number | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const wallsRef = useRef<{ left: Matter.Body | null; right: Matter.Body | null }>({
    left: null,
    right: null
  });
  const [isVisible, setIsVisible] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'laptop' | 'desktop'>('desktop');
  
  // Referencias para limpieza de animaciones (Matter.js específicas)
  const svgImagesRef = useRef<HTMLImageElement[]>([]);
  const spheresRef = useRef<Matter.Body[]>([]);
  const isSetupCompleteRef = useRef<boolean>(false);
  
  // NUEVAS REFERENCIAS PARA CONTROLAR REINICIOS
  const isAnimationRunningRef = useRef<boolean>(false);
  const setupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastResizeTimeRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTimeRef = useRef<number>(0);

  // useGSAP reemplaza useLayoutEffect para ScrollTrigger
  useGSAP(() => {
    if (!sceneRef.current) return;
    
    // ScrollTrigger se limpia automáticamente con useGSAP
    ScrollTrigger.create({
      trigger: sceneRef.current,
      start: "top 50%",
      onEnter: () => {
        setIsVisible(true);
      },
      once: true
    });
  }, { scope: sceneRef });

  // Función para detectar el tamaño de pantalla
  const getScreenSize = (width: number): 'mobile' | 'tablet' | 'laptop' | 'desktop' => {
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    if (width < 1440) return 'laptop';
    return 'desktop';
  };

  // Función para obtener el tamaño base de las esferas según el breakpoint
  const getBaseSphereSize = (screenSize: 'mobile' | 'tablet' | 'laptop' | 'desktop'): number => {
    const sizes = {
      mobile: 80,
      tablet: 100,
      laptop: 120,
      desktop: 140
    };
    return sizes[screenSize];
  };

  // Función para obtener el número de esferas según el breakpoint
  const getNumberOfSpheres = (screenSize: 'mobile' | 'tablet' | 'laptop' | 'desktop'): number => {
    const counts = {
      mobile: 12,
      tablet: 12,
      laptop: 14,
      desktop: 15
    };
    return counts[screenSize];
  };

  // Hook para detectar cambios en el tamaño de pantalla CON DEBOUNCE
  useEffect(() => {
    const handleResize = () => {
      const now = Date.now();
      lastResizeTimeRef.current = now;
      
      // Limpiar timeout anterior
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Debounce para evitar múltiples ejecuciones
      resizeTimeoutRef.current = setTimeout(() => {
        // Verificar que este es el último evento de resize
        if (now === lastResizeTimeRef.current) {
          const width = window.innerWidth;
          const newScreenSize = getScreenSize(width);
          
          if (newScreenSize !== screenSize) {
            setScreenSize(newScreenSize);
          }
        }
      }, 150); // Debounce de 150ms
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [screenSize]);

  // Función para limpiar completamente las animaciones y física
  const cleanupPhysics = () => {
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    
    svgImagesRef.current.forEach(img => {
      if (img && img.parentNode) {
        img.parentNode.removeChild(img);
      }
    });
    svgImagesRef.current = [];
    
    const floorLine = document.getElementById('visual-floor-line');
    if (floorLine && floorLine.parentNode) {
      floorLine.parentNode.removeChild(floorLine);
    }
    
    if (rendererRef.current) {
      Render.stop(rendererRef.current);
      if (rendererRef.current.canvas && rendererRef.current.canvas.parentNode) {
        rendererRef.current.canvas.remove();
      }
      if (rendererRef.current.textures) {
        rendererRef.current.textures = {};
      }
    }
    
    if (runnerRef.current && engineRef.current) {
      Runner.stop(runnerRef.current);
      World.clear(engineRef.current.world, false);
      Engine.clear(engineRef.current);
    }
    
    engineRef.current = null;
    rendererRef.current = null;
    runnerRef.current = null;
    spheresRef.current = [];
    wallsRef.current = { left: null, right: null };
    isAnimationRunningRef.current = false;
    isSetupCompleteRef.current = false;
  };

  // Función separada para crear línea visual de suelo
  const createVisualFloorLine = (ground: Matter.Body, tiltAngle: number, floorHeight: number) => {
    const oldLine = document.getElementById('visual-floor-line');
    if (oldLine && oldLine.parentNode) {
      oldLine.parentNode.removeChild(oldLine);
    }
  
    const floorLine = document.createElement('div');
    floorLine.id = 'visual-floor-line';
    floorLine.style.position = 'absolute';
    floorLine.style.width = `${containerBounds.width}px`;
    
    const lineThickness = screenSize === 'mobile' ? '0.15px' : '0.25px';
    floorLine.style.height = lineThickness;
    floorLine.style.backgroundColor = '#333333';
    floorLine.style.transformOrigin = 'center';
  
    const groundPos = ground.position;
    const verticalOffset = floorHeight / 2;
    const offsetY = Math.cos(tiltAngle) * verticalOffset;
    const offsetX = Math.sin(tiltAngle) * verticalOffset;
    
    floorLine.style.left = `${containerBounds.left}px`;
    floorLine.style.top = `${groundPos.y - offsetY}px`;
    floorLine.style.transform = `rotate(${tiltAngle * (180 / Math.PI)}deg)`;
    floorLine.style.zIndex = '5';
    floorLine.style.overflow = 'hidden';
  
    if (sceneRef.current) {
      sceneRef.current.appendChild(floorLine);
    }
    
    return floorLine;
  };

  // Función para obtener el color de la esfera según el índice
  const getSphereColor = (index: number): string => {
    const colorMap = [
      '#565A63', '#A0A5B1', '#A0A5B1', '#808591', '#A0A5B1', 
      '#565A63', '#808591', '#A0A5B1', '#A0A5B1', '#808591', 
      '#A0A5B1', '#565A63', '#A0A5B1', '#808591', '#A0A5B1'
    ];
    return colorMap[index] || '#565A63';
  };

  // Función para obtener el tamaño de la esfera según el color
  const getSphereSize = (color: string, baseSize: number): number => {
    switch (color) {
      case '#565A63':
        return baseSize * 1.8;
      case '#808591':
        return baseSize * 1.4;
      case '#A0A5B1':
      default:
        return baseSize;
    }
  };

  // Función para inicializar o reiniciar toda la animación CON PROTECCIÓN CONTRA REINICIOS
  const setupAnimation = () => {
    // PROTECCIÓN: No reiniciar si ya está ejecutándose
    if (isAnimationRunningRef.current || !isVisible || !sceneRef.current) {
      return;
    }

    // Marcar como ejecutándose
    isAnimationRunningRef.current = true;

    // Limpiar animación anterior si existe
    if (isSetupCompleteRef.current) {
      cleanupPhysics();
    }

    const baseSphereSize = getBaseSphereSize(screenSize);
    const numberOfSpheres = getNumberOfSpheres(screenSize);

    const engine = Engine.create({
      gravity: { 
        x: 0, 
        y: 1 * animationSpeed,
        scale: 0.001
      }
    });
    engineRef.current = engine;

    const containerWidth = sceneRef.current.clientWidth;
    const containerHeight = sceneRef.current.clientHeight;

    const render = Render.create({
      element: sceneRef.current,
      engine: engine,
      options: {
        width: containerWidth,
        height: containerHeight,
        wireframes: false,
        background: 'transparent',
      }
    });
    rendererRef.current = render;

    const wallThickness = 50;
    const tiltAngle = -13.9 * (Math.PI / 180);
    const floorElevationMultiplier = screenSize === 'mobile' ? 0.15 : 0.35;
    const floorElevation = containerHeight * floorElevationMultiplier;
    const floorWidth = containerWidth * 1.2;
    const floorHeight = 20;
    
    const ground = Bodies.rectangle(
      containerWidth / 2, 
      containerHeight - floorElevation,
      floorWidth, 
      floorHeight,
      { 
        isStatic: true,
        angle: tiltAngle,
        render: {
          fillStyle: 'transparent',
          visible: false
        }
      }
    );
    
    let leftWallX = -wallThickness / 2;
    let rightWallX = containerWidth + wallThickness / 2;
    
    if (containerBounds.width > 0) {
      leftWallX = containerBounds.left;
      rightWallX = containerBounds.left + containerBounds.width;
    }
    
    const leftWall = Bodies.rectangle(
      leftWallX, 
      containerHeight / 2, 
      wallThickness, 
      containerHeight * 2, 
      { 
        isStatic: true,
        render: {
          fillStyle: 'transparent'
        }
      }
    );
    
    const rightWall = Bodies.rectangle(
      rightWallX, 
      containerHeight / 2, 
      wallThickness, 
      containerHeight * 2, 
      { 
        isStatic: true,
        render: {
          fillStyle: 'transparent'
        }
      }
    );

    wallsRef.current = { left: leftWall, right: rightWall };

    const spheres: Matter.Body[] = [];
    const fallInterval = Math.max(25, 100 / animationSpeed);
    
    for (let i = 0; i < numberOfSpheres; i++) {
      let xRange = containerWidth * 0.6;
      let xBase = containerWidth * 0.2;
      
      if (containerBounds.width > 0) {
        xRange = containerBounds.width * 0.6;
        xBase = containerBounds.left + containerBounds.width * 0.2;
      }
      
      const xPosition = xBase + Math.random() * xRange;
      const sphereColor = getSphereColor(i);
      const sphereSize = getSphereSize(sphereColor, baseSphereSize);
      
      const sphere = Bodies.circle(
        xPosition,
        -200 - (i * fallInterval),
        sphereSize / 2,
        {
          restitution: 0.8,
          friction: 0.005,
          render: {
            fillStyle: sphereColor
          },
          label: `sphere-${i + 1}`
        }
      );
      spheres.push(sphere);
    }
    
    spheresRef.current = spheres;
    Composite.add(engine.world, [ground, leftWall, rightWall, ...spheres]);

    Render.run(render);
    const runner = Runner.create();
    runner.isFixed = false;
    runner.delta = 1000 / (60 * animationSpeed);
    Runner.run(runner, engine);
    runnerRef.current = runner;

    createVisualFloorLine(ground, tiltAngle, floorHeight);
    
    const svgImages: HTMLImageElement[] = [];
    svgImagesRef.current = svgImages;
    
    const updateSvgPositions = () => {
      // Verificar que la animación sigue activa
      if (!isAnimationRunningRef.current || !engineRef.current) {
        return;
      }

      spheres.forEach((sphere, index) => {
        if (svgImages[index]) {
          const img = svgImages[index];
          const pos = sphere.position;
          const svgSize = baseSphereSize;
          
          img.style.position = 'absolute';
          img.style.left = `${pos.x - svgSize / 3}px`;
          img.style.top = `${pos.y - svgSize / 3}px`;
          img.style.width = `${svgSize * 0.7}px`;
          img.style.height = `${svgSize * 0.7}px`;
          img.style.transform = `rotate(${sphere.angle * (180 / Math.PI)}deg)`;
          img.style.zIndex = '10';
          img.style.pointerEvents = 'none';
        }
      });
      
      requestRef.current = requestAnimationFrame(updateSvgPositions);
    };

    spheres.forEach((_, index) => {
      const imgNumber = index + 1;
      const imgPath = `/images/svg/aplicaciones/logo-${imgNumber < 10 ? '0' + imgNumber : imgNumber}.svg`;
      
      const img = new Image();
      img.src = imgPath;
      img.onload = () => {
        if (sceneRef.current && isAnimationRunningRef.current) {
          sceneRef.current.appendChild(img);
          svgImages[index] = img;
        }
      };
      img.onerror = () => {
        console.error(`Error loading image: ${imgPath}`);
      };
    });

    requestRef.current = requestAnimationFrame(updateSvgPositions);
    isSetupCompleteRef.current = true;
  };

  // Efecto para iniciar la animación SOLO cuando sea visible y CON DEBOUNCE
  useEffect(() => {
    if (isVisible && !isAnimationRunningRef.current) {
      // Limpiar timeout anterior
      if (setupTimeoutRef.current) {
        clearTimeout(setupTimeoutRef.current);
      }
      
      setupTimeoutRef.current = setTimeout(() => {
        setupAnimation();
      }, 200); // Aumentado el delay para evitar reinicios rápidos
      
      return () => {
        if (setupTimeoutRef.current) {
          clearTimeout(setupTimeoutRef.current);
        }
      };
    }
  }, [isVisible, containerBounds, animationSpeed, screenSize]);

  // Efecto para actualizar las paredes SOLO si la animación está corriendo
  useEffect(() => {
    if (!engineRef.current || !containerBounds.width || !wallsRef.current.left || !wallsRef.current.right || !isAnimationRunningRef.current) return;

    const { left, width } = containerBounds;
    const leftWallX = left;
    const rightWallX = left + width;

    if (wallsRef.current.left) {
      Body.setPosition(wallsRef.current.left, {
        x: leftWallX,
        y: wallsRef.current.left.position.y
      });
    }

    if (wallsRef.current.right) {
      Body.setPosition(wallsRef.current.right, {
        x: rightWallX,
        y: wallsRef.current.right.position.y
      });
    }
  }, [containerBounds]);

  // Efecto para manejar eventos de visibilidad y navegación CON PROTECCIONES MEJORADAS
  useEffect(() => {
    const handleResize = () => {
      if (sceneRef.current && rendererRef.current && isAnimationRunningRef.current) {
        const newWidth = sceneRef.current.clientWidth;
        const newHeight = sceneRef.current.clientHeight;

        rendererRef.current.options.width = newWidth;
        rendererRef.current.options.height = newHeight;
        rendererRef.current.bounds.max.x = newWidth;
        rendererRef.current.bounds.max.y = newHeight;
        Render.setPixelRatio(rendererRef.current, window.devicePixelRatio);
        
        // Debounce para ScrollTrigger.refresh()
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          ScrollTrigger.refresh();
        }, 100);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // SOLO reiniciar si no hay animación ejecutándose
        if (isVisible && !isAnimationRunningRef.current) {
          setTimeout(() => {
            ScrollTrigger.refresh();
            setupAnimation();
          }, 300); // Delay mayor para estabilidad
        }
      }
    };

    const handleRouteChange = () => {
      // SOLO reiniciar si no hay animación ejecutándose
      if (isVisible && !isAnimationRunningRef.current) {
        setTimeout(() => {
          ScrollTrigger.refresh();
          setupAnimation();
        }, 300);
      }
    };

    // PREVENIR EVENTOS DE SCROLL/TOUCH QUE PUEDAN REINICIAR LA ANIMACIÓN
    const handleTouchMove = (e: TouchEvent) => {
      // No prevenir el comportamiento por defecto para mantener el scroll natural
      // Solo evitar que se disparen reinicios
      e.stopPropagation();
    };

    const handleScroll = () => {
      // Throttle para evitar múltiples llamadas
      const now = Date.now();
      if (now - lastScrollTimeRef.current < 100) {
        return;
      }
      lastScrollTimeRef.current = now;
    };

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleRouteChange);
    
    // Eventos móviles con opciones pasivas para mejor rendimiento
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleRouteChange);
      document.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
      
      // Limpiar todos los timeouts
      if (setupTimeoutRef.current) clearTimeout(setupTimeoutRef.current);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      
      cleanupPhysics();
    };
  }, [isVisible]);

  return (
    <div 
      ref={sceneRef} 
      className="w-full h-screen relative"
      style={{
        // Mejorar el rendimiento en móviles
        willChange: 'transform',
        transform: 'translateZ(0)', // Forzar aceleración de hardware
        touchAction: 'pan-y', // Permitir solo scroll vertical
      }}
    />
  );
};

export default AntagonikAni;