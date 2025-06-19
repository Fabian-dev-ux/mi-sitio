'use client'
import { useRef, useEffect, useState } from 'react'
import { gsap } from "@/lib/gsapInit"

export default function InfiniteConveyorText() {
  const scrollContainer = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number | null>(null)
  const isScrolling = useRef<boolean>(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [textWidth, setTextWidth] = useState(0)
  
  useEffect(() => {
    if (!scrollContainer.current) return
    
    let speed = 4.0
    let direction = -1 // Dirección por defecto (siempre hacia la izquierda)
    
    // Detectar si es dispositivo móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
    
    // Calcular el ancho de un solo elemento de texto para clonar adecuadamente
    const singleTextElement = scrollContainer.current.querySelector('.text-item')
    if (singleTextElement) {
      setTextWidth(singleTextElement.clientWidth)
    }
    
    // Función para animar el texto
    const animate = () => {
      if (!scrollContainer.current) return
      
      // En móvil: movimiento constante sin cambios
      // En desktop: lógica de scroll interactivo
      if (isMobile) {
        // Velocidad constante en móvil
        speed = 4.0
        direction = -1
      } else {
        // Si no estamos haciendo scroll activamente, mantener velocidad base
        if (!isScrolling.current) {
          speed = speed * 0.9
          if (speed < 4.0) {
            speed = 4.0
          }
        }
        
        // Reset del flag de scroll para el próximo frame
        isScrolling.current = false
      }
      
      // Desplazar la posición del contenedor
      const currentX = gsap.getProperty(scrollContainer.current, "x") as number
      let newX = currentX + (speed * direction)
      
      // Lógica de cinta transportadora infinita
      if (direction < 0) { // Moviendo hacia la izquierda
        // Si se ha desplazado un elemento completo hacia la izquierda, resetear posición
        if (newX <= -textWidth) {
          newX = newX + textWidth // Vuelve atrás exactamente un ancho de texto
        }
      } else { // Moviendo hacia la derecha
        // Si se ha desplazado un elemento completo hacia la derecha, resetear posición
        if (newX >= 0) {
          newX = newX - textWidth // Vuelve atrás exactamente un ancho de texto
        }
      }
      
      // Aplicar el nuevo valor de X
      gsap.set(scrollContainer.current, { x: newX })
      
      // Continuar la animación
      animationRef.current = requestAnimationFrame(animate)
    }
    
    // Función para manejar el scroll (solo en desktop)
    const handleScrollInput = (deltaY: number) => {
      // Marcar que estamos haciendo scroll activamente
      isScrolling.current = true
      
      // Limpiar timeout existente
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      // Establecer nuevo timeout - considera el scroll activo por 150ms
      scrollTimeoutRef.current = setTimeout(() => {
        isScrolling.current = false
      }, 150)
      
      // Calcular nueva velocidad basada en el scroll
      const scrollSensitivity = 1
      const newSpeed = Math.abs(deltaY) * scrollSensitivity
      
      // Usar la mayor velocidad (para respuesta más dinámica)
      speed = Math.max(newSpeed, speed)
      
      // Establecer la dirección basada en el scroll
      direction = deltaY > 0 ? -1 : 1
      
      // Limitar la velocidad máxima
      const maxSpeed = 20
      if (speed > maxSpeed) speed = maxSpeed
    }
    
    // Inicia la animación automáticamente
    animationRef.current = requestAnimationFrame(animate)
    
    // Evento de scroll solo para desktop
    const handleWheel = (e: WheelEvent) => {
      if (!isMobile) {
        handleScrollInput(e.deltaY)
      }
    }
    
    // Agregar event listener solo si no es móvil
    if (!isMobile) {
      window.addEventListener('wheel', handleWheel, { passive: true })
    }
    
    // Limpieza
    return () => {
      if (!isMobile) {
        window.removeEventListener('wheel', handleWheel)
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [textWidth])
  
  // Crear múltiples copias del texto para asegurar el efecto de cinta continua
  const createTextItems = (count: number, isGray: boolean) => {
    return Array(count).fill(0).map((_, index) => (
      <p 
        key={`text-${isGray ? 'gray' : 'white'}-${index}`}
        className={`text-item inline-block m-0 ${
          isGray ? 'text-gray-900' : 'text-white'
        } text-[5rem] md:text-[8.75rem] font-${isGray ? 'semibold' : 'medium'} pr-8 ${
          isGray ? 'font-display' : "font-['Clash_Display']"
        } uppercase leading-none`}
      >
        {isGray 
          ? "Desarrollo 🞄 UI 🞄 UX 🞄 Branding 🞄 SEO 🞄 Prototipado 🞄 Marketing 🞄 Gráficos 🞄 Redes 🞄 Contenido 🞄 "
          : "Desarrollo / UI / UX / Branding / SEO / Prototipado / Marketing / Gráficos / Redes / Contenido / "
        }
      </p>
    ))
  }
  
  return (
    <main className="relative overflow-hidden bg-dark pt-12 pb-6 lg:pt-24  lg:pb-12 2xl:pt-32  2xl:pb-12">
      <div className="relative h-[120px] md:h-[200px] w-screen">
        <div className="absolute top-6 md:top-12 left-0 w-screen overflow-hidden">
          <div ref={scrollContainer} className="relative whitespace-nowrap flex">
            {/* Primera línea (gris) - duplicada para crear efecto infinito */}
            {createTextItems(4, true)}
            
            {/* Segunda línea (blanca) - duplicada para crear efecto infinito */}
            {createTextItems(4, false)}
          </div>
        </div>
      </div>
    </main>
  )
}