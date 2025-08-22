// lib/lenis.ts
'use client'

import Lenis from '@studio-freight/lenis'

let lenis: Lenis | null = null;

// Exportamos una función para obtener o crear la instancia (Patrón Singleton)
export const getLenis = () => {
  // Si la instancia aún no existe Y estamos en el navegador...
  if (!lenis && typeof window !== 'undefined') {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    })
  }
  return lenis
}