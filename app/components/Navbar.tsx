"use client";
import Link from "next/link";
import Image from "next/image";
import SlideTextOnHover from "./SlideTextOnHover";
import { useEffect, useState, useRef } from "react";
import MagneticButton from "./MagneticButton";
import { gsap } from "@/lib/gsapInit";
import { useGSAP } from "@gsap/react";
// 1. Imports para el enrutamiento
import { usePathname, useRouter } from 'next/navigation';

const Navbar = () => {
  // 2. Inicialización de los hooks de enrutamiento
  const pathname = usePathname();
  const router = useRouter();

  // Estados y refs existentes (sin cambios)
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuItemsRef = useRef<HTMLDivElement[]>([]);
  const borderTopRef = useRef<HTMLDivElement>(null);

  // Funciones existentes (sin cambios)
  const resetMenuItemsRef = () => { menuItemsRef.current = []; };
  const addToMenuItemsRef = (el: HTMLDivElement | null) => { if (el && !menuItemsRef.current.includes(el)) { menuItemsRef.current.push(el); } };

  // Efectos existentes (sin cambios)
  useEffect(() => { const interval = setInterval(() => { setIsActive((prev) => !prev); }, 700); return () => clearInterval(interval); }, []);
  useEffect(() => { function handleClickOutside(event: MouseEvent) { if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node) && isMenuOpen) { handleCloseMenu(); } } document.addEventListener("mousedown", handleClickOutside); return () => { document.removeEventListener("mousedown", handleClickOutside); }; }, [isMenuOpen]);
  useGSAP(() => { if (isMenuOpen) { if (borderTopRef.current) { gsap.set(borderTopRef.current, { scaleX: 0, transformOrigin: "left" }); gsap.to(borderTopRef.current, { scaleX: 1, duration: 0.6, ease: "power2.out", delay: 0.1 }); } if (menuItemsRef.current.length > 0) { gsap.set(menuItemsRef.current, { y: 40, opacity: 0 }); gsap.to(menuItemsRef.current, { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power3.out", delay: 0.4 }); } } }, { dependencies: [isMenuOpen], scope: mobileMenuRef });

  const handleOpenMenu = () => { resetMenuItemsRef(); setIsMenuOpen(true); setIsTransitioning(true); };
  const handleCloseMenu = () => { setIsMenuOpen(false); setTimeout(() => { setIsTransitioning(false); }, 500); };
  
  // 3. La función de navegación inteligente
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const sectionId = href.substring(2);

    if (pathname === '/') {
      scrollToSection(sectionId);
      // LA SOLUCIÓN: Actualiza la URL en la barra de direcciones sin recargar la página.
      window.history.pushState(null, '', href);
    } else {
      router.push(href);
    }

    // Cierra el menú móvil si está abierto
    if (isMenuOpen) {
      handleCloseMenu();
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full text-white px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 py-6 md:py-8 flex items-center justify-between z-50">
      <div className="flex items-center justify-between w-full gap-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="block -ml-1 md:-ml-2">
            <Image src="/images/logotipo.svg" alt="Logotipo de Antagonik" width={200} height={40} className="w-[160px] h-[32px] md:w-[200px] md:h-[40px] lg:w-[180px] lg:h-[36px] 2xl:w-[200px] 2xl:h-[40px]" priority/>
          </Link>
        </div>

        {/* Menú de navegación de escritorio */}
        <ul className="hidden lg:flex items-center justify-center font-archivo text-gray-600 lg:text-xs 2xl:text-sm lg:space-x-3 2xl:space-x-4">
          <li><a href="/#servicios" onClick={(e) => handleNavClick(e, '/#servicios')} className="font-regular inline-block group"><SlideTextOnHover originalText="SERVICIOS" hoverText="SERVICIOS" /></a></li>
          <span>/</span>
          <li><a href="/#proyectos" onClick={(e) => handleNavClick(e, '/#proyectos')} className="inline-block group"><SlideTextOnHover originalText="PROYECTOS" hoverText="PROYECTOS" /></a></li>
          <span>/</span>
          <li><a href="/#proceso" onClick={(e) => handleNavClick(e, '/#proceso')} className="inline-block group"><SlideTextOnHover originalText="PROCESO" hoverText="PROCESO" /></a></li>
          <span>/</span>
          <li><a href="/#vision" onClick={(e) => handleNavClick(e, '/#vision')} className="inline-block group"><SlideTextOnHover originalText="VISIÓN" hoverText="VISIÓN" /></a></li>
          <span>/</span>
          <li><Link href="/contacto" className="inline-block group"><SlideTextOnHover originalText="CONTACTO" hoverText="CONTACTO" /></Link></li>
        </ul>

        {/* Botones y WhatsApp */}
        <div className="flex items-center justify-end space-x-6">
          <div className="hidden lg:flex"><MagneticButton magneticStrength={0.5}><Link href="/calculadora" className="flex items-center bg-gray-300 text-dark px-4 py-2 rounded-full font-archivo font-regular text-gray-700 hover:bg-gray-100 transition-colors duration-300 group whitespace-nowrap lg:text-xs 2xl:text-sm"><SlideTextOnHover originalText="CALCULA TU PROYECTO" hoverText="CALCULA TU PROYECTO" className="text-dark"/></Link></MagneticButton></div>
          <div className="hidden lg:flex items-center"><a href="https://wa.me/message/6HLV5OAO5GMBO1" target="_blank" rel="noopener noreferrer" className="flex items-center text-gray-500 font-archivo font-regular text-gray-600 whitespace-nowrap lg:text-xs 2xl:text-sm"><span className={`transition-colors duration-300 ease-in-out ${isActive ? 'text-primary' : 'text-gray-700'} text-xl`}>•</span>{" "}<span className="ml-1 relative group">WSP (593) 9841 96542<span className="absolute left-0 bottom-0 w-full h-[1px] bg-gray-600 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span></span></a></div>
          {!isMenuOpen && !isTransitioning && (<button className="ml-4 lg:hidden flex flex-col justify-center items-center z-50" onClick={handleOpenMenu} aria-label="Menú"><svg viewBox="0 0 46.04 25.27" className="w-6 h-6 text-gray-300 fill-current" aria-hidden="true"><rect className="cls-1" x="0" y="0" width="46.04" height="3" /><rect className="cls-1" x="0" y="11.13" width="34.53" height="3" /><rect className="cls-1" x="0" y="22.27" width="23.02" height="3" /></svg></button>)}
        </div>
      </div>

      {/* Menú móvil */}
      <div ref={mobileMenuRef} className={`fixed top-0 right-0 w-full h-full bg-primary z-40 transform transition-transform duration-500 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"} lg:hidden flex flex-col justify-center items-center`}>
        <div className="flex flex-col justify-between h-full w-full px-5 py-6">
          <div ref={borderTopRef}>
            <div className="flex justify-between items-center w-full"><span className="font-archivo text-sm font-regular text-dark">MENU</span><button className="flex flex-col justify-center items-center z-50" onClick={handleCloseMenu} aria-label="Cerrar menú"><span className="block w-6 h-0.5 bg-dark mb-1.5 transform rotate-45"></span><span className="block w-6 h-0.5 bg-dark transform -rotate-45 -translate-y-2"></span></button></div>
            <ul className="flex flex-col items-start space-y-0 text-dark font-display font-semibold text-3xl mt-16 pt-4 border-t border-dark border-opacity-50">
              <li className="w-full text-left py-2 overflow-hidden"><div className="relative inline-flex items-center" ref={addToMenuItemsRef}><a href="/#servicios" onClick={(e) => handleNavClick(e, '/#servicios')} className="inline-block group"><SlideTextOnHover originalText="SERVICIOS" hoverText="SERVICIOS" className="text-dark" /></a><span className="text-sm font-medium text-dark ml-2 -translate-y-2">/01</span></div></li>
              <li className="w-full text-left py-2 overflow-hidden"><div className="relative inline-flex items-center" ref={addToMenuItemsRef}><a href="/#proyectos" onClick={(e) => handleNavClick(e, '/#proyectos')} className="inline-block group"><SlideTextOnHover originalText="PROYECTOS" hoverText="PROYECTOS" className="text-dark" /></a><span className="text-sm font-medium text-dark ml-2 -translate-y-2">/02</span></div></li>
              <li className="w-full text-left py-2 overflow-hidden"><div className="relative inline-flex items-center" ref={addToMenuItemsRef}><a href="/#proceso" onClick={(e) => handleNavClick(e, '/#proceso')} className="inline-block group"><SlideTextOnHover originalText="PROCESO" hoverText="PROCESO" className="text-dark" /></a><span className="text-sm font-medium text-dark ml-2 -translate-y-2">/03</span></div></li>
              <li className="w-full text-left py-2 overflow-hidden"><div className="relative inline-flex items-center" ref={addToMenuItemsRef}><a href="/#vision" onClick={(e) => handleNavClick(e, '/#vision')} className="inline-block group"><SlideTextOnHover originalText="VISIÓN" hoverText="VISIÓN" className="text-dark" /></a><span className="text-sm font-medium text-dark ml-2 -translate-y-2">/04</span></div></li>
              <li className="w-full text-left py-2 overflow-hidden"><div className="relative inline-flex items-center" ref={addToMenuItemsRef}><Link href="/contacto" onClick={handleCloseMenu} className="inline-block group"><SlideTextOnHover originalText="CONTACTO" hoverText="CONTACTO" className="text-dark" /></Link><span className="text-sm font-medium text-dark ml-2 -translate-y-2">/05</span></div></li>
            </ul>
          </div>
          <div className="flex-grow flex flex-col justify-center"><div className="w-full text-center" ref={addToMenuItemsRef}><Link href="/calculadora" onClick={handleCloseMenu} className="inline-block bg-black text-gray-400 font-archivo font-normal text-base px-8 py-4 rounded-full hover:bg-black/80 transition-colors" style={{ letterSpacing: '0.5px' }}>CALCULA TU PROYECTO</Link></div></div>
          <div className="flex flex-col font-archivo text-sm font-regular uppercase text-dark space-y-6 pt-2.5 border-t border-dark border-opacity-50">
            <div className="flex flex-col space-y-0.5"><a href="mailto:info@antagonik.com" className="hover:text-dark/75 transition-colors">info@antagonik.com</a><a href="https://wa.me/message/6HLV5OAO5GMBO1" target="_blank" rel="noopener noreferrer" className="hover:text-dark/75 transition-colors">[ 593 ] 98 419 6542</a></div>
            <div className="flex items-center space-x-2 text-dark"><a href="https://linkedin.com/in/fabián-barriga-castellano-264015246" target="_blank" rel="noopener noreferrer" className="hover:text-dark/75 transition-colors">LinkedIn</a><span>/</span><a href="https://www.behance.net/antagonik-estudio" target="_blank" rel="noopener noreferrer" className="hover:text-dark/75 transition-colors">Behance</a><span>/</span><a href="https://instagram.com/antagonik" target="_blank" rel="noopener noreferrer" className="hover:text-dark/75 transition-colors">Instagram</a></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;