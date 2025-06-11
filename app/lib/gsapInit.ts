import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

// Verificamos que estamos en el navegador antes de registrar el plugin
if (typeof window !== "undefined") {
  // Verificamos si ya está registrado para evitar registros duplicados
  if (!gsap.plugins?.scrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }
  
  // Configuración global para ScrollTrigger
  ScrollTrigger.config({
    ignoreMobileResize: true, // Opcional: para mejor rendimiento en móviles
    autoRefreshEvents: "visibilitychange,DOMContentLoaded,load,resize" // Eventos que disparan un refresco
  });
}

export { gsap, ScrollTrigger };