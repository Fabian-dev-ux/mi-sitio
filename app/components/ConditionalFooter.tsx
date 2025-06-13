"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Normalizar la ruta removiendo la barra diagonal al final
  const normalizedPath = pathname.endsWith('/') && pathname !== '/' 
    ? pathname.slice(0, -1) 
    : pathname;

  // Lista de páginas donde NO queremos mostrar el footer
  const pagesWithoutFooter = [
    "/contacto",
    "/politica-de-privacidad"
  ];

  // Si la página actual está en la lista, no mostrar el footer
  if (pagesWithoutFooter.includes(normalizedPath)) {
    return null;
  }

  return <Footer />;
}