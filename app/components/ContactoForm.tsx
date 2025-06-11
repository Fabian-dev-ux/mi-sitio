"use client";

import React, { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsapInit";
import Link from "next/link"; // Agregamos la importación de Link
import ArrowAni from "./ArrowAni";
import SlideTextOnHover from "./SlideTextOnHover";

const ContactoForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    mensaje: "",
    intereses: [] as string[]
  });

  const titleContainerRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const titleText = "LOREM IPSUM LOREM IPSUM DOLOR SIT AMET, CONSECTETUER ADIPISCING LOREM IPSUM DOLOR SIT";

  // Set up animations using useGSAP
  useGSAP(() => {
    if (!titleContainerRef.current || !formContainerRef.current) return;

    // Animación de palabras en el título
    const words = titleContainerRef.current.querySelectorAll('.animated-word');
    gsap.set(words, {
      y: "100%",
      opacity: 0
    });

    gsap.to(words, {
      y: "0%",
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.03, // Pequeño stagger para una animación más natural
      scrollTrigger: {
        trigger: titleContainerRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse"
      }
    });

    // Animar los bordes de la columna izquierda
    if (leftColumnRef.current) {
      const leftBorders = leftColumnRef.current.querySelectorAll('.border-element');
      gsap.set(leftBorders, { 
        scaleX: (i, el) => el.classList.contains('border-top') || el.classList.contains('border-bottom') ? 0 : 1,
        scaleY: (i, el) => el.classList.contains('border-left') || el.classList.contains('border-right') ? 0 : 1,
        opacity: 0, 
        transformOrigin: "center" 
      });

      // Animar la información de contacto
      const contactInfoBlocks = leftColumnRef.current.querySelectorAll<HTMLElement>('.contact-info > div');
      gsap.set(contactInfoBlocks, { y: 20, opacity: 0 });

      ScrollTrigger.create({
        trigger: leftColumnRef.current,
        start: "top 70%",
        onEnter: () => {
          // Animar los bordes
          gsap.to(leftBorders, { 
            scaleX: (i, el) => el.classList.contains('border-top') || el.classList.contains('border-bottom') ? 0.98 : 1,
            scaleY: (i, el) => el.classList.contains('border-left') || el.classList.contains('border-right') ? 0.95 : 1,
            opacity: 1, 
            duration: 0.6, 
            ease: "power2.out",
            stagger: 0.1
          });

          // Animar la información de contacto
          gsap.to(contactInfoBlocks, {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            delay: 0.3,
            ease: "power2.out"
          });
        },
        onLeaveBack: () => {
          // Revertir animaciones cuando se sale del viewport
          gsap.to(leftBorders, { 
            scaleX: (i, el) => el.classList.contains('border-top') || el.classList.contains('border-bottom') ? 0 : 1,
            scaleY: (i, el) => el.classList.contains('border-left') || el.classList.contains('border-right') ? 0 : 1,
            opacity: 0, 
            duration: 0.4 
          });
          gsap.to(contactInfoBlocks, { y: 20, opacity: 0, duration: 0.4 });
        }
      });
    }

    // Animar los bordes de la columna derecha
    if (rightColumnRef.current) {
      const rightBorders = rightColumnRef.current.querySelectorAll('.border-element');
      gsap.set(rightBorders, { 
        scaleX: (i, el) => el.classList.contains('border-top') || el.classList.contains('border-bottom') ? 0 : 1,
        scaleY: (i, el) => el.classList.contains('border-left') || el.classList.contains('border-right') ? 0 : 1,
        opacity: 0, 
        transformOrigin: "center" 
      });

      // Animar los campos del formulario
      const formFields = rightColumnRef.current.querySelectorAll<HTMLElement>('input, textarea, button, .interest-button');
      gsap.set(formFields, { y: 20, opacity: 0 });

      ScrollTrigger.create({
        trigger: rightColumnRef.current,
        start: "top 70%",
        onEnter: () => {
          // Animar los bordes
          gsap.to(rightBorders, { 
            scaleX: (i, el) => el.classList.contains('border-top') || el.classList.contains('border-bottom') ? 0.98 : 1,
            scaleY: (i, el) => el.classList.contains('border-left') || el.classList.contains('border-right') ? 0.95 : 1,
            opacity: 1, 
            duration: 0.6, 
            ease: "power2.out",
            stagger: 0.1
          });

          // Animar campos del formulario
          gsap.to(formFields, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.05,
            delay: 0.5,
            ease: "power2.out"
          });
        },
        onLeaveBack: () => {
          // Revertir animaciones cuando se sale del viewport
          gsap.to(rightBorders, { 
            scaleX: (i, el) => el.classList.contains('border-top') || el.classList.contains('border-bottom') ? 0 : 1,
            scaleY: (i, el) => el.classList.contains('border-left') || el.classList.contains('border-right') ? 0 : 1,
            opacity: 0, 
            duration: 0.4 
          });
          gsap.to(formFields, { y: 20, opacity: 0, duration: 0.4 });
        }
      });
    }

  }, { 
    scope: formContainerRef,
    dependencies: [], 
    revertOnUpdate: true
  });

  // Efecto para manejar la navegación y visibilidad de la página
  useEffect(() => {
    // Función para reinicializar animaciones
    const reinitializeAnimations = () => {
      ScrollTrigger.refresh();
    };
    
    // Eventos para detectar cambios de visibilidad
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        reinitializeAnimations();
      }
    };
    
    // Para manejar navegación Next.js
    const handlePageShow = () => {
      reinitializeAnimations();
    };

    // Registrar eventos
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', reinitializeAnimations);

    return () => {
      // Limpiar todos los eventos
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', reinitializeAnimations);
      
      // Matar todos los ScrollTriggers asociados a este componente
      if (formContainerRef.current) {
        ScrollTrigger.getAll().forEach(trigger => {
          if (trigger.vars.trigger === formContainerRef.current || 
              (trigger.vars.trigger instanceof Element && 
               trigger.vars.trigger.closest('#contacto-form'))) {
            trigger.kill();
          }
        });
      }
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleInterestToggle = (interest: string) => {
    setFormData({
      ...formData,
      intereses: formData.intereses.includes(interest)
        ? formData.intereses.filter(i => i !== interest)
        : [...formData.intereses, interest]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  // Split the title text into individual words for animation
  const animatedWords = titleText.split(' ').map((word, index) => (
    <span
      key={index}
      className="inline-block overflow-hidden mr-2.5" // Reducido de mr-2 a mr-1 para disminuir el espacio entre palabras
    >
      <span
        className="animated-word inline-block"
        style={{ 
          willChange: "transform, opacity",
          letterSpacing: "-0.00em", // Reduce el espacio entre letras
        }}
      >
        {word}
      </span>
    </span>
  ));

  return (
    <div className="bg-dark text-gray-700 font-archivo pb-6 pt-32 2xl:pt-44 px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20 w-full flex flex-col justify-end 2xl:h-screen 2xl:min-h-screen" id="contacto-form">
      {/* Contenedor del grid sin bordes - ajustado para ajustarse a su contenido */}
      <div 
        ref={formContainerRef}
        className="w-full mx-auto grid grid-cols-1 lg:grid-cols-2 pb-2 md:pb-6 relative overflow-visible"
      >
        {/* Right Column - Form - Ahora primero en móvil */}
        <div 
          ref={rightColumnRef}
          className="flex flex-col justify-center relative p-6 md:p-10 order-1 lg:order-2"
        >
          {/* Elementos de borde para la columna derecha */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="border-element border-top absolute top-0 left-0 right-0 h-[0.25px] bg-gray-800 transform-gpu origin-center"></div>
            <div className="border-element border-bottom absolute bottom-0 left-0 right-0 h-[0.25px] bg-gray-800 transform-gpu origin-center"></div>
            <div className="border-element border-left absolute top-0 left-0 bottom-0 w-[0.25px] bg-gray-800 transform-gpu origin-center"></div>
            <div className="border-element border-right absolute top-0 right-0 bottom-0 w-[0.25px] bg-gray-800 transform-gpu origin-center"></div>
          </div>

          <div className="mb-2">
            {/* Animated title - Estilos actualizados para reducir el espacio */}
            <div
              ref={titleContainerRef}
              className="mb-8 md:mb-12 font-display text-gray-400 text-2xl md:text-4xl font-medium leading-none max-w-3xl"
              style={{ 
                lineHeight: "1", // Reduce el espacio entre líneas
                wordSpacing: "-0.5em", // Reduce el espacio entre palabras a nivel global
              }}
            >
              {animatedWords}
            </div>
            <p className="mb-3 text-gray-400 text-base font-archivo">Estoy interesado en...</p>
          </div>

          {/* Interest buttons */}
          <div className="flex flex-wrap gap-0 mb-10 md:mb-16">
            {["UI", "UX", "Multimedia", "Webflow"].map((interest, index) => (
              <button
                key={index}
                onClick={() => handleInterestToggle(interest)}
                className={`interest-button text-sm px-4 py-1 rounded-full border font-archivo transition-colors duration-300 ${formData.intereses.includes(interest)
                    ? "bg-primary text-dark border-primary"
                    : "bg-transparent text-gray-600 border-gray-800 hover:border-gray-700"
                  }`}
              >
                {interest}
              </button>
            ))}
          </div>

          {/* Form container */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="NOMBRE*"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-400 focus:outline-none focus:border-gray-400 placeholder-gray-700 text-sm font-archivo transition-colors duration-300"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="EMAIL*"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-400 focus:outline-none focus:border-gray-400 placeholder-gray-700 text-sm font-archivo transition-colors duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    placeholder="TELEFONO*"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-400 focus:outline-none focus:border-gray-400 placeholder-gray-700 text-sm font-archivo transition-colors duration-300"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    id="empresa"
                    name="empresa"
                    placeholder="EMPRESA"
                    value={formData.empresa}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-400 focus:outline-none focus:border-gray-400 placeholder-gray-700 text-sm font-archivo transition-colors duration-300"
                  />
                </div>
              </div>

              <div>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  placeholder="MENSAJE"
                  value={formData.mensaje}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-400 focus:outline-none focus:border-gray-400 placeholder-gray-700 text-sm font-archivo transition-colors duration-300"
                />
              </div>

              <div className="flex flex-wrap gap-6 justify-start items-center pt-1">
                <button
                  type="submit"
                  className="bg-white text-black px-8 py-2 rounded-full hover:bg-gray-200 transition-colors font-archivo"
                >
                  ENVIAR
                </button>

                <p className="text-[0.7rem] text-gray-700 uppercase font-archivo max-w-[300px] leading-[1rem]">
                  * Al enviar este formulario, usted acepta nuestra{" "}
                  <Link href="/politica-de-privacidad" className="text-gray-600 hover:text-gray-500 transition-colors">
                    política de privacidad
                  </Link>.
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Left Column - Contact Info - Ahora segundo en móvil */}
        <div 
          ref={leftColumnRef}
          className="flex flex-col justify-between lg:justify-start relative p-6 pt-48 md:p-10 order-2 lg:order-1 h-full"
        >
          {/* Elementos de borde para la columna izquierda */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="border-element border-top absolute top-0 left-0 right-0 h-[0.25px] bg-gray-800 transform-gpu origin-center"></div>
            <div className="border-element border-bottom absolute bottom-0 left-0 right-0 h-[0.25px] bg-gray-800 transform-gpu origin-center"></div>
            <div className="border-element border-left absolute top-0 left-0 bottom-0 w-[0.25px] bg-gray-800 transform-gpu origin-center"></div>
            <div className="border-element border-right absolute top-0 right-0 bottom-0 w-[0.25px] bg-gray-800 transform-gpu origin-center"></div>
          </div>

          {/* Arrow component - visible en todos los breakpoints, ahora en la esquina superior izquierda en móvil */}
          <div className="block absolute top-1 right-0 lg:bottom-0 lg:right-0 lg:top-auto lg:left-auto w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96">
            <ArrowAni />
          </div>

          {/* Contenedor de información de contacto - alineado al pie en móvil, alineado arriba en desktop */}
          <div className="space-y-6 md:space-y-8 font-archivo text-gray-400 contact-info mt-auto lg:mt-0">
            <div>
              <p className="text-sm uppercase text-gray-600 mb-1">UBICACION</p>
              <p className="text-sm">24 DE LA THAN STREET,</p>
              <p className="text-sm">DONG DA</p>
            </div>

            <div className="flex items-center">
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            </div>

            <div>
              <p className="text-sm uppercase text-gray-600 mb-1">CONTACTOS</p>
              <div className="group cursor-pointer">
                <SlideTextOnHover 
                  originalText={<p className="text-sm">INFO@ANTAGONIK.COM</p>}
                  hoverText={<p className="text-sm text-white">ESCRÍBENOS</p>}
                />
              </div>
              <div className="group cursor-pointer">
                <SlideTextOnHover 
                  originalText={<p className="text-sm">[593] 98 419 6542</p>}
                  hoverText={<p className="text-sm text-white">LLÁMANOS</p>}
                />
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
            </div>

            <div>
              <p className="text-sm uppercase text-gray-600 mb-1">SIGUENOS</p>
              <div className="group cursor-pointer">
                <SlideTextOnHover 
                  originalText={<p className="text-sm">/ INSTAGRAM</p>}
                  hoverText={<p className="text-sm text-white">/ INSTAGRAM</p>}
                />
              </div>
              <div className="group cursor-pointer">
                <SlideTextOnHover 
                  originalText={<p className="text-sm">/ BEHANCE</p>}
                  hoverText={<p className="text-sm text-white">/ BEHANCE</p>}
                />
              </div>
              <div className="group cursor-pointer">
                <SlideTextOnHover 
                  originalText={<p className="text-sm">/ LINKEDIN</p>}
                  hoverText={<p className="text-sm text-white">/ LINKEDIN</p>}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mx-auto mt-4 md:mt-8 flex justify-between items-center text-xs text-gray-700 font-archivo">
        {/* Contenedores para móvil - en una sola fila con un grupo a la izquierda y otro a la derecha */}
        <div className="md:hidden flex flex-col">
          <p className="mb-0.5">© ANTAGONIK 2025</p>
          <Link href="/politica-de-privacidad" className="hover:underline text-gray-700">
            POLÍTICA DE PRIVACIDAD
          </Link>
        </div>
        
        <div className="md:hidden flex justify-end">
          <p className="text-right">
            DISEÑO & DESARROLLO<br />
            / FABIÁN B. C.
          </p>
        </div>
        
        {/* Elementos para desktop (md en adelante) - mantiene la maquetación original */}
        <p className="hidden md:block">© ANTAGONIK 2025</p>
        <Link href="/politica-de-privacidad" className="hidden md:block hover:underline text-gray-700">
          POLÍTICA DE PRIVACIDAD
        </Link>
        <p className="hidden md:block">DISEÑO & DESARROLLO / FABIÁN B. C.</p>
      </div>
    </div>
  );
};

export default ContactoForm;