"use client"; // 👈 Este es el truco, marcarlo como cliente

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";

export default function ConditionalFooter() {
  const pathname = usePathname();

  if (pathname === "/contacto") {
    return null; // No mostrar Footer en /contacto
  }

  return <Footer />;
}