// app/contacto/page.tsx (ASEGÚRATE DE QUE ESTÉ ASÍ)
'use client';
import dynamic from 'next/dynamic';

// Carga el formulario de forma dinámica porque sabemos que usa ArrowAni (que usa three.js)
const ContactoForm = dynamic(() => import('@/components/ContactoForm'), {
  ssr: false,
  loading: () => (
    <div className="bg-dark text-gray-700 pb-6 pt-32 px-4">
      <h2 className="text-3xl text-gray-500">Cargando...</h2>
    </div>
  )
});

export default function ContactoPage() {
  return (
    <main>
      <ContactoForm />
    </main>
  );
}