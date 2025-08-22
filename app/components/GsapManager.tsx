// components/GsapManager.tsx (CORREGIDO Y MEJORADO)
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from '@/lib/gsapInit';
import { getLenis } from '@/lib/lenis';

export default function GsapManager() {
  const pathname = usePathname();

  useEffect(() => {
    // Usamos un timeout ligeramente mayor para dar más tiempo al renderizado en móviles.
    const timer = setTimeout(() => {
      const lenis = getLenis(); 
      if (lenis) {
        lenis.resize();
      }
      ScrollTrigger.refresh();

      // --- LÓGICA DE SCROLL CENTRALIZADA ---
      const hash = window.location.hash;
      
      if (hash) {
        // Si hay un hash, hacemos scroll a ese elemento usando Lenis
        if (lenis) {
          lenis.scrollTo(hash, { offset: 0, duration: 1.5 }); // Opciones de Lenis para scroll suave
        } else {
          // Fallback por si Lenis no está listo, aunque es raro
          const element = document.querySelector(hash);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // Si NO hay hash, vamos al inicio de la página inmediatamente usando Lenis
        if (lenis) {
          lenis.scrollTo(0, { immediate: true }); // 'immediate' es como scrollTo(0,0) pero para Lenis
        } else {
          window.scrollTo(0, 0); // Fallback
        }
      }
      // ------------------------------------

    }, 150); // Aumentamos un poco el tiempo a 150ms como margen de seguridad.

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}