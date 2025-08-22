'use client'
import { useRef, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { gsap } from "@/lib/gsapInit"
import { useGSAP } from "@gsap/react"

interface PageTransitionProps {
  children: React.ReactNode;
  isReady?: boolean;
}

export default function PageTransition({ children, isReady = true }: PageTransitionProps) {
  const containerRef = useRef(null)
  const curtain1Ref = useRef(null)
  const curtain2Ref = useRef(null)
  const curtain3Ref = useRef(null)
  const pathname = usePathname()

  const prevPathnameRef = useRef(pathname)
  const hasInitializedRef = useRef(false)
  const isAnimatingRef = useRef(false)

  // Función para detectar si estamos en móvil
  const isMobile = useCallback(() => {
    return typeof window !== 'undefined' && 
           (window.innerWidth <= 768 || 
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
  }, [])

  useGSAP(() => {
    const container = containerRef.current
    const curtain1 = curtain1Ref.current
    const curtain2 = curtain2Ref.current
    const curtain3 = curtain3Ref.current
    
    if (!container || !curtain1 || !curtain2 || !curtain3) return

    // Prevenir animaciones múltiples
    if (isAnimatingRef.current) {
      console.log('Animación en progreso, saltando...')
      return
    }

    // Si no está listo, mostrar el contenido sin animación
    if (!isReady) {
      console.log('PageTransition no está listo, mostrando contenido directamente')
      gsap.set(container, { 
        opacity: 1,
        y: 0
      })
      gsap.set([curtain1, curtain2, curtain3], { 
        y: '100%',
        scaleY: 0
      })
      return;
    }

    // Detectar cambio de ruta real
    const isRouteChange = hasInitializedRef.current && prevPathnameRef.current !== pathname
    
    console.log('PageTransition - Pathname:', pathname)
    console.log('PageTransition - PrevPathname:', prevPathnameRef.current)
    console.log('PageTransition - IsRouteChange:', isRouteChange)
    console.log('PageTransition - HasInitialized:', hasInitializedRef.current)
    console.log('PageTransition - IsMobile:', isMobile())

    if (!isRouteChange) {
      // Primera carga - mostrar contenido directamente
      gsap.set(container, { 
        opacity: 1,
        y: 0
      })
      gsap.set([curtain1, curtain2, curtain3], { 
        y: '100%',
        scaleY: 0
      })
      hasInitializedRef.current = true
      prevPathnameRef.current = pathname
      return;
    }

    // ANIMACIÓN DE TRANSICIÓN
    console.log('Ejecutando animación de transición de página')
    isAnimatingRef.current = true

    // Limpiar cualquier animación previa
    gsap.killTweensOf([container, curtain1, curtain2, curtain3])

    // Configuración inicial
    gsap.set(container, { 
      opacity: 0,
      y: 30 // Reducido para móviles
    })
    
    gsap.set([curtain1, curtain2, curtain3], { 
      y: '100%',
      scaleY: 1,
      transformOrigin: 'bottom center',
      force3D: true // Forzar aceleración de hardware
    })

    const tl = gsap.timeline({
      onComplete: () => {
        console.log('Animación de transición completada')
        isAnimatingRef.current = false
      }
    })

    // Timing ajustado para móviles
    const isMobileDevice = isMobile()
    const baseDelay = isMobileDevice ? 0.1 : 0.15
    const baseDuration = isMobileDevice ? 0.4 : 0.6

    // Las franjas suben de forma escalonada
    tl.to(curtain1, {
      y: '0%',
      duration: baseDuration,
      ease: 'power2.inOut'
    })
    .to(curtain2, {
      y: '0%',
      duration: baseDuration,
      ease: 'power2.inOut'
    }, baseDelay)
    .to(curtain3, {
      y: '0%',
      duration: baseDuration,
      ease: 'power2.inOut'
    }, baseDelay * 2)
    
    // Las franjas se contraen desde arriba
    .to(curtain1, {
      scaleY: 0,
      transformOrigin: 'top center',
      duration: baseDuration * 0.8,
      ease: 'power2.inOut'
    }, baseDuration * 0.8)
    .to(curtain2, {
      scaleY: 0,
      transformOrigin: 'top center',
      duration: baseDuration * 0.8,
      ease: 'power2.inOut'
    }, baseDuration * 0.8 + baseDelay)
    .to(curtain3, {
      scaleY: 0,
      transformOrigin: 'top center',
      duration: baseDuration * 0.8,
      ease: 'power2.inOut'
    }, baseDuration * 0.8 + baseDelay * 2)
    
    // La nueva página aparece
    .to(container, {
      opacity: 1,
      y: 0,
      duration: baseDuration,
      ease: 'power2.out'
    }, baseDuration * 1.2)

    // Actualizar referencias
    prevPathnameRef.current = pathname

  }, [pathname, isReady]) // Dependencias

  return (
    <>
      {/* Franjas de transición */}
      <div
        ref={curtain1Ref}
        className="fixed top-0 left-0 w-1/3 h-full z-50 pointer-events-none bg-primary"
        style={{ willChange: 'transform' }}
      />
      
      <div
        ref={curtain2Ref}
        className="fixed top-0 left-1/3 w-1/3 h-full z-50 pointer-events-none bg-primary"
        style={{ willChange: 'transform' }}
      />
      
      <div
        ref={curtain3Ref}
        className="fixed top-0 right-0 w-1/3 h-full z-50 pointer-events-none bg-primary"
        style={{ willChange: 'transform' }}
      />
      
      {/* Contenedor del contenido */}
      <div 
        ref={containerRef} 
        className="min-h-screen"
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </div>
    </>
  )
}