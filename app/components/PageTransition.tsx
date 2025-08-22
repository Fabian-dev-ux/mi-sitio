'use client'
import { useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, setTransitioning } from "@/lib/gsapInit"
import { useGSAP } from "@gsap/react"
import { getLenis } from '@/lib/lenis'

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
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Detectar dispositivo móvil real
  const isMobile = () => {
    if (typeof window === 'undefined') return false
    
    const userAgent = navigator.userAgent.toLowerCase()
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
    const isSmallScreen = window.innerWidth <= 768
    const isTouchDevice = 'ontouchstart' in window
    
    return isMobileUA || (isSmallScreen && isTouchDevice)
  }

  // Función para pausar Lenis temporalmente
  const pauseLenis = () => {
    const lenis = getLenis()
    if (lenis) {
      lenis.stop()
      console.log('📱 Lenis pausado para transición')
    }
  }

  const resumeLenis = () => {
    const lenis = getLenis()
    if (lenis) {
      // Delay pequeño para que termine la animación
      setTimeout(() => {
        lenis.start()
        console.log('📱 Lenis reanudado')
      }, 100)
    }
  }

  // Efecto para detectar cambios de ruta y debug móvil
  useEffect(() => {
    const mobileInfo = {
      isMobileDevice: isMobile(),
      userAgent: navigator.userAgent,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      touchSupport: 'ontouchstart' in window,
      pathname: pathname,
      prevPathname: prevPathnameRef.current,
      isReady: isReady,
      hasInitialized: hasInitializedRef.current
    }
    
    console.log('📱 MOBILE DEBUG:', mobileInfo)
    
    // Mostrar debug en pantalla temporalmente
    if (isMobile()) {
      const debugDiv = document.getElementById('mobile-debug') || document.createElement('div')
      debugDiv.id = 'mobile-debug'
      debugDiv.style.cssText = `
        position: fixed; 
        top: 10px; 
        left: 10px; 
        background: rgba(0,0,0,0.8); 
        color: white; 
        padding: 10px; 
        font-size: 10px; 
        z-index: 9999;
        max-width: 300px;
        border-radius: 5px;
      `
      debugDiv.textContent = `Route: ${pathname} | Ready: ${isReady} | Mobile: ${isMobile()}`
      
      if (!document.getElementById('mobile-debug')) {
        document.body.appendChild(debugDiv)
      }
      
      // Remover después de 3 segundos
      setTimeout(() => {
        debugDiv.remove()
      }, 3000)
    }
  }, [pathname, isReady])

  useGSAP(() => {
    const container = containerRef.current
    const curtain1 = curtain1Ref.current
    const curtain2 = curtain2Ref.current
    const curtain3 = curtain3Ref.current
    
    if (!container || !curtain1 || !curtain2 || !curtain3) return

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Si no está listo, mostrar contenido sin animación
    if (!isReady) {
      console.log('📱 PageTransition no está listo')
      gsap.set(container, { opacity: 1, y: 0 })
      gsap.set([curtain1, curtain2, curtain3], { y: '100%', scaleY: 0 })
      return
    }

    // Detectar cambio de ruta real
    const isRouteChange = hasInitializedRef.current && prevPathnameRef.current !== pathname
    
    console.log('📱 Route Analysis:', {
      isRouteChange,
      hasInitialized: hasInitializedRef.current,
      prevPath: prevPathnameRef.current,
      currentPath: pathname,
      isAnimating: isAnimatingRef.current
    })

    if (!isRouteChange) {
      // Primera carga - mostrar contenido directamente
      gsap.set(container, { opacity: 1, y: 0 })
      gsap.set([curtain1, curtain2, curtain3], { y: '100%', scaleY: 0 })
      hasInitializedRef.current = true
      prevPathnameRef.current = pathname
      return
    }

    // Prevenir múltiples animaciones
    if (isAnimatingRef.current) {
      console.log('📱 Animación en progreso, saltando...')
      return
    }

    // EJECUTAR ANIMACIÓN DE TRANSICIÓN
    console.log('📱 ¡EJECUTANDO TRANSICIÓN MÓVIL!')
    isAnimatingRef.current = true
    
    // Marcar que estamos en transición para evitar ScrollTrigger refreshes
    setTransitioning(true)

    // Pausar Lenis durante la transición
    pauseLenis()

    // Limpiar animaciones previas con más agresividad
    gsap.killTweensOf([container, curtain1, curtain2, curtain3])
    
    // En móviles, usar un timeout para dar tiempo al navegador
    const animationDelay = isMobile() ? 50 : 0

    timeoutRef.current = setTimeout(() => {
      // Configuración inicial
      gsap.set(container, { 
        opacity: 0,
        y: isMobile() ? 20 : 30
      })
      
      gsap.set([curtain1, curtain2, curtain3], { 
        y: '100%',
        scaleY: 1,
        transformOrigin: 'bottom center',
        force3D: true,
        // Añadir will-change via GSAP
        willChange: 'transform'
      })

      // Configuración optimizada para móvil
      const mobileDuration = 0.35
      const mobileDelay = 0.08
      const desktopDuration = 0.6
      const desktopDelay = 0.15

      const duration = isMobile() ? mobileDuration : desktopDuration
      const delay = isMobile() ? mobileDelay : desktopDelay

      const tl = gsap.timeline({
        onComplete: () => {
          console.log('📱 Transición completada')
          isAnimatingRef.current = false
          
          // Marcar fin de transición ANTES de reanudar Lenis
          setTransitioning(false)
          resumeLenis()
          
          // Limpiar will-change después de la animación
          gsap.set([curtain1, curtain2, curtain3], { willChange: 'auto' })
          gsap.set(container, { willChange: 'auto' })
        }
      })

      // Animación de franjas - más rápida en móvil
      tl.to(curtain1, {
        y: '0%',
        duration: duration,
        ease: 'power2.inOut'
      })
      .to(curtain2, {
        y: '0%',
        duration: duration,
        ease: 'power2.inOut'
      }, delay)
      .to(curtain3, {
        y: '0%',
        duration: duration,
        ease: 'power2.inOut'
      }, delay * 2)
      
      // Contracción de franjas
      .to(curtain1, {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: duration * 0.7,
        ease: 'power2.inOut'
      }, duration * 0.7)
      .to(curtain2, {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: duration * 0.7,
        ease: 'power2.inOut'
      }, duration * 0.7 + delay)
      .to(curtain3, {
        scaleY: 0,
        transformOrigin: 'top center',
        duration: duration * 0.7,
        ease: 'power2.inOut'
      }, duration * 0.7 + delay * 2)
      
      // Aparición del contenido
      .to(container, {
        opacity: 1,
        y: 0,
        duration: duration,
        ease: 'power2.out',
        willChange: 'transform, opacity'
      }, duration * 1.1)

    }, animationDelay)

    // Actualizar referencias
    prevPathnameRef.current = pathname

  }, [pathname, isReady])

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      isAnimatingRef.current = false
      // Asegurar que el estado de transición se limpia
      setTransitioning(false)
    }
  }, [])

  return (
    <>
      {/* Franjas de transición con optimizaciones para móvil */}
      <div
        ref={curtain1Ref}
        className="fixed top-0 left-0 w-1/3 h-full z-50 pointer-events-none bg-primary"
        style={{ 
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
      />
      
      <div
        ref={curtain2Ref}
        className="fixed top-0 left-1/3 w-1/3 h-full z-50 pointer-events-none bg-primary"
        style={{ 
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
      />
      
      <div
        ref={curtain3Ref}
        className="fixed top-0 right-0 w-1/3 h-full z-50 pointer-events-none bg-primary"
        style={{ 
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          perspective: 1000
        }}
      />
      
      {/* Contenedor del contenido */}
      <div 
        ref={containerRef} 
        className="min-h-screen"
        style={{ 
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden'
        }}
      >
        {children}
      </div>
    </>
  )
}