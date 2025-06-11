"use client";
import React, { useRef, useEffect } from "react";
import gsap from "gsap";

const MagneticButton = ({ children, className = "", magneticStrength = 0.5, magneticArea = 150, ...props }) => {
  const buttonRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const button = buttonRef.current;
    const container = containerRef.current;
    
    if (!button || !container) return;
    
    // Variables para almacenar las dimensiones del botón y su posición original
    let buttonRect = button.getBoundingClientRect();
    let buttonCenterX = buttonRect.left + buttonRect.width / 2;
    let buttonCenterY = buttonRect.top + buttonRect.height / 2;
    
    // Guardar la posición original del botón
    const originalX = 0;
    const originalY = 0;
    
    const handleMouseMove = (e) => {
      // Actualizar las dimensiones del botón en cada movimiento
      buttonRect = button.getBoundingClientRect();
      buttonCenterX = buttonRect.left + buttonRect.width / 2;
      buttonCenterY = buttonRect.top + buttonRect.height / 2;
      
      // Calcular la distancia entre el cursor y el centro del botón
      const deltaX = e.clientX - buttonCenterX;
      const deltaY = e.clientY - buttonCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Si el cursor está dentro de la zona de influencia
      if (distance < magneticArea) {
        // Calcular el desplazamiento proporcional a la distancia
        const moveX = deltaX * magneticStrength;
        const moveY = deltaY * magneticStrength;
        
        // Animar el botón hacia el cursor
        gsap.to(button, {
          x: moveX,
          y: moveY,
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        // Si está fuera de la zona, volver a la posición original
        gsap.to(button, {
          x: originalX,
          y: originalY,
          duration: 0.7,
          ease: "elastic.out(1, 0.3)"
        });
      }
    };
    
    const handleMouseLeave = () => {
      // Devolver el botón a su posición original cuando el cursor sale
      gsap.to(button, {
        x: originalX,
        y: originalY,
        duration: 0.7,
        ease: "elastic.out(1, 0.3)"
      });
    };
    
    // Agregar event listeners
    document.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    
    // Limpiar event listeners al desmontar
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [magneticStrength, magneticArea]);

  return (
    <div ref={containerRef} className="relative">
      <div ref={buttonRef} className={className} {...props}>
        {children}
      </div>
    </div>
  );
};

export default MagneticButton;