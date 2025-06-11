"use client";

import { useState, useEffect } from 'react';

const StickyTestComponent = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Header Sticky (top: 0)</h1>
          <div className="text-sm">Scroll: {scrollY}px</div>
        </div>
      </header>

      {/* Contenido inicial */}
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Test de Elementos Sticky
        </h2>
        <p className="text-gray-600 mb-8">
          Desplázate hacia abajo para ver cómo funcionan los diferentes elementos sticky.
        </p>

        {/* Secciones con contenido largo */}
        {[1, 2, 3].map((section) => (
          <div key={section} className="mb-12">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Sección {section}
            </h3>
            {Array.from({ length: 8 }, (_, i) => (
              <p key={i} className="mb-4 text-gray-600 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod 
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim 
                veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea 
                commodo consequat. Duis aute irure dolor in reprehenderit in voluptate 
                velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            ))}
          </div>
        ))}

        {/* Sidebar Sticky */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              Contenido Principal
            </h3>
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i} className="mb-4 text-gray-600">
                Párrafo {i + 1}: Contenido principal que se extiende verticalmente 
                para demostrar el comportamiento sticky del sidebar. Este contenido 
                es más largo para crear suficiente altura de scroll.
              </p>
            ))}
          </div>
          
          <div className="sticky top-24 h-fit bg-green-100 p-4 rounded-lg border border-green-300">
            <h4 className="font-semibold text-green-800 mb-3">
              Sidebar Sticky (top: 6rem)
            </h4>
            <ul className="space-y-2 text-sm text-green-700">
              <li>• Enlace 1</li>
              <li>• Enlace 2</li>
              <li>• Enlace 3</li>
              <li>• Enlace 4</li>
            </ul>
            <div className="mt-4 p-2 bg-green-200 rounded text-xs text-green-800">
              Posición: sticky
              <br />
              Top: 6rem (96px)
            </div>
          </div>
        </div>

        {/* Elemento sticky con offset diferente */}
        <div className="sticky top-32 bg-yellow-200 p-4 rounded-lg border border-yellow-400 mb-8">
          <h4 className="font-semibold text-yellow-800">
            Elemento Sticky (top: 8rem)
          </h4>
          <p className="text-sm text-yellow-700 mt-2">
            Este elemento se queda pegado cuando llega a 8rem desde el top.
          </p>
        </div>

        {/* Más contenido */}
        {Array.from({ length: 15 }, (_, i) => (
          <p key={i} className="mb-4 text-gray-600">
            Párrafo adicional {i + 1} para crear más altura de scroll y 
            poder observar mejor el comportamiento de los elementos sticky.
            Observa cómo los elementos se mantienen fijos en sus posiciones 
            correspondientes mientras haces scroll.
          </p>
        ))}

        {/* Contenedor con sticky interno */}
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mb-8">
          <h3 className="text-xl font-semibold mb-4 text-purple-800">
            Contenedor con Sticky Interno
          </h3>
          
          <div className="sticky top-40 bg-purple-200 p-3 rounded mb-4 border border-purple-300">
            <span className="text-purple-800 font-medium">
              Sticky dentro de contenedor (top: 10rem)
            </span>
          </div>
          
          {Array.from({ length: 10 }, (_, i) => (
            <p key={i} className="mb-3 text-purple-700 text-sm">
              Contenido del contenedor {i + 1}. Este texto está dentro de un 
              contenedor que tiene su propio elemento sticky interno.
            </p>
          ))}
        </div>

        {/* Footer sticky (bottom) */}
        <div className="sticky bottom-4 bg-red-600 text-white p-4 rounded-lg shadow-lg">
          <div className="text-center">
            <span className="font-semibold">Footer Sticky (bottom: 1rem)</span>
            <div className="text-sm mt-1 opacity-90">
              Este elemento se mantiene fijo en la parte inferior
            </div>
          </div>
        </div>

        {/* Contenido final */}
        {Array.from({ length: 8 }, (_, i) => (
          <p key={i} className="mb-4 text-gray-600 mt-8">
            Contenido final {i + 1} para seguir testeando el scroll y 
            verificar que todos los elementos sticky funcionan correctamente 
            en diferentes posiciones de la página.
          </p>
        ))}
      </div>
    </div>
  );
};

export default StickyTestComponent;