// components/SmoothScrolling.tsx
'use client'

import { useEffect } from 'react'
import { getLenis } from '@/lib/lenis' // <-- 1. Importa la función
import { gsap } from 'gsap'
import { ScrollTrigger } from '@/lib/gsapInit'

export default function SmoothScrolling() {
  useEffect(() => {
    // 2. Llama a la función para obtener/crear la instancia DENTRO de useEffect
    const lenis = getLenis();

    if (lenis) {
      // El resto de la lógica es la misma
      lenis.on('scroll', ScrollTrigger.update)

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000)
      })

      gsap.ticker.lagSmoothing(0)
    }

    // 3. La función de limpieza ahora también destruye la instancia
    return () => {
        if (lenis) {
            lenis.destroy();
            // Esto es opcional, pero bueno para el hot-reloading en desarrollo
            // En la nueva versión de lenis.ts, esto permitiría recrear la instancia.
        }
    }
  }, [])

  return null
}