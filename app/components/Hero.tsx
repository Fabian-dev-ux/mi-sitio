"use client";
import { FaInstagram, FaFacebookF, FaBehance } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeroBackground from './HeroBackground';
import SlideTextOnHover from './SlideTextOnHover';
import Image from 'next/image';

// Define interfaces for TypeScript
interface RotatingArrowProps {
  isHovering: boolean;
  isGroupHovering?: boolean;
}

interface SocialIconProps {
  icon?: React.ReactNode;
  hoverIcon?: React.ReactNode;
  link?: string;
}

// RotatingArrow component
const RotatingArrow = ({ isHovering, isGroupHovering }: RotatingArrowProps) => {
  const customColor = isGroupHovering ? "#000000" : "#FF5741";
  return (
    <div className="relative inline-block" style={{ width: "12px", height: "12px" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 13.28 13.28"
        className="w-full h-full transition-all duration-300 ease-in-out"
        style={{ transform: isHovering ? 'rotate(45deg)' : 'rotate(0deg)', transformOrigin: 'center', fill: customColor }}
      >
        <polygon points=".53 0 .53 1.5 10.72 1.5 0 12.22 1.06 13.28 11.78 2.56 11.78 12.75 13.28 12.75 13.28 0 .53 0" />
      </svg>
    </div>
  );
};

// SocialIcon component
const SocialIcon = ({ icon, hoverIcon, link = "#" }: SocialIconProps) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <a href={link} className="bg-gray-900 w-6 h-6 flex items-center justify-center">
        <div className="w-full h-full flex items-center justify-center">
          {icon || <FaInstagram className="text-[0.9em] text-gray-700" />}
        </div>
      </a>
    );
  }

  return (
    <a href={link} className="bg-gray-900 w-6 h-6 flex items-center justify-center group">
      <div className="relative w-full h-full flex items-center justify-center">
        <SlideTextOnHover
          originalText={icon || <FaInstagram className="text-[0.9em] text-gray-600" />}
          hoverText={hoverIcon || <FaInstagram className="text-[0.9em] text-white" />}
        />
      </div>
    </a>
  );
};

// ScrollText component
const ScrollText = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToVideoReel = () => {
    const videoReelSection = document.getElementById('VideoReel');
    if (videoReelSection) {
      videoReelSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isMobile) {
    return (
      <span 
        className="text-gray-700 font-display text-xs md:text-sm uppercase tracking-wide font-body cursor-pointer"
        onClick={scrollToVideoReel}
      >
        [ SCROLL ]
      </span>
    );
  }

  return (
    <div 
      className="group cursor-pointer leading-none h-[1em]" 
      onClick={scrollToVideoReel}
    >
      <SlideTextOnHover
        originalText={<span className="text-gray-700 font-archivo uppercase tracking-wide font-body md:text-sm lg:text-xs 2xl:text-sm">Scroll</span>}
        hoverText={<span className="text-gray-700 font-archivo uppercase tracking-wide font-body md:text-sm lg:text-xs 2xl:text-sm">Scroll</span>}
      />
    </div>
  );
};


// ***** DEFINICIÓN RESTAURADA AQUÍ *****
// StaticBorder component
const StaticBorder = () => {
  const borderGap = 8;
  const borderThickness = 0.7;
  const borderColor = '#2D3036';
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0" style={{ left: `${borderGap}px`, right: `${borderGap}px`, height: `${borderThickness}px`, backgroundColor: borderColor }} />
      <div className="absolute bottom-0" style={{ left: `${borderGap}px`, right: `${borderGap}px`, height: `${borderThickness}px`, backgroundColor: borderColor }} />
      <div className="absolute left-0" style={{ top: `${borderGap}px`, bottom: `${borderGap}px`, width: `${borderThickness}px`, backgroundColor: borderColor }} />
      <div className="absolute right-0" style={{ top: `${borderGap}px`, bottom: `${borderGap}px`, width: `${borderThickness}px`, backgroundColor: borderColor }} />
    </div>
  );
};

const Hero = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 768);
      setIsTablet(width >= 1024 && width <= 1112 && height > 1000);
    };
    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);
    return () => window.removeEventListener('resize', checkDeviceType);
  }, []);

  const handleContactClick = () => { router.push('/contacto'); };
  const handleCalculatorClick = () => { router.push('/calculadora'); };

  const heroHeightClasses = `lg:h-screen md:h-auto h-auto min-h-[500px] ${isTablet ? 'max-h-[750px]' : ''}`;
  const heroSpacingClasses = `pt-12 pb-4 md:py-0 ${isTablet ? 'lg:py-6' : ''}`;

  return (
    <section className={`${heroHeightClasses} ${heroSpacingClasses} bg-dark text-gray-400 relative overflow-hidden px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-20`}>
      <h1 className="sr-only">Convertimos Ideas Locas en Experiencias Digitales Memorables</h1>
      <div className="absolute inset-0 z-0"><HeroBackground /></div>
      <div className="relative z-10 w-full h-full grid grid-rows-[auto_auto_1fr] md:grid-rows-[1fr_1fr_2fr] lg:grid-rows-[1fr_1fr_1.4fr] overflow-x-hidden">
        <div className={`md:min-h-0 h-36 md:h-20 lg:h-auto border-t border-gray-800 md:border-t-0 mt-10 relative ${isTablet ? 'lg:h-20' : ''}`}></div>
        <div className={`flex items-start py-4 md:pt-6 h-32 md:h-0 lg:h-auto ${isTablet ? 'lg:h-24 lg:py-2' : ''}`}>
          <div className="w-full flex justify-end items-center">
            <div className="hidden md:flex items-center gap-3 ml-auto">
              <div className="w-6 h-[1.5px] bg-gray-800"></div>
              <span className="text-gray-700 font-archivo text-sm lg:text-xs 2xl:text-sm">©2025</span>
            </div>
          </div>
        </div>
        <div className={`flex flex-col justify-between md:justify-end overflow-x-hidden ${isTablet ? 'lg:justify-between' : ''}`}>
          <div className={`md:pt-5 lg:pt-4 xl:pt-5 mb-auto ${isTablet ? 'lg:pt-3' : ''}`}>
            <div className="hidden md:grid grid-cols-2 w-full md:gap-0 lg:grid-cols-12 xl:grid-cols-2 lg:gap-8">
              <div className="border-t border-t-gray-800 lg:col-span-3 xl:col-span-1"></div>
              <div className="border-t border-t-gray-800 lg:col-start-4 lg:col-span-9 xl:col-start-auto xl:col-span-1"></div>
            </div>
            <div className="border-t border-t-gray-800 md:hidden"></div>
            <div className="grid grid-cols-12 gap-8 pt-4 md:pt-6">
              <div className="col-span-1 hidden md:block"><span className="text-gray-700 font-archivo text-sm lg:text-xs 2xl:text-sm">/01</span></div>
              <div className="col-span-1 hidden lg:block relative lg:col-start-3 xl:col-start-6"><div className="absolute top-1 right-0 w-2 h-2 rounded-full bg-gray-800"></div></div>
              <div className="col-span-12 md:col-start-2 md:col-span-5 lg:col-start-4 lg:col-span-5 xl:col-start-7 xl:col-span-3">
                <h2 className={`text-gray-600 text-base font-archivo text-left max-w-[320px] md:max-w-[450px] ${isTablet ? 'lg:text-sm' : ''}`}>
                  Convertimos ideas locas en experiencias digitales memorables. Diseñamos webs que rompen esquemas, marcas con personalidad y contenido que conecta.
                </h2>
              </div>

              {/* CTA para MÓVIL Y TABLET (hasta 1024px) */}
              <div className="col-span-12 md:col-start-9 md:col-span-4 lg:hidden">
                <div className="flex justify-start md:justify-end w-full mt-0 md:mt-0">
                  <div className="cursor-pointer text-left group relative w-full max-w-[250px]" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={handleCalculatorClick}>
                    <div className="relative p-4">
                      <StaticBorder />
                      <div className="absolute inset-[6px] transition-colors duration-300 bg-transparent group-hover:bg-primary"></div>
                      <div className="absolute top-0 right-0 p-4 pr-5 md:right-0.5 z-10"><RotatingArrow isHovering={isHovering} isGroupHovering={isHovering} /></div>
                      <div className="overflow-hidden mt-0 relative z-10">
                        <div className="overflow-hidden mb-0"><SlideTextOnHover originalText={<span className="text-gray-600 font-archivo font-normal block">CALCULA</span>} hoverText={<span className="text-dark font-archivo font-normal block">CALCULA</span>} /></div>
                        <div className="overflow-hidden mb-0 -mt-0.5"><SlideTextOnHover originalText={<span className="text-gray-600 font-archivo font-normal block">TU PROYECTO</span>} hoverText={<span className="text-dark font-archivo font-normal block">TU PROYECTO</span>} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA para DESKTOP (desde 1024px en adelante) */}
              <div className="hidden lg:block lg:col-start-10 lg:col-span-3 xl:col-start-11 xl:col-span-2">
                <div className="flex justify-end w-full">
                  <div className="cursor-pointer text-left group relative overflow-hidden w-full max-w-[250px]" onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)} onClick={handleContactClick}>
                    <div className="relative p-4">
                      <StaticBorder />
                      <div className="absolute inset-[6px] transition-colors duration-300 bg-transparent group-hover:bg-primary"></div>
                      <div className="absolute top-0 right-0.5 p-4 z-10"><RotatingArrow isHovering={isHovering} isGroupHovering={isHovering} /></div>
                      <div className="overflow-hidden mt-0 relative z-10">
                        <div className="overflow-hidden mb-0"><SlideTextOnHover originalText={<span className="text-gray-600 font-archivo font-normal block">CREAMOS</span>} hoverText={<span className="text-dark font-archivo font-normal block">CREAMOS</span>} /></div>
                        <div className="overflow-hidden -mt-1"><SlideTextOnHover originalText={<span className="text-gray-600 font-archivo font-normal block">PRODUCTOS</span>} hoverText={<span className="text-dark font-archivo font-normal block">PRODUCTOS</span>} /></div>
                        <div className="overflow-hidden -mt-1"><SlideTextOnHover originalText={<span className="text-gray-600 font-archivo font-normal block">QUE IMPACTAN</span>} hoverText={<span className="text-dark font-archivo font-normal block">QUE IMPACTAN</span>} /></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={`border-t border-t-gray-800 mt-20 md:mt-20 lg:mt-12 xl:mt-20 w-full ${isTablet ? 'lg:mt-16' : ''}`}>
            <div className="grid grid-cols-12 pt-2 md:pt-4 pb-2 md:pb-6 gap-8">
              <div className="col-span-2 self-end"><span className="text-gray-700 font-archivo text-sm lg:text-xs 2xl:text-sm">/</span></div>
              <div className="hidden md:flex col-span-2 col-start-7 self-end justify-start"><ScrollText /></div>
              <div className="col-span-10 md:col-span-2 md:col-start-11 self-end flex justify-end items-center gap-1.5">
                {isMobile ? (
                  <div className="flex items-center space-x-3 text-xs text-gray-700 font-display">
                    <ScrollText /><span className="mx-1">•</span><span>©2025</span>
                  </div>
                ) : (
                  <>
                    <SocialIcon icon={<FaInstagram className="text-[0.9em] text-gray-700" />} hoverIcon={<FaInstagram className="text-[0.9em] text-gray-700" />} />
                    <SocialIcon icon={<FaFacebookF className="text-[0.8em] text-gray-700" />} hoverIcon={<FaFacebookF className="text-[0.8em] text-gray-700" />} />
                    <SocialIcon icon={<FaBehance className="text-[0.9em] text-gray-700" />} hoverIcon={<FaBehance className="text-[0.9em] text-gray-700" />} />
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