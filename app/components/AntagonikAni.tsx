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
  }, { scope: sceneRef }); // Limita el scope al elemento sceneRef

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

  // Hook para detectar cambios en el tamaño de pantalla
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const newScreenSize = getScreenSize(width);
      
      if (newScreenSize !== screenSize) {
        setScreenSize(newScreenSize);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [screenSize]);

  // Función para limpiar completamente las animaciones y física (Matter.js específicas)
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
    
    // Ya no necesitamos limpiar ScrollTriggers manualmente - useGSAP lo hace
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

  // Función para inicializar o reiniciar toda la animación
  const setupAnimation = () => {
    if (isSetupCompleteRef.current) {
      cleanupPhysics();
    }
    
    if (!sceneRef.current || !isVisible) return;

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
        if (sceneRef.current) {
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

  // Efecto para iniciar la animación cuando sea visible o cuando cambie el tamaño de pantalla
  useEffect(() => {
    if (isVisible) {
      const initTimer = setTimeout(() => {
        setupAnimation();
      }, 100);
      
      return () => {
        clearTimeout(initTimer);
      };
    }
  }, [isVisible, containerBounds, animationSpeed, screenSize]);

  // Efecto para actualizar las paredes cuando cambian las dimensiones del contenedor
  useEffect(() => {
    if (!engineRef.current || !containerBounds.width || !wallsRef.current.left || !wallsRef.current.right) return;

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

  // Efecto para manejar eventos de visibilidad y navegación
  useEffect(() => {
    const handleResize = () => {
      if (sceneRef.current && rendererRef.current) {
        const newWidth = sceneRef.current.clientWidth;
        const newHeight = sceneRef.current.clientHeight;

        rendererRef.current.options.width = newWidth;
        rendererRef.current.options.height = newHeight;
        rendererRef.current.bounds.max.x = newWidth;
        rendererRef.current.bounds.max.y = newHeight;
        Render.setPixelRatio(rendererRef.current, window.devicePixelRatio);
        
        ScrollTrigger.refresh();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (isVisible && !engineRef.current) {
          setTimeout(() => {
            ScrollTrigger.refresh();
            setupAnimation();
          }, 100);
        }
      }
    };

    const handleRouteChange = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
        if (isVisible && !engineRef.current) {
          setupAnimation();
        }
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handleRouteChange);
      cleanupPhysics();
    };
  }, [isVisible]);

  return <div ref={sceneRef} className="w-full h-screen relative"></div>;
};

export default AntagonikAni;