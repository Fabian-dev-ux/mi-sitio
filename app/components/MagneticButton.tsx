"use client";
import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

// Definimos las props que nuestro componente aceptará
interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  magneticStrength?: number;
  [key: string]: any; // Para otras props como onClick, etc.
}

const MagneticButton = forwardRef<HTMLDivElement, MagneticButtonProps>(({ 
  children, 
  className = "", 
  magneticStrength = 0.4, 
  ...props 
}, ref) => {
  
  const containerRef = useRef<HTMLDivElement>(null);

  // useImperativeHandle nos permite unir la ref externa con nuestra ref interna
  useImperativeHandle(ref, () => containerRef.current!);

  useGSAP(() => {
    const container = containerRef.current;
    if (!container) return;

    // quickTo es la forma más eficiente de hacer esto
    const xTo = gsap.quickTo(container, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
    const yTo = gsap.quickTo(container, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

    const handleMouseMove = (e: MouseEvent) => {
      if(!container) return;

      const { clientX, clientY } = e;
      const { height, width, left, top } = container.getBoundingClientRect();
      
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      
      xTo(x * magneticStrength);
      yTo(y * magneticStrength);
    };

    const handleMouseLeave = () => {
      xTo(0);
      yTo(0);
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // GSAP se encarga de la limpieza automáticamente con useGSAP
    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    }

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className={className} {...props}>
      {children}
    </div>
  );
});

// Esto es útil para las herramientas de desarrollo de React
MagneticButton.displayName = "MagneticButton";

export default MagneticButton;