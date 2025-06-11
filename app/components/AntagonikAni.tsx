import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Engine, Render, World, Bodies, Runner, Composite, Body } from 'matter-js';
import { gsap, ScrollTrigger } from "@/lib/gsapInit";

interface AntagonikAniProps {
  containerBounds: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  // Agregar una prop para controlar la velocidad de animación
  animationSpeed?: number;
}

const AntagonikAni: React.FC<AntagonikAniProps> = ({ 
  containerBounds, 
  animationSpeed = 2.0 // Valor por defecto: 2x más rápido que la versión original
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
  
  // Referencias para ScrollTrigger y limpieza de animaciones
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);
  const svgImagesRef = useRef<HTMLImageElement[]>([]);
  const spheresRef = useRef<Matter.Body[]>([]);
  const isSetupCompleteRef = useRef<boolean>(false);

  // Función para detectar el tamaño de pantalla
  const getScreenSize = (width: number): 'mobile' | 'tablet' | 'laptop' | 'desktop' => {
    if (width < 640) return 'mobile';      // sm breakpoint
    if (width < 1024) return 'tablet';     // lg breakpoint  
    if (width < 1440) return 'laptop';     // xl breakpoint
    return 'desktop';                      // 2xl and above
  };

  // Función para obtener el tamaño base de las esferas según el breakpoint
  const getBaseSphereSize = (screenSize: 'mobile' | 'tablet' | 'laptop' | 'desktop'): number => {
    const sizes = {
      mobile: 80,    // 43% más pequeño que desktop
      tablet: 100,   // 29% más pequeño que desktop  
      laptop: 120,   // 14% más pequeño que desktop
      desktop: 140   // Tamaño original
    };
    return sizes[screenSize];
  };

  // Función para obtener el número de esferas según el breakpoint
  const getNumberOfSpheres = (screenSize: 'mobile' | 'tablet' | 'laptop' | 'desktop'): number => {
    const counts = {
      mobile: 12,    // Menos esferas en mobile para mejor performance
      tablet: 12,    // 
      laptop: 14,    // 
      desktop: 15    // Número original
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

    // Configurar el tamaño inicial
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [screenSize]);

  // Función para limpiar completamente las animaciones y física
  const cleanupPhysics = () => {
    // Cancelar el bucle de animación
    if (requestRef.current !== null) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }
    
    // Eliminar las imágenes SVG
    svgImagesRef.current.forEach(img => {
      if (img && img.parentNode) {
        img.parentNode.removeChild(img);
      }
    });
    svgImagesRef.current = [];
    
    // Eliminar la línea visual del suelo
    const floorLine = document.getElementById('visual-floor-line');
    if (floorLine && floorLine.parentNode) {
      floorLine.parentNode.removeChild(floorLine);
    }
    
    // Detener y destruir el renderizador
    if (rendererRef.current) {
      Render.stop(rendererRef.current);
      if (rendererRef.current.canvas && rendererRef.current.canvas.parentNode) {
        rendererRef.current.canvas.remove();
      }
      if (rendererRef.current.textures) {
        rendererRef.current.textures = {};
      }
    }
    
    // Detener el motor de física
    if (runnerRef.current && engineRef.current) {
      Runner.stop(runnerRef.current);
      World.clear(engineRef.current.world, false);
      Engine.clear(engineRef.current);
    }
    
    // Limpiar referencias
    engineRef.current = null;
    rendererRef.current = null;
    runnerRef.current = null;
    spheresRef.current = [];
    wallsRef.current = { left: null, right: null };
    
    // Matar ScrollTriggers
    scrollTriggersRef.current.forEach(trigger => trigger.kill());
    scrollTriggersRef.current = [];
  };

  // Función separada para crear línea visual de suelo
  const createVisualFloorLine = (ground: Matter.Body, tiltAngle: number, floorHeight: number) => {
    // Eliminar línea anterior si existe
    const oldLine = document.getElementById('visual-floor-line');
    if (oldLine && oldLine.parentNode) {
      oldLine.parentNode.removeChild(oldLine);
    }
  
    // Crear línea DOM que representará visualmente el suelo
    const floorLine = document.createElement('div');
    floorLine.id = 'visual-floor-line';
    floorLine.style.position = 'absolute';
    
    floorLine.style.width = `${containerBounds.width}px`;
    
    // Ajustar grosor de línea según tamaño de pantalla
    const lineThickness = screenSize === 'mobile' ? '0.15px' : '0.25px';
    floorLine.style.height = lineThickness;
    floorLine.style.backgroundColor = '#333333';
    floorLine.style.transformOrigin = 'center';
  
    // Posiciona la línea visual alineada con la parte superior del cuerpo físico
    const groundPos = ground.position;
    
    // Calculamos el desplazamiento vertical para alinear con el borde superior
    const verticalOffset = floorHeight / 2;
    
    // Calculamos la posición corregida considerando el ángulo de inclinación
    const offsetY = Math.cos(tiltAngle) * verticalOffset;
    const offsetX = Math.sin(tiltAngle) * verticalOffset;
    
    // Ajustar la posición horizontal para que comience en el borde izquierdo del contenedor
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
    // Definir los colores según las nuevas especificaciones:
    // 3 antes amarillas ahora "#565A63", 8 antes rojas ahora "#A0A5B1", 4 antes verdes ahora "#808591"
    const colorMap = [
      '#565A63', // 1. Antes amarillo, ahora gris oscuro
      '#A0A5B1', // 2. Antes rojo, ahora gris claro
      '#A0A5B1', // 3. Antes rojo, ahora gris claro
      '#808591', // 4. Antes verde, ahora gris medio
      '#A0A5B1', // 5. Antes rojo, ahora gris claro
      '#565A63', // 6. Antes amarillo, ahora gris oscuro
      '#808591', // 7. Antes verde, ahora gris medio
      '#A0A5B1', // 8. Antes rojo, ahora gris claro
      '#A0A5B1', // 9. Antes rojo, ahora gris claro
      '#808591', // 10. Antes verde, ahora gris medio
      '#A0A5B1', // 11. Antes rojo, ahora gris claro
      '#565A63', // 12. Antes amarillo, ahora gris oscuro
      '#A0A5B1', // 13. Antes rojo, ahora gris claro
      '#808591', // 14. Antes verde, ahora gris medio
      '#A0A5B1'  // 15. Antes rojo, ahora gris claro
    ];
    
    return colorMap[index] || '#565A63'; // Color por defecto si el índice excede el array
  };

  // Función para obtener el tamaño de la esfera según el color
  const getSphereSize = (color: string, baseSize: number): number => {
    switch (color) {
      case '#565A63': // Antes amarillo - 20% más grande
        return baseSize * 1.8;
      case '#808591': // Antes verde - 10% más grande
        return baseSize * 1.4;
      case '#A0A5B1': // Antes rojo - tamaño normal
      default:
        return baseSize;
    }
  };

  // Función para inicializar o reiniciar toda la animación
  const setupAnimation = () => {
    // Si ya hay una animación en ejecución, la limpiamos primero
    if (isSetupCompleteRef.current) {
      cleanupPhysics();
    }
    
    if (!sceneRef.current || !isVisible) return;

    // Obtener el tamaño base de las esferas según el breakpoint actual
    const baseSphereSize = getBaseSphereSize(screenSize);
    const numberOfSpheres = getNumberOfSpheres(screenSize);

    // Crear motor de física con gravedad más alta para acelerar la caída
    const engine = Engine.create({
      gravity: { 
        x: 0, 
        y: 1 * animationSpeed, // Multiplicamos la gravedad por el factor de velocidad
        scale: 0.001
      }
    });
    engineRef.current = engine;

    // Obtener dimensiones del contenedor
    const containerWidth = sceneRef.current.clientWidth;
    const containerHeight = sceneRef.current.clientHeight;

    // Crear renderizador
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

    // Crear paredes y suelo (cuerpos estáticos)
    const wallThickness = 50;
    
    // Ángulo de inclinación en radianes (12 grados)
    const tiltAngle = -13.9 * (Math.PI / 180);
    
    // Suelo inclinado - elevado (ajustar según tamaño de pantalla)
    // Cambié el valor para mobile de 0.25 a 0.15 para bajar más el suelo
    const floorElevationMultiplier = screenSize === 'mobile' ? 0.15 : 0.35;
    const floorElevation = containerHeight * floorElevationMultiplier;
    const floorWidth = containerWidth * 1.2;
    const floorHeight = 20; // Altura del cuerpo físico
    
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
    
    // Calcular las posiciones iniciales de las paredes basadas en containerBounds
    let leftWallX = -wallThickness / 2; // Valor predeterminado
    let rightWallX = containerWidth + wallThickness / 2; // Valor predeterminado
    
    // Si tenemos las dimensiones del contenedor con bordes, las usamos
    if (containerBounds.width > 0) {
      leftWallX = containerBounds.left;
      rightWallX = containerBounds.left + containerBounds.width;
    }
    
    // Pared izquierda (invisible)
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
    
    // Pared derecha (invisible)
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

    // Guardar referencia a las paredes para poder modificarlas después
    wallsRef.current = { left: leftWall, right: rightWall };

    // Crear esferas con colores específicos y tamaños variables
    const spheres = [];
    
    // Reducimos aún más el intervalo de caída para que las esferas caigan más juntas
    // Dividimos por el factor de velocidad para acelerar la secuencia
    const fallInterval = Math.max(25, 100 / animationSpeed); // Aseguramos un mínimo de 25ms
    
    for (let i = 0; i < numberOfSpheres; i++) {
      // Distribuir las esferas dentro de los límites del contenedor con bordes
      let xRange = containerWidth * 0.6;
      let xBase = containerWidth * 0.2;
      
      // Si tenemos dimensiones del contenedor, ajustamos la distribución
      if (containerBounds.width > 0) {
        xRange = containerBounds.width * 0.6;
        xBase = containerBounds.left + containerBounds.width * 0.2;
      }
      
      const xPosition = xBase + Math.random() * xRange;
      
      // Obtener el color específico para esta esfera
      const sphereColor = getSphereColor(i);
      
      // Obtener el tamaño específico para esta esfera según su color
      const sphereSize = getSphereSize(sphereColor, baseSphereSize);
      
      const sphere = Bodies.circle(
        xPosition,
        -200 - (i * fallInterval), // Intervalo más corto para caída más rápida
        sphereSize / 2, // Radio
        {
          restitution: 0.8, // Rebote
          friction: 0.005,
          render: {
            fillStyle: sphereColor
          },
          label: `sphere-${i + 1}`
        }
      );
      spheres.push(sphere);
    }
    
    // Guardar referencia a las esferas
    spheresRef.current = spheres;

    // Añadir cuerpos al mundo
    Composite.add(engine.world, [ground, leftWall, rightWall, ...spheres]);

    // Iniciar renderizador y motor
    Render.run(render);
    const runner = Runner.create();
    
    // Configurar runner para ejecutar pasos más rápidos
    runner.isFixed = false; // Permitir variable deltaTime
    runner.delta = 1000 / (60 * animationSpeed); // Ajustar delta para mayor velocidad (16.67ms dividido por factor)
    
    Runner.run(runner, engine);
    runnerRef.current = runner;

    // Crear la línea visual del suelo
    createVisualFloorLine(ground, tiltAngle, floorHeight);
    
    // Función para actualizar la posición de las imágenes SVG
    const svgImages: HTMLImageElement[] = [];
    svgImagesRef.current = svgImages;
    
    // Crear un array con los tamaños de las esferas para referencia
    const sphereSizes = spheres.map((sphere, index) => {
      const color = getSphereColor(index);
      return getSphereSize(color, baseSphereSize);
    });
    
    const updateSvgPositions = () => {
      spheres.forEach((sphere, index) => {
        if (svgImages[index]) {
          const img = svgImages[index];
          const pos = sphere.position;
          
          // Usar siempre el tamaño base para los SVGs, independientemente del tamaño de la esfera
          const svgSize = baseSphereSize;
          
          // Establecer la posición del SVG para que coincida con la esfera
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

    // Crear y añadir imágenes SVG
    spheres.forEach((_, index) => {
      const imgNumber = index + 1;
      const imgPath = `/images/svg/aplicaciones/logo-${imgNumber < 10 ? '0' + imgNumber : imgNumber}.svg`;
      
      const img = new Image();
      img.src = imgPath;
      img.onload = () => {
        // Al cargar la imagen, añadirla al DOM
        if (sceneRef.current) {
          sceneRef.current.appendChild(img);
          svgImages[index] = img;
        }
      };
      img.onerror = () => {
        console.error(`Error loading image: ${imgPath}`);
      };
    });

    // Iniciar el bucle de actualización
    requestRef.current = requestAnimationFrame(updateSvgPositions);
    
    // Indicar que la configuración ha sido completada
    isSetupCompleteRef.current = true;
  };

  // Efecto para configurar ScrollTrigger al montar el componente
  useLayoutEffect(() => {
    if (!sceneRef.current) return;
    
    // Crear ScrollTrigger para activar la animación cuando sea visible
    const scrollTrigger = ScrollTrigger.create({
      trigger: sceneRef.current,
      start: "top 50%", // Trigger cuando el top del elemento cruza el 50% del viewport
      onEnter: () => {
        setIsVisible(true);
      },
      once: true // Solo disparar una vez
    });
    
    // Guardar referencia para limpieza
    scrollTriggersRef.current.push(scrollTrigger);
    
    return () => {
      // Limpiar ScrollTriggers al desmontar
      scrollTriggersRef.current.forEach(trigger => trigger.kill());
      scrollTriggersRef.current = [];
    };
  }, []);

  // Efecto para iniciar la animación cuando sea visible o cuando cambie el tamaño de pantalla
  useEffect(() => {
    if (isVisible) {
      // Pequeño retardo para asegurar que el DOM esté listo
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
    
    // Calcular las posiciones de las paredes respecto al canvas
    const leftWallX = left;
    const rightWallX = left + width;

    // Actualizar la posición de las paredes
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
    // Manejar el redimensionamiento de la ventana
    const handleResize = () => {
      if (sceneRef.current && rendererRef.current) {
        const newWidth = sceneRef.current.clientWidth;
        const newHeight = sceneRef.current.clientHeight;

        // Actualizar renderizador
        rendererRef.current.options.width = newWidth;
        rendererRef.current.options.height = newHeight;
        rendererRef.current.bounds.max.x = newWidth;
        rendererRef.current.bounds.max.y = newHeight;
        Render.setPixelRatio(rendererRef.current, window.devicePixelRatio);
        
        // Refrescar ScrollTrigger
        ScrollTrigger.refresh();
      }
    };

    // Manejar cambios en la visibilidad de la página
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Si el componente ya está configurado y la animación debe estar visible, 
        // refrescar ScrollTrigger y reiniciar la animación si es necesario
        if (isVisible && !engineRef.current) {
          setTimeout(() => {
            ScrollTrigger.refresh();
            setupAnimation();
          }, 100);
        }
      }
    };

    // Manejar navegación entre páginas
    const handleRouteChange = () => {
      setTimeout(() => {
        ScrollTrigger.refresh();
        
        // Si debería estar visible pero no lo está funcionando, reiniciar
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
      
      // Limpiar completamente al desmontar
      cleanupPhysics();
    };
  }, [isVisible]);

  return <div ref={sceneRef} className="w-full h-screen relative"></div>;
};

export default AntagonikAni;