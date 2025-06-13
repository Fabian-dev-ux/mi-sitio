"use client";

import React, { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsapInit";
import Link from "next/link";
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

  // Estados para manejar el envío del formulario
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const titleContainerRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const rightColumnRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const titleText = "Convirtamos tus ideas en algo que nadie pueda ignorar";

  // Opciones de intereses actualizadas
  const interestOptions = [
    "Diseño Web",
    "Desarrollo Web", 
    "UI/UX",
    "Diseño Gráfico",
    "Branding",
    "Content Management",
    "E-commerce",
    "Multimedia",
    "Social Media Ads"
  ];

  // Set up animations using useGSAP - Solo mantener animaciones de formulario si las necesitas
  useGSAP(() => {
    // Eliminadas todas las animaciones de texto y bordes
    // Solo mantener limpieza de ScrollTriggers si es necesario
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

  // Efecto para limpiar el mensaje de estado después de 5 segundos
  useEffect(() => {
    if (submitStatus !== 'idle') {
      const timer = setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      console.log('🚀 Enviando formulario con Web3Forms...');

      // Validar campos requeridos
      if (!formData.nombre.trim()) {
        throw new Error('El nombre es requerido');
      }
      if (!formData.email.trim()) {
        throw new Error('El email es requerido');
      }
      if (!formData.telefono.trim()) {
        throw new Error('El teléfono es requerido');
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Por favor, ingresa un email válido');
      }

      console.log('✅ Validaciones pasadas');

      // ========== PASO 1: ENVIAR FORMULARIO PRINCIPAL (a ti) ==========
      const mainFormData = new FormData();

      // Tu access key principal
      mainFormData.append('access_key', 'fb4f1bec-402f-4c42-b379-33dd7fe9e5c0');

      // Campos del formulario
      mainFormData.append('name', formData.nombre.trim());
      mainFormData.append('email', formData.email.trim().toLowerCase());
      mainFormData.append('phone', formData.telefono.trim());
      mainFormData.append('company', formData.empresa.trim() || 'No especificada');
      mainFormData.append('message', formData.mensaje.trim() || 'Sin mensaje adicional');
      mainFormData.append('interests', formData.intereses.length > 0 ? formData.intereses.join(', ') : 'No especificados');

      // Configuración del email principal
      mainFormData.append('subject', 'Nuevo contacto desde Antagonik Studio');
      mainFormData.append('from_name', 'Antagonik Studio - Formulario de Contacto');

      // NO incluir autoresponse aquí
      mainFormData.append('autoresponse', 'false');

      console.log('📤 Enviando formulario principal...');

      // Enviar formulario principal
      const mainResponse = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: mainFormData
      });

      const mainResult = await mainResponse.json();

      if (!mainResponse.ok || !mainResult.success) {
        throw new Error(mainResult.message || `Error ${mainResponse.status} en envío principal`);
      }

      console.log('✅ Formulario principal enviado correctamente');

      // ========== PASO 2: ENVIAR EMAIL DE CONFIRMACIÓN (al usuario) ==========

      // Preparar mensaje de confirmación
      const confirmationMessage = `
Hola ${formData.nombre},

¡Gracias por contactarnos! Hemos recibido tu mensaje correctamente.

RESUMEN DE TU SOLICITUD:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nombre: ${formData.nombre}
Email: ${formData.email}
Teléfono: ${formData.telefono}
Empresa: ${formData.empresa || 'No especificada'}
Intereses: ${formData.intereses.length > 0 ? formData.intereses.join(', ') : 'No especificados'}

Mensaje:
${formData.mensaje || 'Sin mensaje adicional'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nuestro equipo revisará tu solicitud y se pondrá en contacto contigo en un plazo de 24-48 horas.

Si tienes alguna pregunta urgente, no dudes en contactarnos directamente:
📧 antagonik.studio@gmail.com
📱 [593] 98 419 6542

¡Gracias por tu interés en Antagonik Studio!

Saludos,
El equipo de Antagonik Studio

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ANTAGONIK STUDIO
24 DE LA THAN STREET, DONG DA

🌐 Instagram: @antagonik.studio
💼 LinkedIn: Antagonik Studio
🎨 Behance: Antagonik Studio

© 2025 Antagonik Studio. Todos los derechos reservados.
    `.trim();

      const confirmationFormData = new FormData();

      // Access key separado para confirmaciones (crea uno nuevo en Web3Forms)
      // REEMPLAZA con tu segundo access key cuando lo tengas
      confirmationFormData.append('access_key', 'TU_SEGUNDO_ACCESS_KEY_AQUI');

      // Email de destino (el usuario)
      confirmationFormData.append('email', formData.email.trim().toLowerCase());
      confirmationFormData.append('name', formData.nombre.trim());

      // Configuración del email de confirmación
      confirmationFormData.append('subject', 'Confirmación de contacto - Antagonik Studio');
      confirmationFormData.append('message', confirmationMessage);
      confirmationFormData.append('from_name', 'Antagonik Studio');

      // Cambiar el destinatario - IMPORTANTE: el email va al usuario
      confirmationFormData.append('to', formData.email.trim().toLowerCase());

      console.log('📧 Enviando email de confirmación...');

      // Enviar email de confirmación
      const confirmationResponse = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: confirmationFormData
      });

      const confirmationResult = await confirmationResponse.json();

      if (!confirmationResponse.ok || !confirmationResult.success) {
        // Si falla la confirmación, solo logueamos el error pero no fallamos todo el proceso
        console.warn('⚠️ Error enviando confirmación:', confirmationResult.message);
        console.log('✅ Formulario principal enviado, pero falló confirmación al usuario');
      } else {
        console.log('✅ Email de confirmación enviado correctamente');
      }

      // ÉXITO - Limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        empresa: "",
        mensaje: "",
        intereses: []
      });

      setSubmitStatus('success');
      setSubmitMessage('¡Mensaje enviado con éxito! Te contactaremos pronto. También recibirás un email de confirmación por separado.');

      console.log('🎉 Proceso completado exitosamente');

    } catch (error: any) {
      console.error('🚨 ERROR:', error);

      let errorMessage = 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.';

      if (error?.message) {
        errorMessage = error.message;
      }

      setSubmitStatus('error');
      setSubmitMessage(errorMessage);

    } finally {
      setIsSubmitting(false);
    }
  };

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
          {/* Elementos de borde para la columna derecha - Ahora visibles sin animación */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* Borde superior - con gap en los extremos */}
            <div className="absolute top-0 left-4 right-4 h-[0.25px] bg-gray-800"></div>

            {/* Borde inferior - con gap en los extremos */}
            <div className="absolute bottom-0 left-4 right-4 h-[0.25px] bg-gray-800"></div>

            {/* Borde izquierdo - con gap en los extremos */}
            <div className="absolute top-4 bottom-4 left-0 w-[0.25px] bg-gray-800"></div>

            {/* Borde derecho - con gap en los extremos */}
            <div className="absolute top-4 bottom-4 right-0 w-[0.25px] bg-gray-800"></div>
          </div>
          <div className="mb-2">
            {/* Título sin animación */}
            <div
              ref={titleContainerRef}
              className="mb-8 md:mb-12 font-display uppercase text-gray-500 text-3xl md:text-5xl font-semibold leading-none max-w-2xl"
              style={{
                lineHeight: "1.05",
              }}
            >
              {titleText}
            </div>
            <p className="mb-3 text-gray-400 text-base font-archivo">Estoy interesado en...</p>
          </div>

          {/* Interest buttons - Flex wrap sin gap horizontal, limitado en 2xl */}
          <div className="flex flex-wrap gap-y-2 mb-10 md:mb-16 2xl:max-w-2xl">
            {interestOptions.map((interest, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleInterestToggle(interest)}
                disabled={isSubmitting}
                className={`text-sm px-4 py-1 rounded-full border font-archivo transition-colors duration-300 ${
                  formData.intereses.includes(interest)
                    ? "bg-primary text-dark border-primary"
                    : "bg-transparent text-gray-600 border-gray-800 hover:border-gray-700"
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {interest}
              </button>
            ))}
          </div>

          {/* Mensaje de estado */}
          {submitStatus !== 'idle' && (
            <div className={`mb-6 p-4 rounded-lg border ${submitStatus === 'success'
                ? 'bg-green-900/20 border-green-600 text-green-400'
                : 'bg-red-900/20 border-red-600 text-red-400'
              }`}>
              <p className="text-sm font-archivo">{submitMessage}</p>
            </div>
          )}

          {/* Form container */}
          <div>
            {/* Formulario principal */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-6 md:space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    placeholder="NOMBRE*"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    required
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-400 focus:outline-none focus:border-gray-400 placeholder-gray-700 text-sm font-archivo transition-colors duration-300 disabled:opacity-50"
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
                    disabled={isSubmitting}
                    required
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-400 focus:outline-none focus:border-gray-400 placeholder-gray-700 text-sm font-archivo transition-colors duration-300 disabled:opacity-50"
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
                    disabled={isSubmitting}
                    required
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-400 focus:outline-none focus:border-gray-400 placeholder-gray-700 text-sm font-archivo transition-colors duration-300 disabled:opacity-50"
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
                    disabled={isSubmitting}
                    className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-400 focus:outline-none focus:border-gray-400 placeholder-gray-700 text-sm font-archivo transition-colors duration-300 disabled:opacity-50"
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
                  disabled={isSubmitting}
                  rows={4}
                  className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-400 focus:outline-none focus:border-gray-400 placeholder-gray-700 text-sm font-archivo transition-colors duration-300 disabled:opacity-50"
                />
              </div>

              <div className="flex flex-wrap gap-6 justify-start items-center pt-1">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-black px-8 py-2 rounded-full hover:bg-gray-200 transition-colors font-archivo disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                      ENVIANDO...
                    </>
                  ) : (
                    'ENVIAR'
                  )}
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
          {/* Elementos de borde para la columna izquierda - Ahora visibles sin animación */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* Borde superior - con gap en los extremos */}
            <div className="absolute top-0 left-4 right-4 h-[0.25px] bg-gray-800"></div>

            {/* Borde inferior - con gap en los extremos */}
            <div className="absolute bottom-0 left-4 right-4 h-[0.25px] bg-gray-800"></div>

            {/* Borde izquierdo - con gap en los extremos */}
            <div className="absolute top-4 bottom-4 left-0 w-[0.25px] bg-gray-800"></div>

            {/* Borde derecho - con gap en los extremos */}
            <div className="absolute top-4 bottom-4 right-0 w-[0.25px] bg-gray-800"></div>
          </div>

          {/* Arrow component */}
          <div className="block absolute top-1 right-0 lg:bottom-0 lg:right-0 lg:top-auto lg:left-auto w-48 sm:w-64 md:w-96 h-48 sm:h-64 md:h-96">
            <ArrowAni />
          </div>

          {/* Contenedor de información de contacto - Sin animación */}
          <div className="space-y-6 md:space-y-8 font-archivo text-gray-400 mt-auto lg:mt-0">
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
                  originalText={<p className="text-sm">ANTAGONIK.STUDIO@GMAIL.COM</p>}
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
        {/* Contenedores para móvil */}
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

        {/* Elementos para desktop */}
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