'use client';

// PASO 1: Importar el hook 'useEffect' de React
import React, { useEffect } from 'react';
import Hero from './components/Hero';
import VideoReel from './components/VideoReel';
import Servicios from './components/Servicios';
import Proceso from './components/Proceso';
import Marquee from './components/Marquee';
import Proyectos from './components/Proyectos';
import Antagonik from './components/Antagonik';
import Vision from './components/Vision';

export default function Page() {

  // PASO 2: Añadir el useEffect para manejar el scroll al cargar la página
  useEffect(() => {
    // Esta función se ejecuta después de que el componente se monta en el navegador
    const hash = window.location.hash; // Obtenemos la parte de la URL que empieza con #
    if (hash) {
      const id = hash.substring(1); // Quitamos el '#' para obtener el ID puro (ej. "servicios")
      
      // Usamos un pequeño retraso (100 milisegundos) para asegurarnos de que toda la página,
      // incluyendo las imágenes y otros elementos, se haya renderizado antes de intentar hacer scroll.
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          // Si encontramos el elemento, nos desplazamos suavemente hacia él.
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, []); // El array de dependencias vacío `[]` significa que este efecto se ejecutará solo una vez, justo después del primer renderizado.

  return (
    <>
      <Hero />
      <VideoReel />
      <Servicios />
      <Marquee />
      <Proyectos />
      <Proceso />
      <Antagonik />
      <Vision />
    </>
  );
}