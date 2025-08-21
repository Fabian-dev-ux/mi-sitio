'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import CalculadoraPresupuesto from '@/components/CalculadoraPresupuesto';

// 1. La importación dinámica se mantiene igual.
const AnimatedBackgroundLazy = dynamic(
  () => import('@/components/AnimatedBackground'), // Revisa que la ruta sea correcta
  { ssr: false }
);

export default function CalculadoraPage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    // 2. Aseguramos que el contenedor principal pueda tener hijos a tamaño completo.
    <main className="relative bg-dark">
      
      {/* --- SECCIÓN DEL FONDO ANIMADO --- */}
      <div className="fixed inset-0 z-0 opacity-30 pointer-events-none">
        {/* 
          3. Usamos Suspense para mostrar un 'fallback' mientras el componente dinámico carga.
             Esto es bueno para la experiencia de usuario y para depurar.
             Si ves el fondo negro, significa que el componente está intentando cargar.
        */}
        <Suspense fallback={<div className="w-full h-full bg-black" />}>
          {/* 
            4. Solo renderizamos en el cliente. Si no ves nada, el problema
               podría estar dentro de AnimatedBackground.
          */}
          {isClient && <AnimatedBackgroundLazy />}
        </Suspense>
      </div>

      {/* --- SECCIÓN DEL CONTENIDO PRINCIPAL --- */}
      {/* 
        5. El z-index de la calculadora debe ser mayor que el del fondo (z-0).
           Tu componente ya tiene z-20 internamente, así que esto está bien.
      */}
      <CalculadoraPresupuesto />
    </main>
  );
}