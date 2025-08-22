'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger, setTransitioning } from '@/lib/gsapInit';
import { getLenis } from '@/lib/lenis';

export default function GsapManager() {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Solo ejecutar si realmente cambió la ruta
    if (previousPathname.current === pathname) {
      return;
    }

    console.log('GsapManager - Route change detected:', pathname);

    // Detectar móvil
    const isMobile = typeof window !== 'undefined' && 
                    (window.innerWidth <= 768 || 
                     /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    // Timeout más largo para dar tiempo a que termine la transición de página
    const timeout = isMobile ? 400 : 200;

    const timer = setTimeout(() => {
      console.log('GsapManager - Ejecutando refresh y scroll logic');
      
      const lenis = getLenis(); 
      if (lenis) {
        lenis.resize();
      }
      
      // Solo hacer refresh si no estamos en transición
      if (typeof setTransitioning === 'function') {
        ScrollTrigger.refresh();
      }

      // Lógica de scroll
      const hash = window.location.hash;
      
      if (hash) {
        console.log('GsapManager - Scrolling to hash:', hash);
        if (lenis) {
          lenis.scrollTo(hash, { offset: 0, duration: 1.5 });
        } else {
          const element = document.querySelector(hash);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        console.log('GsapManager - Scrolling to top');
        if (lenis) {
          lenis.scrollTo(0, { immediate: true });
        } else {
          window.scrollTo(0, 0);
        }
      }

    }, timeout);

    // Actualizar referencia
    previousPathname.current = pathname;

    return () => {
      clearTimeout(timer);
    };
  }, [pathname]);

  return null;
}