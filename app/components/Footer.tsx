'use client';

import React, { useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsapInit';
import { useGSAP } from "@gsap/react";
import Link from 'next/link';
import Image from 'next/image';
import { FaInstagram, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import SlideTextOnHover from './SlideTextOnHover';
import MagneticButton from './MagneticButton';

const Footer = () => {
  const footerRef = useRef(null);
  const parallaxTargetRef = useRef(null);

  useGSAP(() => {
    // Animación para el efecto Parallax aplicada solo al div específico mx-auto w-full
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: footerRef.current,
        start: "top bottom", 
        end: "bottom top", 
        scrub: true,
      },
    });

    // Movimiento en el eje Y aplicado sólo al div con classe mx-auto w-full
    tl.fromTo(
      parallaxTargetRef.current,
      { y: "-75%" }, 
      { y: "75%", ease: "none" }
    );
  }, { scope: footerRef }); // Scope para limitar la animación al footer

  return (
    <footer ref={footerRef} className="bg-primary text-dark w-full relative">
      {/* Contenido principal del footer - sin parallax */}
      <div className="pt-12 pb-8 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 w-full">
        {/* Top section with contact and navigation */}
        <div ref={parallaxTargetRef} className="mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 border-black/30 pt-8 md:pt-32 lg:pt-16 xl:pt-24 2xl:pt-32 pb-0">
            {/* CTA Section - Se muestra primero en móvil */}
            <div className="md:col-span-4 md:col-start-9 order-first md:order-last pt-1">
              <div>
                <h2 className="font-display font-semibold text-dark text-4xl 2xl:text-5xl tracking-tight uppercase inline-block mb-4">
                  ACTIVEMOS EL FUTURO VIRTUAL DE SU MARCA
                </h2>
                <MagneticButton
                  magneticStrength={0.3}
                  magneticArea={120}
                  className="inline-block"
                >
                  <Link
                    href="/contacto"
                    className="bg-gray-200 text-dark px-4 py-2 rounded-full hover:bg-gray-300 transition-colors inline-flex w-auto group font-archivo"
                  >
                    <span className="relative overflow-hidden inline-block">
                      <SlideTextOnHover originalText="CONTÁCTANOS" hoverText="CONTÁCTANOS" />
                    </span>
                  </Link>
                </MagneticButton>
              </div>
            </div>

            {/* Left column - Contact */}
            <div className="md:col-span-3 border-t border-black/30 pt-4 order-2">
              <h3 className="text-sm font-normal uppercase font-archivo mb-6 text-gray-900">Contactos</h3>
              <div className="contact-container flex items-start mb-6">
                {/* Logo - visible only on 2xl and mobile screens (hidden on md, lg, xl) */}
                <div className="w-16 h-16 relative pt-2 hidden sm:hidden md:hidden lg:hidden xl:hidden 2xl:block xs:block">
                  <Image
                    src="/images/iso-logo.svg"
                    alt="ISO Logo"
                    fill
                    className="object-contain"
                  />
                </div>

                {/* Contact info and Social media */}
                <div className="contact-info-social flex flex-col ml-0 md:ml-0 lg:ml-0 xl:ml-0 2xl:ml-8">
                  <div className="mb-2">
                    <p className="uppercase text-base font-normal text-dark font-archivo">INFO@ANTAGONIK.COM</p>
                    <p className="text-dark text-[1.188rem] font-archivo font-normal mt-1">[ 593 ] 98 419 6542</p>
                  </div>

                  {/* Social media icons */}
                  <div className="flex gap-2 mt-4">
                    {/* Instagram icon with SlideTextOnHover effect */}
                    <Link
                      href="https://instagram.com"
                      className="bg-dark w-7 h-7 flex items-center justify-center text-primary group"
                      aria-label="Instagram"
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <SlideTextOnHover
                          originalText={<FaInstagram className="text-[0.9em]" />}
                          hoverText={<FaInstagram className="text-[0.9em]" />}
                        />
                      </div>
                    </Link>
                    
                    {/* Facebook icon with SlideTextOnHover effect */}
                    <Link
                      href="https://facebook.com"
                      className="bg-dark w-7 h-7 flex items-center justify-center text-primary group"
                      aria-label="Facebook"
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <SlideTextOnHover
                          originalText={<FaFacebookF className="text-[0.8em]" />}
                          hoverText={<FaFacebookF className="text-[0.8em]" />}
                        />
                      </div>
                    </Link>
                    
                    {/* LinkedIn icon with SlideTextOnHover effect */}
                    <Link
                      href="https://linkedin.com"
                      className="bg-dark w-7 h-7 flex items-center justify-center text-primary group"
                      aria-label="LinkedIn"
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <SlideTextOnHover
                          originalText={<FaLinkedinIn className="text-[0.9em]" />}
                          hoverText={<FaLinkedinIn className="text-[0.9em]" />}
                        />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle column - Navigation */}
            <div className="md:col-span-3 border-t border-black/30 pt-4 order-3">
              <h3 className="text-sm uppercase font-normal font-archivo mb-6 text-dark">Navegación</h3>
              <ul className="mb-0 font-archivo text-base uppercase">
                <li className="leading-tight mb-0">
                  <Link href="/" className="inline-block group">
                    <span className="relative overflow-hidden inline-block">
                      <SlideTextOnHover originalText="/ INICIO" hoverText="/ INICIO" />
                    </span>
                  </Link>
                </li>
                <li className="leading-tight mb-0">
                  <Link href="/services" className="inline-block group">
                    <span className="relative overflow-hidden inline-block">
                      <SlideTextOnHover originalText="/ SERVICIOS" hoverText="/ SERVICIOS" />
                    </span>
                  </Link>
                </li>
                <li className="leading-tight mb-0">
                  <Link href="/proyectos" className="inline-block group">
                    <span className="relative overflow-hidden inline-block">
                      <SlideTextOnHover originalText="/ PROYECTOS" hoverText="/ PROYECTOS" />
                    </span>
                  </Link>
                </li>
                <li className="leading-tight mb-0">
                  <Link href="/aproach" className="inline-block group">
                    <span className="relative overflow-hidden inline-block">
                      <SlideTextOnHover originalText="/ PROCESO" hoverText="/ PROCESO" />
                    </span>
                  </Link>
                </li>
                <li className="leading-tight mb-0.5">
                  <Link href="/perspective" className="inline-block group">
                    <span className="relative overflow-hidden inline-block">
                      <SlideTextOnHover originalText="/ PERSPECTIVA" hoverText="/ PERSPECTIVA" />
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section with copyright and privacy - fuera del div con parallax */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 items-start md:items-center text-xs md:text-sm uppercase font-archivo pt-4 border-t border-black/30">
          {/* Mobile: primera columna con copyright y política en 2 líneas */}
          {/* Desktop: mantiene posición original del copyright */}
          <div className="col-span-1 md:col-span-3">
            <p className="text-dark">© Antagonik 2025</p>
            <Link href="/politica-de-privacidad" className="hover:underline text-dark block md:hidden mt-0.5">POLÍTICA DE PRIVACIDAD</Link>
          </div>
          
          {/* Solo visible en desktop: política de privacidad en su posición original */}
          <div className="hidden md:block md:col-span-4">
            <Link href="/politica-de-privacidad" className="hover:underline text-dark">POLÍTICA DE PRIVACIDAD</Link>
          </div>
          
          {/* Mobile: segunda columna con créditos en 2 líneas */}
          {/* Desktop: ocupa desde la columna 8 hasta la 12 para evitar que se rompa */}
          <div className="col-span-1 md:col-span-5 md:col-start-8 text-right">
            <Link href="#top" className="hover:underline text-dark inline-block text-right">
              <span className="block md:hidden">DISEÑO & DESARROLLO</span>
              <span className="block md:hidden">/ FABIÁN B. C.</span>
              <span className="hidden md:inline whitespace-nowrap">DISEÑO & DESARROLLO / FABIÁN B. C.</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;