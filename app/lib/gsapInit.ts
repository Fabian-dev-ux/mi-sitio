import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Variable para controlar los refreshes durante transiciones
let isTransitioning = false;

// Función para pausar los auto-refresh durante transiciones
export const setTransitioning = (transitioning: boolean) => {
  isTransitioning = transitioning;
  // Descomenta la siguiente línea solo si necesitas debuggear en el navegador
  // console.log('📱 Transition state:', transitioning ? 'STARTED' : 'ENDED');
};

// Verificamos que estamos en el navegador antes de registrar el plugin
if (typeof window !== "undefined") {
  // Registramos el plugin directamente
  gsap.registerPlugin(ScrollTrigger);
  
  // Detectar si es móvil
  const isMobile = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isSmallScreen = window.innerWidth <= 768;
    const isTouchDevice = 'ontouchstart' in window;
    return isMobileUA || (isSmallScreen && isTouchDevice);
  };

  // --- LA SOLUCIÓN: CONSTRUIMOS UN ÚNICO OBJETO DE CONFIGURACIÓN ---
  
  // 1. Creamos un objeto de configuración base.
  let scrollTriggerConfig: gsap.DOMTarget | { [key: string]: any } = {};

  if (isMobile()) {
    // 2. Si es móvil, definimos la configuración para móviles.
    scrollTriggerConfig = {
      ignoreMobileResize: true,
      autoRefreshEvents: "DOMContentLoaded,load",
      // @ts-ignore - Mantenemos esto por si los tipos no están actualizados.
      refreshPriority: -1
    };

    // Configuraciones adicionales de GSAP para móvil
    gsap.config({
      force3D: true,
      nullTargetWarn: false
    });

    // Custom refresh que respeta las transiciones (solo en móvil)
    const originalRefresh = ScrollTrigger.refresh;
    ScrollTrigger.refresh = (...args) => {
      if (isTransitioning) {
        // console.log('📱 ScrollTrigger refresh bloqueado durante transición');
        return;
      }
      return originalRefresh.apply(ScrollTrigger, args);
    };

  } else {
    // 3. Si es escritorio, definimos la configuración para escritorio.
    scrollTriggerConfig = {
      ignoreMobileResize: false,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize"
    };
  }

  // 4. HACEMOS UNA SOLA LLAMADA a ScrollTrigger.config() con el objeto que construimos.
  ScrollTrigger.config(scrollTriggerConfig);

  // Configuración global de GSAP para mejor performance
  gsap.defaults({
    force3D: true,
    lazy: false
  });
}

export { gsap, ScrollTrigger };