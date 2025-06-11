'use client';

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger with GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface AnimatedTitleProps {
  text: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  className?: string;
}

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  textColor = "text-gray-400",
  fontSize = "text-3xl",
  fontWeight = "font-light",
  lineHeight = "leading-normal",
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  
  // Split text into lines based on container width
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create ResizeObserver to detect container width changes
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          const newWidth = entry.contentRect.width;
          if (newWidth !== containerWidth) {
            setContainerWidth(newWidth);
          }
        }
      }
    });
    
    resizeObserver.observe(containerRef.current);
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [containerWidth]);
  
  // Calculate lines when container width changes
  useEffect(() => {
    if (!containerRef.current || containerWidth === 0) return;
    
    // Clean up previous animation
    if (typeof window !== 'undefined') {
      ScrollTrigger.getAll().forEach(trigger => {
        trigger.kill();
      });
    }
    
    // Create a temporary element to measure text width
    const tempElement = document.createElement('div');
    tempElement.className = `${textColor} ${fontSize} ${fontWeight} ${lineHeight}`;
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.whiteSpace = 'nowrap';
    document.body.appendChild(tempElement);
    
    const words = text.split(' ');
    const newLines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      tempElement.textContent = testLine;
      
      if (tempElement.getBoundingClientRect().width > containerWidth && currentLine !== '') {
        newLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      newLines.push(currentLine);
    }
    
    document.body.removeChild(tempElement);
    setLines(newLines.length > 0 ? newLines : [text]);
    
  }, [text, containerWidth, textColor, fontSize, fontWeight, lineHeight]);
  
  // Apply animation after lines are calculated
  useEffect(() => {
    if (!containerRef.current || lines.length === 0) return;
    
    const lineElements = containerRef.current.querySelectorAll('.line-content');
    
    // Reset initial state
    gsap.set(lineElements, { 
      y: "100%",
      opacity: 0
    });
    
    // Create animation
    gsap.to(lineElements, { 
      y: "0%",
      opacity: 1,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.1,
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 80%",
        once: false,
        toggleActions: "play none none reverse"
      }
    });
    
    return () => {
      if (typeof window !== 'undefined') {
        ScrollTrigger.getAll().forEach(trigger => {
          trigger.kill();
        });
      }
    };
  }, [lines]);
  
  return (
    <div 
      ref={containerRef} 
      className={`animated-title-container ${className}`}
    >
      {lines.map((line, index) => (
        <div 
          key={index} 
          className="line-wrapper relative overflow-hidden"
          style={{ marginBottom: "0.5em" }}
        >
          {/* Hidden element to maintain proper height and calculate dimensions */}
          <div 
            className={`${textColor} ${fontSize} ${fontWeight} ${lineHeight} opacity-0`}
            aria-hidden="true"
          >
            {line}
          </div>
          
          {/* Animated element */}
          <div 
            className={`line-content absolute top-0 left-0 right-0 ${textColor} ${fontSize} ${fontWeight} ${lineHeight}`}
            style={{ willChange: "transform, opacity" }}
          >
            {line}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnimatedTitle;