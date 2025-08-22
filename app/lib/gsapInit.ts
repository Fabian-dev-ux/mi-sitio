import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Variable para controlar los refreshes durante transiciones
let isTransitioning = false;

// Función para pausar los auto-refresh durante transiciones
export const setTransitioning = (transitioning: boolean) => {
  isTransitioning = transitioning;
  console.log('📱 Transition state:', transitioning ? 'STARTED' : 'ENDED');
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

  // Configuración diferenciada por dispositivo
  if (isMobile()) {
    console.log('📱 Configurando ScrollTrigger para MÓVIL');
    
    ScrollTrigger.config({
      ignoreMobileResize: true,
      // En móviles, solo refrescar en eventos específicos para evitar interferencias
      autoRefreshEvents: "DOMContentLoaded,load",
      // Reducir la frecuencia de refreshes
      refreshPriority: -1
    });

    // Configuraciones adicionales para móvil
    gsap.config({
      force3D: true,
      nullTargetWarn: false
    });

    // Custom refresh que respeta las transiciones
    const originalRefresh = ScrollTrigger.refresh;
    ScrollTrigger.refresh = (...args) => {
      if (isTransitioning) {
        console.log('📱 ScrollTrigger refresh bloqueado durante transición');
        return;
      }
      return originalRefresh.apply(ScrollTrigger, args);
    };

  } else {
    console.log('🖥️ Configurando ScrollTrigger para DESKTOP');
    
    ScrollTrigger.config({
      ignoreMobileResize: false,
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize"
    });
  }

  // Configuración global de GSAP para mejor performance en móviles
  gsap.defaults({
    force3D: true,
    lazy: false
  });
}

export { gsap, ScrollTrigger };