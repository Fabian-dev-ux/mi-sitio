// components/GsapManager.tsx
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ScrollTrigger } from '@/lib/gsapInit';
import { getLenis } from '@/lib/lenis'; // <-- 1. Importa la misma función

export default function GsapManager() {
  const pathname = usePathname();

  useEffect(() => {
    // 2. Obtiene la instancia (que ya fue creada por SmoothScrolling)
    const lenis = getLenis(); 

    const timer = setTimeout(() => {
      if (lenis) {
        lenis.resize();
      }
      ScrollTrigger.refresh();
      window.scrollTo(0, 0); 
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}