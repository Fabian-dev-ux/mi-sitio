'use client';

import React, { useRef } from 'react';
import { gsap } from '@/lib/gsapInit';
import { useGSAP } from "@gsap/react";
import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaLinkedinIn, FaBehance } from 'react-icons/fa';
import SlideTextOnHover from './SlideTextOnHover';
import MagneticButton from './MagneticButton';
// 1. Imports para el enrutamiento
import { usePathname, useRouter } from 'next/navigation';

const Footer = () => {
  // 2. Inicialización de los hooks de enrutamiento
  const footerRef = useRef(null);
  const parallaxTargetRef = useRef(null);
  const pathname = usePathname();
  const router = useRouter();

  useGSAP(() => {
    const isMobile = window.innerWidth < 768;
    if (!isMobile) {
      const tl = gsap.timeline({ scrollTrigger: { trigger: footerRef.current, start: "top bottom", end: "bottom top", scrub: true } });
      tl.fromTo(parallaxTargetRef.current, { y: "-75%" }, { y: "75%", ease: "none" });
    }
  }, { scope: footerRef });

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
  };

  return (
    <footer ref={footerRef} className="bg-primary text-dark w-full relative z-0">
      <div className="pt-12 pb-8 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 w-full">
        <div ref={parallaxTargetRef} className="mx-auto w-full relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-black/30 pt-4 md:pt-32 lg:pt-16 xl:pt-24 2xl:pt-32 pb-0">
            <div className="md:col-span-4 md:col-start-9 order-first md:order-last pt-1">
              <div>
                <h2 className="font-display font-semibold text-dark text-4xl 2xl:text-5xl tracking-tight uppercase inline-block mb-4">LLEVEMOS TU PROYECTO AL SIGUIENTE NIVEL</h2>
                <MagneticButton magneticStrength={0.3} className="inline-block">
                  <Link href="/contacto" className="bg-gray-200 text-dark px-4 py-2 rounded-full hover:bg-gray-300 transition-colors inline-flex w-auto group font-archivo"><span className="relative overflow-hidden inline-block"><SlideTextOnHover originalText="CONTÁCTANOS" hoverText="CONTÁCTANOS" /></span></Link>
                </MagneticButton>
              </div>
            </div>
            <div className="md:col-span-3 border-t border-black/30 pt-4  order-2">
              <h3 className="text-sm font-normal uppercase font-archivo mb-6 text-gray-900">Contactos</h3>
              <div className="contact-container flex items-start mb-6">
                <div className="w-16 h-16 relative pt-2 hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:block xs:block"><Image src="/images/iso-logo.svg" alt="ISO Logo" fill className="object-contain"/></div>
                <div className="contact-info-social flex flex-col ml-0 md:ml-0 lg:ml-0 xl:ml-0 2xl:ml-8">
                  <div className="mb-2">
                    <p className="mb-0"><a href="mailto:INFO@ANTAGONIK.COM" className="uppercase text-base font-normal text-dark font-archivo relative inline-block group">INFO@ANTAGONIK.COM<span className="absolute left-0 bottom-0 w-full h-px bg-dark transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span></a></p>
                    <p className="mt-1"><a href="https://wa.me/message/6HLV5OAO5GMBO1" target="_blank" rel="noopener noreferrer" className="text-dark text-[1.188rem] font-archivo font-normal relative inline-block group">[ 593 ] 98 419 6542<span className="absolute left-0 bottom-0 w-full h-px bg-dark transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100"></span></a></p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href="https://linkedin.com/in/fabián-barriga-castellano-264015246" target="_blank" rel="noopener noreferrer" className="bg-dark w-7 h-7 flex items-center justify-center text-primary group" aria-label="LinkedIn"><div className="relative w-full h-full flex items-center justify-center"><SlideTextOnHover originalText={<FaLinkedinIn className="text-[0.9em]" />} hoverText={<FaLinkedinIn className="text-[0.9em]" />} /></div></Link>
                    <Link href="https://www.behance.net/antagonik-estudio" target="_blank" rel="noopener noreferrer" className="bg-dark w-7 h-7 flex items-center justify-center text-primary group" aria-label="Behance"><div className="relative w-full h-full flex items-center justify-center"><SlideTextOnHover originalText={<FaBehance className="text-[0.9em]" />} hoverText={<FaBehance className="text-[0.9em]" />} /></div></Link>
                    <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="bg-dark w-7 h-7 flex items-center justify-center text-primary group" aria-label="Instagram"><div className="relative w-full h-full flex items-center justify-center"><SlideTextOnHover originalText={<FaInstagram className="text-[0.9em]" />} hoverText={<FaInstagram className="text-[0.9em]" />} /></div></Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:col-span-3 border-t border-black/30 pt-4 pb-4 order-3">
              <h3 className="text-sm uppercase font-normal font-archivo mb-6 text-dark">Navegación</h3>
              <ul className="mb-0 font-archivo text-base uppercase">
                <li className="leading-tight mb-0"><a href="/#servicios" onClick={(e) => handleNavClick(e, '/#servicios')} className="inline-block group"><span className="relative overflow-hidden inline-block"><SlideTextOnHover originalText="/ SERVICIOS" hoverText="/ SERVICIOS" /></span></a></li>
                <li className="leading-tight mb-0"><a href="/#proyectos" onClick={(e) => handleNavClick(e, '/#proyectos')} className="inline-block group"><span className="relative overflow-hidden inline-block"><SlideTextOnHover originalText="/ PROYECTOS" hoverText="/ PROYECTOS" /></span></a></li>
                <li className="leading-tight mb-0"><a href="/#proceso" onClick={(e) => handleNavClick(e, '/#proceso')} className="inline-block group"><span className="relative overflow-hidden inline-block"><SlideTextOnHover originalText="/ PROCESO" hoverText="/ PROCESO" /></span></a></li>
                <li className="leading-tight mb-0.5"><a href="/#vision" onClick={(e) => handleNavClick(e, '/#vision')} className="inline-block group"><span className="relative overflow-hidden inline-block"><SlideTextOnHover originalText="/ VISIÓN" hoverText="/ VISIÓN" /></span></a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 items-start md:items-center text-xs md:text-sm uppercase font-archivo pt-4 border-t border-black/30">
          <div className="col-span-1 md:col-span-3"><p className="text-dark">© Antagonik 2025</p><Link href="/politica-de-privacidad" className="hover:underline text-dark block md:hidden mt-0.5">POLÍTICA DE PRIVACIDAD</Link></div>
          <div className="hidden md:block md:col-span-4"><Link href="/politica-de-privacidad" className="hover:underline text-dark">POLÍTICA DE PRIVACIDAD</Link></div>
          <div className="col-span-1 md:col-span-5 md:col-start-8 text-right"><Link href="#top" className="hover:underline text-dark inline-block text-right"><span className="block md:hidden">DISEÑO & DESARROLLO</span><span className="block md:hidden">/ FABIÁN B. C.</span><span className="hidden md:inline whitespace-nowrap">DISEÑO & DESARROLLO / FABIÁN B. C.</span></Link></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;