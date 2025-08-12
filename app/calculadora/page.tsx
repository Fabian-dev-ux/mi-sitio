// app/calculadora/page.tsx
import CalculadoraPresupuesto from '../components/CalculadoraPresupuesto';

export const metadata = {
  title: 'Calculadora de Presupuesto Web | Tu Sitio',
  description: 'Descubre el costo de tu proyecto web en 4 simples pasos. Obtén tu presupuesto personalizado y agenda una llamada estratégica.',
  keywords: 'calculadora web, presupuesto sitio web, cotización web, desarrollo web, calculadora presupuesto'
};

export default function CalculadoraPage() {
  return (
    <main className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4">
        <CalculadoraPresupuesto />
      </div>
    </main>
  );
}