'use client'
import { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, setTransitioning } from "@/lib/gsapInit"
import { useGSAP } from "@gsap/react"
import { getLenis } from '@/lib/lenis'

interface PageTransitionProps {
  children: React.ReactNode;
}

// Ya no necesitamos el prop 'isReady', lo eliminamos de las props.
export default function PageTransition({ children }: PageTransitionProps) {
  const containerRef = useRef(null)
  const curtain1Ref = useRef(null)
  const curtain2Ref = useRef(null)
  const curtain3Ref = useRef(null)
  const pathname = usePathname()

  const prevPathnameRef = useRef(pathname)
  const hasInitializedRef = useRef(false)
  const isAnimatingRef = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const isMobile = () => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent.toLowerCase();
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  }

  const pauseLenis = () => {
    const lenis = getLenis();
    if (lenis) lenis.stop();
  }

  const resumeLenis = () => {
    const lenis = getLenis();
    if (lenis) {
      setTimeout(() => lenis.start(), 100);
    }
  }

  // Eliminamos 'isReady' de las dependencias. Ahora el hook solo se re-ejecuta
  // cuando cambia la ruta (pathname), que es exactamente lo que queremos.
  useGSAP(() => {
    const container = containerRef.current
    const curtain1 = curtain1Ref.current
    const curtain2 = curtain2Ref.current
    const curtain3 = curtain3Ref.current
    
    if (!container || !curtain1 || !curtain2 || !curtain3) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // La lógica ahora es más simple:
    // ¿Ha cambiado la ruta desde la última vez?
    const isRouteChange = hasInitializedRef.current && prevPathnameRef.current !== pathname
    
    // Si no es un cambio de ruta (es la primera carga de la página)
    if (!isRouteChange) {
      console.log('📱 Primera carga, mostrando contenido sin animación de cortina.');
      gsap.set(container, { opacity: 1, y: 0 });
      gsap.set([curtain1, curtain2, curtain3], { y: '100%', scaleY: 0 });
      hasInitializedRef.current = true;
      prevPathnameRef.current = pathname;
      return;
    }
    
    // Si es un cambio de ruta, procedemos con la animación.
    if (isAnimatingRef.current) {
      console.log('📱 Animación ya en progreso, saltando...');
      return
    }

    console.log('📱 ¡EJECUTANDO TRANSICIÓN DE PÁGINA!');
    isAnimatingRef.current = true;
    setTransitioning(true);
    pauseLenis();

    gsap.killTweensOf([container, curtain1, curtain2, curtain3]);
    
    const animationDelay = isMobile() ? 50 : 0;

    timeoutRef.current = setTimeout(() => {
      gsap.set(container, { opacity: 0, y: isMobile() ? 20 : 30 });
      gsap.set([curtain1, curtain2, curtain3], { 
        y: '100%',
        scaleY: 1,
        transformOrigin: 'bottom center',
        force3D: true,
      });

      const duration = isMobile() ? 0.4 : 0.6; // Ligeramente ajustado para móvil
      const delay = isMobile() ? 0.08 : 0.15;

      const tl = gsap.timeline({
        onComplete: () => {
          isAnimatingRef.current = false;
          setTransitioning(false);
          resumeLenis();
        }
      });

      tl.to([curtain1, curtain2, curtain3], {
        y: '0%',
        duration: duration,
        ease: 'power2.inOut',
        stagger: delay
      })
      .to([curtain1, curtain2, curtain3], {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: duration * 0.7,
        ease: 'power2.inOut',
        stagger: delay
      }, '+=0.2') // Simplificado el timing de la salida
      .to(container, {
        opacity: 1,
        y: 0,
        duration: duration,
        ease: 'power2.out',
      }, '-=0.4'); // El contenido aparece un poco antes de que las cortinas se vayan

    }, animationDelay);

    prevPathnameRef.current = pathname;

  }, [pathname]); // <-- ÚNICA DEPENDENCIA: pathname

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      isAnimatingRef.current = false;
      setTransitioning(false);
    }
  }, []);

  // El resto del JSX permanece igual...
  return (
    <>
      <div ref={curtain1Ref} className="fixed top-0 left-0 w-1/3 h-full z-50 pointer-events-none bg-primary" />
      <div ref={curtain2Ref} className="fixed top-0 left-1/3 w-1/3 h-full z-50 pointer-events-none bg-primary" />
      <div ref={curtain3Ref} className="fixed top-0 right-0 w-1/3 h-full z-50 pointer-events-none bg-primary" />
      <div ref={containerRef} className="min-h-screen">
        {children}
      </div>
    </>
  )
}