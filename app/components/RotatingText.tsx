import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { gsap, ScrollTrigger } from "@/lib/gsapInit"; // Importación centralizada de GSAP

// Interfaces para las props de los componentes
interface RotatingArrowProps {
  isHovering: boolean;
}

interface CircularTextProps {
  text: string;
  radius: number;
  fontSize: number;
  elementRef: React.RefObject<SVGTextElement>;
  direction?: number;
}

interface CircularRotatingTextProps {
  baseSpeed?: number;
  minSpeed?: number;
  maxSpeed?: number;
  scrollSensitivity?: number;
  width?: string;
  height?: string;
  className?: string;
  containerStyle?: CSSProperties;
  href?: string;
}

interface CircleConfig {
  text: string;
  radius: number;
  fontSize: number;
  direction: number;
}

// Componente de flecha con rotación en hover
const RotatingArrow: React.FC<RotatingArrowProps> = ({ isHovering }) => {
  return (
    <div 
      className="relative inline-block" 
      style={{ 
        width: "24px",
        height: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible"
      }}
    >
      <div
        className="absolute inset-0 transform transition-transform duration-300 ease-in-out"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: isHovering ? 'rotate(45deg)' : 'rotate(0deg)'
        }}
      >
        <svg 
          width="20" 
          height="20" 
          className="text-black" 
          viewBox="0 0 13.28 13.28" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon 
            fill="currentColor" 
            points=".53 0 .53 1.5 10.72 1.5 0 12.22 1.06 13.28 11.78 2.56 11.78 12.75 13.28 12.75 13.28 0 .53 0"
          />
        </svg>
      </div>
    </div>
  );
};

const CircularText: React.FC<CircularTextProps> = ({
  text,
  radius,
  fontSize,
  elementRef,
  direction = 1
}) => {
  const generateCirclePath = (radius: number): string => {
    return `M 0, ${-radius}
            A ${radius},${radius} 0 1,1 0,${radius}
            A ${radius},${radius} 0 1,1 0,${-radius}`;
  };

  const pathId = `textPath-${radius}`;

  return (
    <>
      <defs>
        <path id={pathId} d={generateCirclePath(radius)} />
      </defs>
      <text
        ref={elementRef}
        className="font-display font-semibold text-gray-900"
        fontSize={fontSize}
        fill="currentColor"
        data-direction={direction}
      >
        <textPath href={`#${pathId}`} startOffset="0%">
          {text}
        </textPath>
      </text>
    </>
  );
};

const CircularRotatingText: React.FC<CircularRotatingTextProps> = ({ 
  baseSpeed = 10,        // Velocidad base de rotación
  minSpeed = 5,          // Velocidad mínima a la que se resetea
  maxSpeed = 10,         // Velocidad máxima durante scroll
  scrollSensitivity = 0.4, // Sensibilidad del scroll
  width = "100%",        // Ancho personalizable
  height = "100%",      // Altura personalizable
  className = "",        // Clases adicionales
  containerStyle = {},   // Estilos adicionales para el contenedor
  href = "/contacto"     // URL destino al hacer clic
}) => {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const speed = useRef<number>(baseSpeed);
  const isScrolling = useRef<boolean>(false);
  const isAnimating = useRef<boolean>(true);
  const animationRef = useRef<number | null>(null);
  const defaultDirectionRef = useRef<number>(1);
  const router = useRouter();

  // Referencias para los elementos de texto
  const textRefs: React.RefObject<SVGTextElement>[] = [
    useRef<SVGTextElement>(null),
    useRef<SVGTextElement>(null),
    useRef<SVGTextElement>(null)
  ];

  const circleRef = useRef<SVGCircleElement>(null);

  const initialRadius = 50;
  const outerCircleRadius = 240;
  const expandedRadius = outerCircleRadius - 20;
  
  // Función para manejar el click
  const handleClick = (): void => {
    router.push(href);
  };

  // Función para animar los elementos de texto
  const animate = useCallback((): void => {
    // Si no estamos activamente haciendo scroll, reducir la velocidad
    if (!isScrolling.current) {
      speed.current = speed.current * 0.9;
      
      // Si la velocidad cae por debajo del valor mínimo, resetear
      if (Math.abs(speed.current) < minSpeed) {
        speed.current = minSpeed * defaultDirectionRef.current;
      }
    }
    
    // Reset flag de scroll para el próximo frame
    isScrolling.current = false;

    // Actualizar la rotación de cada texto basado en su dirección
    textRefs.forEach(ref => {
      if (ref.current) {
        const direction = parseInt(ref.current.getAttribute('data-direction') || '1');
        
        // Factor de velocidad basado en si estamos haciendo scroll o no
        const speedFactor = Math.abs(speed.current) > minSpeed ? 1.0 : 0.2;
        
        // Usar GSAP para la animación suave
        gsap.to(ref.current, {
          rotate: `+=${speed.current * direction * speedFactor}`,
          duration: 0.2,
          ease: "power1.out",
          overwrite: "auto"
        });
      }
    });

    // Continuar la animación
    animationRef.current = requestAnimationFrame(animate);
  }, [minSpeed]);

  useEffect(() => {
    // Verificar que GSAP esté disponible
    if (!gsap) {
      console.error('GSAP no está disponible. Verifica la importación desde @/lib/gsapInit');
      return;
    }

    // Configuración inicial - asegurarse de que todos los textos tienen rotate: 0
    textRefs.forEach(ref => {
      if (ref.current) {
        gsap.set(ref.current, { rotate: 0, transformOrigin: 'center center' });
      }
    });

    // Iniciar la animación inmediatamente
    animationRef.current = requestAnimationFrame(animate);

    // Tiempo límite para agrupar eventos de scroll
    let scrollTimeout: NodeJS.Timeout;

    // Manejador de eventos de scroll
    const handleWheel = (e: WheelEvent): void => {
      // Marcar que estamos haciendo scroll activamente
      isScrolling.current = true;
      
      // Limpiar timeout existente
      clearTimeout(scrollTimeout);
      
      // Establecer nuevo timeout
      scrollTimeout = setTimeout(() => {
        isScrolling.current = false;
      }, 150);
      
      // Calcula la velocidad basada en el scroll
      const newSpeed = e.deltaY * scrollSensitivity;
      
      // Actualizar la dirección por defecto según la última dirección de scroll
      defaultDirectionRef.current = e.deltaY > 0 ? 1 : -1;

      // Limitar la velocidad máxima para evitar rotaciones muy rápidas
      speed.current = Math.max(Math.min(newSpeed, maxSpeed), -maxSpeed);
    };

    // Agregar el event listener
    window.addEventListener('wheel', handleWheel, { passive: true });

    // Limpieza
    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, maxSpeed, scrollSensitivity]);

  // Efecto para manejar el hover del círculo central
  useEffect(() => {
    if (!gsap || !circleRef.current) return;

    gsap.set(circleRef.current, { transformOrigin: 'center center' });
    
    if (isHovering) {
      // Animar el círculo al hacer hover con GSAP
      gsap.to(circleRef.current, {
        scale: expandedRadius / initialRadius,
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      // Restaurar el círculo con GSAP
      gsap.to(circleRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [isHovering, expandedRadius, initialRadius]);

  const circleConfigs: CircleConfig[] = [
    { text: 'SITIOS WEB ××× QUE CONVIERTEN ×××', radius: 165, fontSize: 58, direction: 1 },
    { text: 'SOLUCIONES  »  REALES  »  ', radius: 113, fontSize: 58, direction: -1 },
    { text: 'INICIAR ∙ INICIAR ∙ INICIAR ∙', radius: 75, fontSize: 37, direction: 1 }
  ];

  // Mantenemos las proporciones calculando el viewBox en función del radio del círculo exterior
  const viewBoxSize = outerCircleRadius * 2 + 20; // Añadimos un pequeño margen
  const viewBox = `-${viewBoxSize/2} -${viewBoxSize/2} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <div 
      className={`flex items-center justify-center ${className}`} 
      style={{ 
        width: width,
        height: height,
        overflow: 'hidden',
        ...containerStyle
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <svg 
          className="w-full h-full" 
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Círculo exterior estático */}
          <circle
            cx="0"
            cy="0"
            r={outerCircleRadius}
            fill="transparent"
            stroke="#1C1C1C"
            strokeWidth="1"
          />

          {/* Círculo naranja animado con componente RotatingArrow */}
          <g
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{ cursor: 'pointer' }}
            onClick={handleClick}
          >
            <circle
              ref={circleRef}
              cx="0"
              cy="0"
              r={initialRadius}
              fill="#FF5741"
            />
            
            {/* Contenedor para la flecha estática */}
            <foreignObject 
              x="-12" 
              y="-12" 
              width="24" 
              height="24" 
              style={{ 
                pointerEvents: 'none',
                overflow: 'visible' 
              }}
            >
              <div style={{ 
                width: '100%', 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <RotatingArrow isHovering={isHovering} />
              </div>
            </foreignObject>
          </g>

          {/* Textos rotativos */}
          {circleConfigs.map((config, index) => (
            <CircularText
              key={index}
              text={config.text}
              radius={config.radius}
              fontSize={config.fontSize}
              elementRef={textRefs[index]}
              direction={config.direction}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default CircularRotatingText;