"use client";
import Link from "next/link";
import SlideTextOnHover from "./SlideTextOnHover";
import { useEffect, useState, useRef } from "react";
import MagneticButton from "./MagneticButton";
import { gsap } from "@/lib/gsapInit"; // Usar tu configuración centralizada
import { useGSAP } from "@gsap/react"; // Importar useGSAP

const Navbar = () => {
  // Estado para controlar la animación del indicador de WhatsApp
  const [isActive, setIsActive] = useState<boolean>(true);
  // Estado para controlar el menú hamburguesa
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  // Estado para controlar la visibilidad del botón hamburguesa durante la transición
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  // Referencia para el menú móvil
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  // Referencias para los elementos del menú móvil
  const menuItemsRef = useRef<HTMLDivElement[]>([]);
  // Referencia para el borde superior
  const borderTopRef = useRef<HTMLDivElement>(null);

  // Resetear las referencias de los elementos del menú
  const resetMenuItemsRef = () => {
    menuItemsRef.current = [];
  };

  // Función para agregar elementos a la referencia del menú
  const addToMenuItemsRef = (el: HTMLDivElement | null) => {
    if (el && !menuItemsRef.current.includes(el)) {
      menuItemsRef.current.push(el);
    }
  };

  // Efecto para la animación de parpadeo
  useEffect(() => {
    const interval = setInterval(() => {
      setIsActive((prev) => !prev);
    }, 700); // Cambia cada 0.7 segundos

    return () => clearInterval(interval);
  }, []);

  // Efecto para cerrar el menú al hacer clic fuera de él
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && isMenuOpen) {
        handleCloseMenu();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Usar useGSAP para las animaciones del menú
  useGSAP(() => {
    if (isMenuOpen) {
      // Animación del borde superior - escalamiento horizontal
      if (borderTopRef.current) {
        gsap.set(borderTopRef.current, { 
          scaleX: 0,
          transformOrigin: "left" 
        });
        
        gsap.to(borderTopRef.current, {
          scaleX: 1,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.1
        });
      }
      
      // Animación de los elementos del menú
      if (menuItemsRef.current.length > 0) {
        // Ocultar inicialmente todos los elementos del menú
        gsap.set(menuItemsRef.current, { y: 40, opacity: 0 });
        
        // Animar la entrada de los elementos del menú uno por uno
        gsap.to(menuItemsRef.current, {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.1,
          ease: "power3.out",
          delay: 0.4 // Ajustado para que comience después de la animación del borde
        });
      }
    }
  }, { dependencies: [isMenuOpen], scope: mobileMenuRef }); // Agregar scope para mejor rendimiento

  // Función para abrir el menú
  const handleOpenMenu = () => {
    resetMenuItemsRef();
    setIsMenuOpen(true);
    setIsTransitioning(true);
  };

  // Función para cerrar el menú
  const handleCloseMenu = () => {
    setIsMenuOpen(false);
    
    // Esperar a que termine la transición antes de mostrar el botón hamburguesa
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500); // Este tiempo debe coincidir con la duración de la transición CSS
  };

  // Función para cerrar el menú después de hacer clic en un enlace
  const handleLinkClick = () => {
    handleCloseMenu();
  };

  return (
    <nav className="fixed top-0 left-0 w-full text-white px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 py-6 md:py-8 flex items-center justify-between z-50">
      <div className="grid grid-cols-2 lg:grid-cols-12 w-full gap-0 items-center">
        {/* Logo */}
        <div className="flex items-center col-span-1 lg:col-span-3">
          <Link href="/" className="block -ml-1 md:-ml-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              id="Layer_1"
              data-name="Layer 1"
              viewBox="0 0 181.86 36.96"
              width={160}
              height={32}
              className="md:w-[200px] md:h-[40px]"
            >
              <style>
                {`.cls-1{stroke-width:0px;}.primary{fill:#FF5741;}.gray-100{fill:#D0D1D2;}`}
              </style>
              <g>
                <g>
                  <path
                    className="gray-100"
                    d="m55.22,9.06h3.37v16.66h-3.37v-2.13c-1.44,1.67-3.35,2.5-5.73,2.5-1.47,0-2.85-.38-4.15-1.13-1.3-.75-2.34-1.79-3.12-3.12-.78-1.32-1.17-2.8-1.17-4.45s.39-3.13,1.17-4.45c.78-1.32,1.82-2.36,3.12-3.12,1.3-.75,2.68-1.13,4.15-1.13,2.38,0,4.29.83,5.73,2.5v-2.13Zm-2.57,13.08c.82-.48,1.47-1.13,1.93-1.97.47-.83.7-1.76.7-2.78s-.23-1.95-.7-2.78c-.47-.83-1.11-1.49-1.93-1.97-.82-.48-1.73-.72-2.73-.72s-1.91.24-2.73.72c-.82.48-1.47,1.13-1.93,1.97-.47.83-.7,1.76-.7,2.78s.23,1.95.7,2.78c.47.83,1.11,1.49,1.93,1.97.82.48,1.73.72,2.73.72s1.91-.24,2.73-.72Z"
                  />
                  <path
                    className="gray-100"
                    d="m73.46,9.64c1.03.63,1.84,1.5,2.42,2.6.58,1.1.87,2.33.87,3.68v9.8h-3.47v-9.36c0-1.33-.36-2.4-1.08-3.22-.72-.81-1.7-1.22-2.95-1.22s-2.24.41-3.07,1.23-1.23,1.89-1.23,3.2v9.36h-3.46V9.06h3.37v1.97c.67-.75,1.43-1.33,2.3-1.73.87-.4,1.8-.6,2.8-.6,1.31,0,2.48.32,3.51.95Z"
                  />
                  <path
                    className="gray-100"
                    d="m79.23,4.66h3.46v4.4h4.1v3.2h-4.1v7.6c0,.82.23,1.47.7,1.93s1.11.7,1.93.7h1.47v3.23h-2.1c-1.67,0-2.99-.49-3.98-1.47-.99-.98-1.48-2.28-1.48-3.9V4.66Z"
                  />
                  <path
                    className="gray-100"
                    d="m101.83,9.06h3.37v16.66h-3.37v-2.13c-1.44,1.67-3.35,2.5-5.73,2.5-1.47,0-2.85-.38-4.15-1.13-1.3-.75-2.34-1.79-3.12-3.12-.78-1.32-1.17-2.8-1.17-4.45s.39-3.13,1.17-4.45c.78-1.32,1.82-2.36,3.12-3.12,1.3-.75,2.68-1.13,4.15-1.13,2.38,0,4.29.83,5.73,2.5v-2.13Zm-2.57,13.08c.82-.48,1.47-1.13,1.93-1.97.47-.83.7-1.76.7-2.78s-.23-1.95-.7-2.78c-.47-.83-1.11-1.49-1.93-1.97-.82-.48-1.73-.72-2.73-.72s-1.91.24-2.73.72c-.82.48-1.47,1.13-1.93,1.97-.47.83-.7,1.76-.7,2.78s.23,1.95.7,2.78c.47.83,1.11,1.49,1.93,1.97.82.48,1.73.72,2.73.72s1.91-.24,2.73-.72Z"
                  />
                  <path
                    className="gray-100"
                    d="m131.28,24.96c-1.36-.74-2.44-1.78-3.25-3.10-.81-1.32-1.22-2.82-1.22-4.48s.41-3.16,1.22-4.48c.81-1.32,1.89-2.35,3.25-3.10,1.35-.74,2.82-1.12,4.4-1.12s3.04.37,4.4,1.12c1.35.74,2.44,1.78,3.25,3.10.81,1.32,1.22,2.82,1.22,4.48s-.41,3.16-1.22,4.48c-.81,1.32-1.89,2.35-3.25,3.10-1.36.74-2.82,1.12-4.4,1.12s-3.04-.37-4.4-1.12Zm7.1-2.83c.82-.48,1.47-1.13,1.93-1.97.47-.83.7-1.76.7-2.78s-.23-1.95-.7-2.78c-.47-.83-1.11-1.49-1.93-1.97-.82-.48-1.72-.72-2.7-.72s-1.91.24-2.73.72c-.82.48-1.47,1.13-1.93,1.97-.47.83-.7,1.76-.7,2.78s.23,1.95.7,2.78c.47.83,1.11,1.49,1.93,1.97.82.48,1.73.72,2.73.72s1.88-.24,2.7-.72Z"
                  />
                  <path
                    className="gray-100"
                    d="m158.33,9.64c1.03.63,1.84,1.5,2.42,2.6.58,1.1.87,2.33.87,3.68v9.8h-3.47v-9.36c0-1.33-.36-2.4-1.08-3.22-.72-.81-1.7-1.22-2.95-1.22s-2.24.41-3.07,1.23-1.23,1.89-1.23,3.2v9.36h-3.46V9.06h3.37v1.97c.67-.75,1.43-1.33,2.3-1.73.87-.4,1.8-.6,2.8-.6,1.31,0,2.48.32,3.51.95Z"
                  />
                  <g>
                    <path
                      className="gray-100"
                      d="m111.57,24.96c-1.36-.74-2.44-1.78-3.25-3.10-.81-1.32-1.22-2.82-1.22-4.48s.41-3.16,1.22-4.48c.81-1.32,1.89-2.35,3.25-3.10,1.35-.74,2.82-1.12,4.4-1.12s3.04.37,4.4,1.12c1.35.74,2.44,1.78,3.25,3.10.81,1.32,1.22,2.82,1.22,4.48s-.41,3.16-1.22,4.48c-.81,1.32-1.89,2.35-3.25,3.10-1.36.74-2.82,1.12-4.4,1.12s-3.04-.37-4.4-1.12Zm7.1-2.83c.82-.48,1.47-1.13,1.93-1.97.47-.83.7-1.76.7-2.78s-.23-1.95-.7-2.78c-.47-.83-1.11-1.49-1.93-1.97-.82-.48-1.72-.72-2.7-.72s-1.91.24-2.73.72c-.82.48-1.47,1.13-1.93,1.97-.47.83-.7,1.76-.7,2.78s.23,1.95.7,2.78c.47.83,1.11,1.49,1.93,1.97.82.48,1.73.72,2.73.72s1.88-.24,2.7-.72Z"
                    />
                    <path
                      className="gray-100"
                      d="m115.97,31.41c2.94,0,5.33-2.39,5.33-5.33h3.53c0,4.89-3.97,8.86-8.86,8.86v-3.53Z"
                    />
                    <rect
                      className="gray-100"
                      x="121.89"
                      y="9.06"
                      width="4.1"
                      height="3.2"
                    />
                  </g>
                  <path
                    className="gray-100"
                    d="m167.56,7.24h-3.46v-2.58h3.46v2.58Zm.1,18.47h-3.46V9.06h3.46v16.66Z"
                  />
                </g>
                <polygon
                  className="gray-100"
                  points="172.44 16.91 178.6 9.06 174.67 9.06 168.55 17.06 175.33 25.71 179.46 25.71 172.44 16.91"
                />
              </g>
              <g>
                <path
                  className="primary"
                  d="m29.99,8.06h-12.21c5.15,0,9.33,4.18,9.33,9.33s-4.18,9.33-9.33,9.33l-6.04,6.04h6.04c8.49,0,15.37-6.88,15.37-15.37,0-3.51-1.18-6.74-3.15-9.33Z"
                />
                <path
                  className="primary"
                  d="m8.45,17.38c0-5.15,4.18-9.33,9.33-9.33l6.04-6.04h-6.04c-8.49,0-15.37,6.88-15.37,15.37,0,3.51,1.18,6.74,3.15,9.33h12.21c-5.15,0-9.33-4.18-9.33-9.33Z"
                />
              </g>
            </svg>
          </Link>
        </div>

        {/* Menú de navegación - Centrado visualmente */}
        <ul className="hidden lg:flex items-center justify-center space-x-4 text-gray-600 col-span-6 font-archivo text-sm">
          <li>
            <Link href="/#servicios" className="font-regular inline-block group">
              <SlideTextOnHover
                originalText="SERVICIOS"
                hoverText="SERVICIOS"
              />
            </Link>
          </li>
          <span>/</span>
          <li>
            <Link href="/#proyectos" className="inline-block group">
              <SlideTextOnHover
                originalText="PROYECTOS"
                hoverText="PROYECTOS"
              />
            </Link>
          </li>
          <span>/</span>
          <li>
            <Link href="/#proceso" className="inline-block group">
              <SlideTextOnHover
                originalText="PROCESO"
                hoverText="PROCESO"
              />
            </Link>
          </li>
          <span>/</span>
          <li>
            <Link href="/#visión" className="inline-block group">
              <SlideTextOnHover
                originalText="VISIÓN"
                hoverText="VISIÓN"
              />
            </Link>
          </li>
        </ul>

        {/* Botón de contacto e indicador de WhatsApp */}
        <div className="flex items-center justify-end col-span-1 lg:col-span-3 space-x-6">
          {/* Botón de contacto */}
          <div className="hidden lg:flex">
            <MagneticButton
              magneticStrength={0.5}
              magneticArea={50}
            >
              <Link
                href="/contacto"
                className="flex items-center bg-gray-300 text-dark px-4 py-2 rounded-full font-archivo text-sm font-regular text-gray-700 hover:bg-gray-100 transition-colors duration-300 group"
              >
                <SlideTextOnHover
                  originalText="CONTACTAR"
                  hoverText="CONTACTAR"
                  className="text-dark"
                />
              </Link>
            </MagneticButton>
          </div>

          {/* Enlace de WhatsApp */}
          <div className="hidden lg:flex items-center">
            <a 
              href="https://wa.me/message/6HLV5OAO5GMBO1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-500 font-archivo text-sm font-regular text-gray-600"
            >
              {/* Círculo animado que parpadea entre naranja y gris */}
              <span className={`transition-colors duration-300 ease-in-out ${isActive ? 'text-primary' : 'text-gray-700'} text-xl`}>•</span>{" "}
              <span className="ml-1 relative group">
                WSP (593) 9841 96542
                <span className="absolute left-0 bottom-0 w-full h-[1px] bg-gray-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
              </span>
            </a>
          </div>

          {/* Botón hamburguesa - Visible en pantallas pequeñas y medianas */}
          {!isMenuOpen && !isTransitioning && (
            <button
              className="ml-4 lg:hidden flex flex-col justify-center items-center z-50"
              onClick={handleOpenMenu}
              aria-label="Menú"
            >
              <svg
                viewBox="0 0 46.04 25.27"
                className="w-6 h-6 text-gray-300 fill-current"
                aria-hidden="true"
              >
                <rect className="cls-1" x="0" y="0" width="46.04" height="3" />
                <rect className="cls-1" x="0" y="11.13" width="34.53" height="3" />
                <rect className="cls-1" x="0" y="22.27" width="23.02" height="3" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Menú móvil - Aparece como overlay al hacer clic en el botón hamburguesa */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 w-full h-full bg-primary z-40 transform transition-transform duration-500 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          } lg:hidden flex flex-col justify-center items-center`}
      >
        <div className="flex flex-col justify-between h-full w-full px-5 py-6">
          {/* Encabezado del menú con el texto "MENU" y botón de cerrar */}
          <div ref={borderTopRef}>
            <div className="flex justify-between items-center w-full">
              <span className="font-archivo text-sm font-regular text-dark">
                MENU
              </span>
              <button
                className="flex flex-col justify-center items-center z-50"
                onClick={handleCloseMenu}
                aria-label="Cerrar menú"
              >
                <span
                  className="block w-6 h-0.5 bg-dark mb-1.5 transform rotate-45"
                ></span>
                <span
                  className="block w-6 h-0.5 bg-dark transform -rotate-45 -translate-y-2"
                ></span>
              </button>
            </div>

            {/* Elementos del menú */}
            <ul className="flex flex-col items-start space-y-0 text-dark font-display font-semibold text-3xl mt-16 pt-4 border-t border-dark border-opacity-50">
              <li className="w-full text-left py-2 overflow-hidden">
                <div className="relative inline-flex items-center" ref={addToMenuItemsRef}>
                  <Link
                    href="/#servicios"
                    className="inline-block group"
                    onClick={handleLinkClick}
                  >
                    <SlideTextOnHover
                      originalText="SERVICIOS"
                      hoverText="SERVICIOS"
                      className="text-dark"
                    />
                  </Link>
                  <span className="text-sm font-medium text-dark ml-2 -translate-y-2">/01</span>
                </div>
              </li>
              <li className="w-full text-left py-2 overflow-hidden">
                <div className="relative inline-flex items-center" ref={addToMenuItemsRef}>
                  <Link
                    href="/#proyectos"
                    className="inline-block group"
                    onClick={handleLinkClick}
                  >
                    <SlideTextOnHover
                      originalText="PROYECTOS"
                      hoverText="PROYECTOS"
                      className="text-dark"
                    />
                  </Link>
                  <span className="text-sm font-medium text-dark ml-2 -translate-y-2">/02</span>
                </div>
              </li>
              <li className="w-full text-left py-2 overflow-hidden">
                <div className="relative inline-flex items-center" ref={addToMenuItemsRef}>
                  <Link
                    href="/#proceso"
                    className="inline-block group"
                    onClick={handleLinkClick}
                  >
                    <SlideTextOnHover
                      originalText="PROCESO"
                      hoverText="PROCESO"
                      className="text-dark"
                    />
                  </Link>
                  <span className="text-sm font-medium text-dark ml-2 -translate-y-2">/03</span>
                </div>
              </li>
              <li className="w-full text-left py-2 overflow-hidden">
                <div className="relative inline-flex items-center" ref={addToMenuItemsRef}>
                  <Link
                    href="/#visión"
                    className="inline-block group"
                    onClick={handleLinkClick}
                  >
                    <SlideTextOnHover
                      originalText="VISIÓN"
                      hoverText="VISIÓN"
                      className="text-dark"
                    />
                  </Link>
                  <span className="text-sm font-medium text-dark ml-2 -translate-y-2">/04</span>
                </div>
              </li>
              <li className="w-full text-left py-2 overflow-hidden">
                <div className="relative inline-flex items-center" ref={addToMenuItemsRef}>
                  <Link
                    href="/contacto"
                    className="inline-block group"
                    onClick={handleLinkClick}
                  >
                    <SlideTextOnHover
                      originalText="CONTACTOS"
                      hoverText="CONTACTOS"
                      className="text-dark"
                    />
                  </Link>
                  <span className="text-sm font-medium text-dark ml-2 -translate-y-2">/05</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Información de contacto - Versión para móvil */}
          <div className="flex flex-col font-archivo text-sm font-regular uppercase text-dark space-y-6 pt-2.5 border-t border-dark border-opacity-50">
            {/* Email y teléfono */}
            <div className="flex flex-col space-y-0.5">
              <a href="mailto:info@antagonik.com" className="hover:text-dark/75 transition-colors">info@antagonik.com</a>
              <a href="https://wa.me/message/6HLV5OAO5GMBO1" target="_blank" rel="noopener noreferrer" className="hover:text-dark/75 transition-colors">[ 593 ] 98 419 6542</a>
            </div>

            {/* Redes sociales - Reorganizadas: LinkedIn, Behance, Instagram */}
            <div className="flex items-center space-x-2 text-dark">
              <a href="https://linkedin.com/in/fabián-barriga-castellano-264015246" target="_blank" rel="noopener noreferrer" className="hover:text-dark/75 transition-colors">
                LinkedIn
              </a>
              <span>/</span>
              <a href="https://www.behance.net/antagonik-estudio" target="_blank" rel="noopener noreferrer" className="hover:text-dark/75 transition-colors">
                Behance
              </a>
              <span>/</span>
              <a href="https://instagram.com/antagonik" target="_blank" rel="noopener noreferrer" className="hover:text-dark/75 transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;