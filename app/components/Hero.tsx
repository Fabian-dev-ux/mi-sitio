"use client";
import { FaInstagram, FaFacebookF, FaBehance } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroBackground from './HeroBackground';
import SlideTextOnHover from './SlideTextOnHover';
import Image from 'next/image';

// RotatingArrow component with inline SVG - fixed version
const RotatingArrow = ({ isHovering, isGroupHovering }: { isHovering: boolean, isGroupHovering?: boolean }) => {
  // Define el color personalizado aquí
  const customColor = isGroupHovering ? "#000000" : "#FF5741"; // Cambia a color dark al hacer hover

  return (
    <div
      className="relative inline-block"
      style={{
        width: "12px",
        height: "12px"
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 13.28 13.28"
        className="w-full h-full transition-all duration-300 ease-in-out"
        style={{
          transform: isHovering ? 'rotate(45deg)' : 'rotate(0deg)',
          transformOrigin: 'center',
          fill: customColor
        }}
      >
        <polygon points=".53 0 .53 1.5 10.72 1.5 0 12.22 1.06 13.28 11.78 2.56 11.78 12.75 13.28 12.75 13.28 0 .53 0" />
      </svg>
    </div>
  );
};

// SocialIcon component with hover effect and gray background - no animation on mobile
const SocialIcon = ({ icon, hoverIcon, link = "#" }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if on mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    // Static version for mobile
    return (
      <a
        href={link}
        className="bg-gray-900 w-6 h-6 flex items-center justify-center"
      >
        <div className="w-full h-full flex items-center justify-center">
          {icon || <FaInstagram className="text-[0.9em] text-gray-700" />}
        </div>
      </a>
    );
  }

  // Animated version for desktop
  return (
    <a
      href={link}
      className="bg-gray-900 w-6 h-6 flex items-center justify-center group"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <SlideTextOnHover
          originalText={icon || <FaInstagram className="text-[0.9em] text-gray-600" />}
          hoverText={hoverIcon || <FaInstagram className="text-[0.9em] text-white" />}
        />
      </div>
    </a>
  );
};

// ScrollText component with hover effect on desktop only
const ScrollText = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if on mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Function to scroll to VideoReel section
  const scrollToVideoReel = () => {
    const videoReelSection = document.getElementById('VideoReel');
    if (videoReelSection) {
      videoReelSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  if (isMobile) {
    // Static version for mobile with click handler
    return (
      <span 
        className="text-gray-700 font-display text-xs md:text-sm uppercase tracking-wide font-body cursor-pointer"
        onClick={scrollToVideoReel}
      >
        [ SCROLL ]
      </span>
    );
  }

  // Animated version for desktop with click handler
  return (
    <div className="group cursor-pointer" onClick={scrollToVideoReel}>
      <SlideTextOnHover
        originalText={<span className="text-gray-700 font-archivo text-xs md:text-sm uppercase tracking-wide font-body">Scroll</span>}
        hoverText={<span className="text-gray-700 text-xs md:text-sm uppercase font-archivo tracking-wide font-body">Scroll</span>}
      />
    </div>
  );
};

// Componente de borde estático sin animación
const StaticBorder = () => {
  // Modifica estos valores para ajustar la escala/tamaño de los bordes
  const borderGap = 8; // Espacio desde la esquina
  const borderThickness = 0.7; // Grosor de los bordes en píxeles
  const borderColor = '#2D3036';

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Borde superior */}
      <div
        className="absolute top-0"
        style={{
          left: `${borderGap}px`,
          right: `${borderGap}px`,
          height: `${borderThickness}px`,
          backgroundColor: borderColor
        }}
      />
      {/* Borde inferior */}
      <div
        className="absolute bottom-0"
        style={{
          left: `${borderGap}px`,
          right: `${borderGap}px`,
          height: `${borderThickness}px`,
          backgroundColor: borderColor
        }}
      />
      {/* Borde izquierdo */}
      <div
        className="absolute left-0"
        style={{
          top: `${borderGap}px`,
          bottom: `${borderGap}px`,
          width: `${borderThickness}px`,
          backgroundColor: borderColor
        }}
      />
      {/* Borde derecho */}
      <div
        className="absolute right-0"
        style={{
          top: `${borderGap}px`,
          bottom: `${borderGap}px`,
          width: `${borderThickness}px`,
          backgroundColor: borderColor
        }}
      />
    </div>
  );
};

const Hero = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check device type and window dimensions
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768);

      // Específicamente verificar para iPad Pro y dispositivos similares
      // iPad Pro en vertical: ~1024x1366
      setIsTablet(width >= 1024 && width <= 1112 && height > 1000);
    };

    // Initial check
    checkDeviceType();

    // Add resize listener
    window.addEventListener('resize', checkDeviceType);

    // Cleanup
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  // Function to navigate to contact page
  const handleContactClick = () => {
    router.push('/contacto');
  };

  // Clases dinámicas para la altura del hero según el dispositivo
  const heroHeightClasses = `
  lg:h-screen  
  md:h-auto 
    h-auto 
    min-h-[500px]
    ${isTablet ? 'max-h-[750px]' : ''}
  `;

  // Clases dinámicas para los espaciados según el dispositivo
  const heroSpacingClasses = `
    pt-12 
    pb-4 
    md:py-0
    ${isTablet ? 'lg:py-6' : ''}
  `;

  return (
    <section className={`${heroHeightClasses} ${heroSpacingClasses} bg-dark text-gray-400 relative overflow-hidden px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20`}>
      {/* HeroBackground with 3D animation */}
      <div className="absolute inset-0 z-0">
        <HeroBackground />
      </div>

      {/* Main content container - NUEVA ESTRUCTURA GRID */}
      <div className="relative z-10 w-full h-full grid grid-rows-[auto_auto_1fr] md:grid-rows-[1fr_1fr_2fr] lg:grid-rows-[1fr_1fr_1.4fr] overflow-x-hidden">

        {/* SECTION 1: Empty space at the top - visible on both mobile and desktop */}
        <div className={`md:min-h-0 h-36 md:h-20 lg:h-auto border-t border-gray-800 md:border-t-0 mt-10 relative ${isTablet ? 'lg:h-20' : ''}`}></div>

        {/* SECTION 2: Middle section with "©2025" only */}
        <div className={`flex items-start py-4 md:pt-6 h-32 md:h-0 lg:h-auto ${isTablet ? 'lg:h-24 lg:py-2' : ''}`}>
          <div className="w-full flex justify-end items-center">
            {/* Right side - Bullet point with year */}
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <div className="w-6 h-[1.5px] bg-gray-800"></div>
              <span className="text-[0.938rem] text-gray-700 font-archivo">©2025</span>
            </div>
          </div>
        </div>

        {/* SECTION 3: Bottom section with content and footer - AHORA MÁS ALTA */}
        <div className={`flex flex-col justify-between md:justify-end overflow-x-hidden ${isTablet ? 'lg:justify-between' : ''}`}>
          {/* Content section - MODIFIED: Split border in the middle on desktop */}
          <div className={`md:pt-5 mb-auto ${isTablet ? 'lg:pt-3' : ''}`}>
            {/* Split border container - only on desktop */}
            <div className="hidden md:grid grid-cols-2 w-full gap-8 md:gap-0 lg:gap-8">
              <div className="border-t border-t-gray-800"></div>
              <div className="border-t border-t-gray-800"></div>
            </div>
            {/* Regular border for mobile */}
            <div className="border-t border-t-gray-800 md:hidden"></div>

            <div className="grid grid-cols-12 gap-8 pt-4 md:pt-6">
              {/* Number indicator - Hidden on mobile */}
              <div className="col-span-1 hidden md:block">
                <span className="text-gray-700 text-base font-archivo">/01</span>
              </div>

              {/* Círculo pequeño - HIDDEN on md */}
              <div className="col-span-1 col-start-3 hidden lg:block relative lg:col-start-6">
                <div className="absolute top-1 right-0 w-2 h-2 rounded-full bg-gray-800"></div>
              </div>

              {/* Studio description - MODIFIED: Changed column span to 2-6 for md breakpoint */}
              <div className="col-span-12 md:col-start-2 md:col-span-5 lg:col-start-7 lg:col-span-3">
                <p className={`text-gray-600 text-base font-archivo text-left max-w-[320px] md:max-w-[450px] ${isTablet ? 'lg:text-sm' : ''}`}>
                  Convertimos ideas locas en experiencias digitales memorables. Diseñamos webs que rompen esquemas, marcas con personalidad y contenido que conecta.
                </p>

                {/* Mobile-only CTA */}
                <div className="block md:hidden mt-8 overflow-hidden">
                  <div
                    className="cursor-pointer text-left group relative max-w-[240px]"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onClick={handleContactClick}
                  >
                    {/* Contenedor del CTA con flecha en la esquina superior derecha */}
                    <div className="relative p-4">
                      {/* Borde estático sin animación */}
                      <StaticBorder />

                      {/* Fondo con color primary al hacer hover */}
                      <div className="absolute inset-[6px] transition-colors duration-300 bg-transparent group-hover:bg-primary"></div>

                      {/* Flecha en la esquina superior derecha */}
                      <div className="absolute top-0 right-0 p-4 pr-5 z-10">
                        <RotatingArrow isHovering={isHovering} isGroupHovering={isHovering} />
                      </div>

                      {/* Texto en tres líneas separadas */}
                      <div className="overflow-hidden mt-0 relative z-10">
                        {/* Primera línea: CREAMOS */}
                        <div className="overflow-hidden mb-0">
                          {isMobile ? (
                            <span className="text-gray-600 group-hover:text-dark transition-colors duration-300 font-archivo font-normal block">CREAMOS</span>
                          ) : (
                            <SlideTextOnHover
                              originalText={<span className="text-gray-600 font-archivo font-normal block">CREAMOS</span>}
                              hoverText={<span className="text-dark font-archivo font-normal block">CREAMOS</span>}
                            />
                          )}
                        </div>

                        {/* Segunda línea: PRODUCTOS */}
                        <div className="overflow-hidden mb-0 -mt-0.5">
                          {isMobile ? (
                            <span className="text-gray-600 group-hover:text-dark transition-colors duration-300 font-archivo font-normal block">PRODUCTOS</span>
                          ) : (
                            <SlideTextOnHover
                              originalText={<span className="text-gray-600 font-archivo font-normal block">PRODUCTOS</span>}
                              hoverText={<span className="text-dark font-archivo font-normal block">PRODUCTOS</span>}
                            />
                          )}
                        </div>

                        {/* Tercera línea: QUE IMPACTAN */}
                        <div className="overflow-hidden -mt-0.5">
                          {isMobile ? (
                            <span className="text-gray-600 group-hover:text-dark transition-colors duration-300 font-archivo font-normal block">QUE IMPACTAN</span>
                          ) : (
                            <SlideTextOnHover
                              originalText={<span className="text-gray-600 font-archivo font-normal block">QUE IMPACTAN</span>}
                              hoverText={<span className="text-dark font-archivo font-normal block">QUE IMPACTAN</span>}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop-only CTA - MODIFIED: Changed column span to 9-12 for md breakpoint */}
              <div className="hidden md:block md:col-start-9 md:col-span-4 lg:col-start-11 lg:col-span-2">
                <div className="flex justify-end w-full">
                  <div
                    className="cursor-pointer text-left group relative overflow-hidden w-full max-w-[250px]"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onClick={handleContactClick}
                  >
                    {/* Contenedor del CTA con flecha en la esquina superior derecha */}
                    <div className="relative p-4">
                      {/* Borde estático sin animación */}
                      <StaticBorder />

                      {/* Fondo con color primary al hacer hover */}
                      <div className="absolute inset-[6px] transition-colors duration-300 bg-transparent group-hover:bg-primary"></div>

                      {/* Flecha en la esquina superior derecha */}
                      <div className="absolute top-0 right-0.5 p-4 z-10">
                        <RotatingArrow isHovering={isHovering} isGroupHovering={isHovering} />
                      </div>

                      {/* Texto en tres líneas separadas */}
                      <div className="overflow-hidden mt-0 relative z-10">
                        {/* Primera línea: CREAMOS */}
                        <div className="overflow-hidden mb-0">
                          <SlideTextOnHover
                            originalText={<span className="text-gray-600 font-archivo font-normal block">CREAMOS</span>}
                            hoverText={<span className="text-dark font-archivo font-normal block">CREAMOS</span>}
                          />
                        </div>

                        {/* Segunda línea: PRODUCTOS */}
                        <div className="overflow-hidden -mt-1">
                          <SlideTextOnHover
                            originalText={<span className="text-gray-600 font-archivo font-normal block">PRODUCTOS</span>}
                            hoverText={<span className="text-dark font-archivo font-normal block">PRODUCTOS</span>}
                          />
                        </div>

                        {/* Tercera línea: QUE IMPACTAN */}
                        <div className="overflow-hidden -mt-1">
                          <SlideTextOnHover
                            originalText={<span className="text-gray-600 font-archivo font-normal block">QUE IMPACTAN</span>}
                            hoverText={<span className="text-dark font-archivo font-normal block">QUE IMPACTAN</span>}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer section */}
          <div className={`border-t border-t-gray-800 mt-20 md:mt-20 w-full ${isTablet ? 'lg:mt-16' : ''}`}>
            <div className="grid grid-cols-12 pt-2 md:pt-4 pb-2 md:pb-6 gap-8">
              {/* Left section - Slash character */}
              <div className="col-span-2 self-end">
                <span className="text-gray-700 text-xs ms:text-base font-archivo">/</span>
              </div>

              {/* Center section - Scroll text - Only visible on desktop */}
              <div className="hidden md:flex col-span-2 col-start-7 self-end justify-start">
                <ScrollText />
              </div>

              {/* Right section - Social media icons on desktop, "[ SCROLL ] • ©2025" on mobile */}
              <div className="col-span-10 md:col-span-2 md:col-start-11 self-end flex justify-end items-center gap-1.5">
                {isMobile ? (
                  <div className="flex items-center space-x-3 text-xs text-gray-700 font-display">
                    <ScrollText />
                    <span className="mx-1">•</span>
                    <span>©2025</span>
                  </div>
                ) : (
                  <>
                    <SocialIcon
                      icon={<FaInstagram className="text-[0.9em] text-gray-700" />}
                      hoverIcon={<FaInstagram className="text-[0.9em] text-gray-700" />}
                    />
                    <SocialIcon
                      icon={<FaFacebookF className="text-[0.8em] text-gray-700" />}
                      hoverIcon={<FaFacebookF className="text-[0.8em] text-gray-700" />}
                    />
                    <SocialIcon
                      icon={<FaBehance className="text-[0.9em] text-gray-700" />}
                      hoverIcon={<FaBehance className="text-[0.9em] text-gray-700" />}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;