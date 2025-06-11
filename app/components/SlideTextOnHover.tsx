"use client";
import React, { ReactNode } from 'react';

interface SlideTextOnHoverProps {
  originalText: ReactNode;
  hoverText: ReactNode;
  className?: string;
}

const SlideTextOnHover: React.FC<SlideTextOnHoverProps> = ({
  originalText,
  hoverText,
  className = "",
}) => {
  return (
    <div className={`relative overflow-hidden inline-flex items-center ${className}`}>
      {/* Contenedor con altura explícita para mantener alineación */}
      <div className="flex items-center">
        {/* Original text */}
        <div className="transform transition-transform duration-300 group-hover:-translate-y-full">
          {originalText}
        </div>
        
        {/* Hover text */}
        <div className="absolute left-0 top-0 flex items-center transform transition-transform duration-300 translate-y-full group-hover:translate-y-0">
          {hoverText}
        </div>
      </div>
    </div>
  );
};

export default SlideTextOnHover;