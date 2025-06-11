// components/PageTransition.jsx
'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { gsap, ScrollTrigger } from "@/lib/gsapInit"

export default function PageTransition({ children }) {
  const containerRef = useRef(null)
  const curtain1Ref = useRef(null)
  const curtain2Ref = useRef(null)
  const curtain3Ref = useRef(null)
  const pathname = usePathname()

  useEffect(() => {
    const container = containerRef.current
    const curtain1 = curtain1Ref.current
    const curtain2 = curtain2Ref.current
    const curtain3 = curtain3Ref.current
    
    if (!container || !curtain1 || !curtain2 || !curtain3) return

    // Configuración inicial
    gsap.set(container, { 
      opacity: 0,
      y: 50 // La nueva página inicia 50px hacia abajo
    })
    
    // Todas las franjas inician desde abajo
    gsap.set([curtain1, curtain2, curtain3], { 
      y: '100%',
      scaleY: 1,
      transformOrigin: 'bottom center'
    })

    const tl = gsap.timeline()
    
    // Las franjas suben de forma escalonada (primero la izquierda, luego centro, luego derecha)
    tl.to(curtain1, {
      y: '0%',
      duration: 0.6,
      ease: 'power2.inOut'
    })
    .to(curtain2, {
      y: '0%',
      duration: 0.6,
      ease: 'power2.inOut'
    }, 0.15) // Delay de 0.15s
    .to(curtain3, {
      y: '0%',
      duration: 0.6,
      ease: 'power2.inOut'
    }, 0.3) // Delay de 0.3s
    
    // Las franjas se contraen desde arriba de forma escalonada - empiezan antes de que terminen de subir
    .to(curtain1, {
      scaleY: 0,
      transformOrigin: 'top center',
      duration: 0.5,
      ease: 'power2.inOut'
    }, 0.5) // Empieza a contraerse mientras aún está subiendo
    .to(curtain2, {
      scaleY: 0,
      transformOrigin: 'top center',
      duration: 0.5,
      ease: 'power2.inOut'
    }, 0.65) // Empieza a contraerse mientras aún está subiendo
    .to(curtain3, {
      scaleY: 0,
      transformOrigin: 'top center',
      duration: 0.5,
      ease: 'power2.inOut'
    }, 0.8) // Empieza a contraerse mientras aún está subiendo
    
    // La nueva página aparece gradualmente con slide up - overlap con la contracción
    .to(container, {
      opacity: 1,
      y: 0, // Desliza hacia arriba a su posición final
      duration: 0.6,
      ease: 'power2.out'
    }, 0.7)

    return () => {
      tl.kill()
    }
  }, [pathname])

  return (
    <>
      {/* Franja izquierda */}
      <div
        ref={curtain1Ref}
        className="fixed top-0 left-0 w-1/3 h-full z-50 pointer-events-none bg-primary"
      />
      
      {/* Franja central */}
      <div
        ref={curtain2Ref}
        className="fixed top-0 left-1/3 w-1/3 h-full z-50 pointer-events-none bg-primary"
      />
      
      {/* Franja derecha */}
      <div
        ref={curtain3Ref}
        className="fixed top-0 right-0 w-1/3 h-full z-50 pointer-events-none bg-primary"
      />
      
      {/* Contenedor del contenido */}
      <div 
        ref={containerRef} 
        className="min-h-screen"
      >
        {children}
      </div>
    </>
  )
}