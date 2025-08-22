"use client";
import React, { useState, useEffect, useRef, CSSProperties } from 'react';
import { useCallback } from 'react';
// 1. IMPORTAR Link Y QUITAR useRouter
import Link from 'next/link';
import { gsap } from "@/lib/gsapInit"; // Se mantiene la importación de GSAP

// --- COMPONENTES HIJOS Y UTILIDADES (CÓDIGO ORIGINAL COMPLETO) ---

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

// Utility function to detect mobile devices
const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth < 768;
};

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

// --- COMPONENTE PRINCIPAL (CÓDIGO ORIGINAL CON MÍNIMAS MODIFICACIONES) ---

const CircularRotatingText: React.FC<CircularRotatingTextProps> = ({ 
  baseSpeed = 10,
  minSpeed = 5,
  maxSpeed = 10,
  scrollSensitivity = 0.4,
  width = "100%",
  height = "100%",
  className = "",
  containerStyle = {},
  href = "/contacto"
}) => {
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const speed = useRef<number>(baseSpeed);
  const isScrolling = useRef<boolean>(false);
  const isAnimating = useRef<boolean>(true);
  const animationRef = useRef<number | null>(null);
  const defaultDirectionRef = useRef<number>(1);
  // 2. QUITAR useRouter
  // const router = useRouter(); 

  const textRefs: React.RefObject<SVGTextElement>[] = [
    useRef<SVGTextElement>(null),
    useRef<SVGTextElement>(null),
    useRef<SVGTextElement>(null)
  ];

  const circleRef = useRef<SVGCircleElement>(null);

  const initialRadius = 50;
  const outerCircleRadius = 240;
  const expandedRadius = outerCircleRadius - 20;
  
  // 3. QUITAR la función handleClick
  // const handleClick = (): void => {
  //   router.push(href);
  // };

  const animate = useCallback((): void => {
    if (isMobile) {
      speed.current = minSpeed * defaultDirectionRef.current;
    } else {
      if (!isScrolling.current) {
        speed.current = speed.current * 0.9;
        if (Math.abs(speed.current) < minSpeed) {
          speed.current = minSpeed * defaultDirectionRef.current;
        }
      }
      isScrolling.current = false;
    }

    textRefs.forEach(ref => {
      if (ref.current) {
        const direction = parseInt(ref.current.getAttribute('data-direction') || '1');
        const speedFactor = isMobile ? 0.3 : (Math.abs(speed.current) > minSpeed ? 1.0 : 0.2);
        
        gsap.to(ref.current, {
          rotate: `+=${speed.current * direction * speedFactor}`,
          duration: 0.2,
          ease: "power1.out",
          overwrite: "auto"
        });
      }
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [minSpeed, isMobile]);

  useEffect(() => {
    const checkMobile = () => { setIsMobile(isMobileDevice()); };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => { window.removeEventListener('resize', checkMobile); };
  }, []);

  useEffect(() => {
    if (!gsap) { return; }

    textRefs.forEach(ref => {
      if (ref.current) {
        gsap.set(ref.current, { rotate: 0, transformOrigin: 'center center' });
      }
    });

    animationRef.current = requestAnimationFrame(animate);

    if (!isMobile) {
      let scrollTimeout: NodeJS.Timeout;
      const handleWheel = (e: WheelEvent): void => {
        isScrolling.current = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => { isScrolling.current = false; }, 150);
        
        const newSpeed = e.deltaY * scrollSensitivity;
        defaultDirectionRef.current = e.deltaY > 0 ? 1 : -1;
        speed.current = Math.max(Math.min(newSpeed, maxSpeed), -maxSpeed);
      };

      window.addEventListener('wheel', handleWheel, { passive: true });

      return () => {
        window.removeEventListener('wheel', handleWheel);
        clearTimeout(scrollTimeout);
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    } else {
      return () => {
        if (animationRef.current !== null) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [animate, maxSpeed, scrollSensitivity, isMobile]);

  useEffect(() => {
    if (!gsap || !circleRef.current) return;
    gsap.set(circleRef.current, { transformOrigin: 'center center' });
    
    if (isHovering) {
      gsap.to(circleRef.current, { scale: expandedRadius / initialRadius, duration: 0.3, ease: "power2.out" });
    } else {
      gsap.to(circleRef.current, { scale: 1, duration: 0.3, ease: "power2.out" });
    }
  }, [isHovering, expandedRadius, initialRadius]);

  const circleConfigs: CircleConfig[] = [
    { text: 'SITIOS WEB ××× QUE CONVIERTEN ×××', radius: 165, fontSize: 58, direction: 1 },
    { text: 'SOLUCIONES  »  REALES  »  ', radius: 113, fontSize: 58, direction: -1 },
    { text: 'INICIAR ∙ INICIAR ∙ INICIAR ∙', radius: 75, fontSize: 37, direction: 1 }
  ];

  const viewBoxSize = outerCircleRadius * 2 + 20;
  const viewBox = `-${viewBoxSize/2} -${viewBoxSize/2} ${viewBoxSize} ${viewBoxSize}`;

  // --- 4. LA MODIFICACIÓN FINAL Y CORRECTA EN EL JSX ---
  return (
    <Link 
      href={href} 
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
          <circle
            cx="0"
            cy="0"
            r={outerCircleRadius}
            fill="transparent"
            stroke="#1C1C1C"
            strokeWidth="1"
          />
          <g
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={{ cursor: 'pointer' }}
            // onClick se elimina. Link se encarga.
          >
            <circle
              ref={circleRef}
              cx="0"
              cy="0"
              r={initialRadius}
              fill="#FF5741"
            />
            <foreignObject 
              x="-12" 
              y="-12" 
              width="24" 
              height="24" 
              style={{ pointerEvents: 'none', overflow: 'visible' }}
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
    </Link>
  );
};

export default CircularRotatingText;