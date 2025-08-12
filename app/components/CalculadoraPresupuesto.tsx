// app/components/CalculadoraPresupuesto.tsx
'use client';

import { useState, useEffect } from 'react';

// Estructura de preguntas
const questions = [
  {
    id: 'website_type',
    question: "¿Cuál es el punto de partida de tu proyecto?",
    type: 'single',
    options: [
      { text: 'Un sitio web nuevo desde cero', value: 2000 },
      { text: 'Un rediseño de mi sitio web actual', value: 2500 },
      { text: 'Necesito solo una landing page de alta conversión', value: 1200 },
    ],
  },
  {
    id: 'branding_services',
    question: "¿Cómo está la identidad visual de tu marca?",
    type: 'single',
    options: [
      { text: 'Ya tengo una marca sólida y un manual de estilo', value: 0 },
      { text: 'Tengo un logo, pero necesito una identidad visual completa', value: 800 },
      { text: 'Necesito una marca completa, incluyendo naming y logo', value: 1800 },
    ],
  },
  {
    id: 'functionalities',
    question: "¿Qué funcionalidades especiales necesitas integrar?",
    type: 'multiple',
    options: [
      { text: 'Blog para marketing de contenidos (SEO)', value: 500 },
      { text: 'Tienda Online (E-commerce) con pasarela de pago', value: 1500 },
      { text: 'Sistema de Reservas o Agendamiento de Citas', value: 700 },
      { text: 'Sitio Multilingüe', value: 600 },
      { text: 'Área Privada para Clientes (con inicio de sesión)', value: 1800 },
    ],
  },
  {
    id: 'seo_content',
    question: "¿Cómo planeas atraer visitantes a tu nuevo sitio?",
    type: 'single',
    options: [
      { text: 'Me encargaré yo mismo del contenido y SEO por ahora', value: 0 },
      { text: 'Necesito una configuración SEO técnica inicial', value: 400 },
      { text: 'Quiero un paquete de creación de contenido inicial (5 artículos de blog)', value: 1000 },
    ],
  },
];

interface Answers {
  [key: string]: string[] | string;
}

export default function CalculadoraPresupuesto() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [showResults, setShowResults] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  // Calcular el precio total basado en las respuestas
  const calculateTotal = () => {
    let total = 0;
    
    questions.forEach(question => {
      const answer = answers[question.id];
      if (!answer) return;

      if (question.type === 'single') {
        const selectedOption = question.options.find(opt => opt.text === answer);
        if (selectedOption) total += selectedOption.value;
      } else if (question.type === 'multiple' && Array.isArray(answer)) {
        answer.forEach(answerText => {
          const selectedOption = question.options.find(opt => opt.text === answerText);
          if (selectedOption) total += selectedOption.value;
        });
      }
    });

    return total;
  };

  // Obtener el rango de precios (Total * 0.9 a Total * 1.2)
  const getPriceRange = () => {
    const total = calculateTotal();
    const min = Math.round(total * 0.9);
    const max = Math.round(total * 1.2);
    return { min, max, total };
  };

  // Manejar selección de respuesta
  const handleAnswer = (optionText: string) => {
    const newAnswers = { ...answers };

    if (currentQuestion.type === 'single') {
      newAnswers[currentQuestion.id] = optionText;
    } else if (currentQuestion.type === 'multiple') {
      const currentAnswers = (newAnswers[currentQuestion.id] as string[]) || [];
      if (currentAnswers.includes(optionText)) {
        newAnswers[currentQuestion.id] = currentAnswers.filter(answer => answer !== optionText);
      } else {
        newAnswers[currentQuestion.id] = [...currentAnswers, optionText];
      }
    }

    setAnswers(newAnswers);
  };

  // Verificar si la pregunta actual está respondida
  const isCurrentQuestionAnswered = () => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'single') {
      return !!answer;
    } else if (currentQuestion.type === 'multiple') {
      return Array.isArray(answer) && answer.length > 0;
    }
    return false;
  };

  // Ir al siguiente paso
  const nextStep = () => {
    if (!isCurrentQuestionAnswered()) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setShowResults(true);
      }
      setIsAnimating(false);
    }, 200);
  };

  // Ir al paso anterior
  const prevStep = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentStep > 0) {
        setCurrentStep(currentStep - 1);
      }
      setIsAnimating(false);
    }, 200);
  };

  // Manejar agendamiento de llamada
  const handleScheduleCall = () => {
    // Enviar datos a Netlify Forms
    submitToNetlify();
    // Abrir Calendly
    window.open('https://calendly.com/tu-usuario', '_blank');
  };

  // Enviar datos a Netlify Forms
  const submitToNetlify = () => {
    const { min, max, total } = getPriceRange();
    
    // Crear formulario oculto para Netlify
    const form = document.createElement('form');
    form.setAttribute('name', 'calculadora-leads');
    form.setAttribute('method', 'POST');
    form.setAttribute('data-netlify', 'true');
    form.style.display = 'none';

    // Agregar campos
    const fields = {
      'form-name': 'calculadora-leads',
      'rango-precio': `$${min.toLocaleString()} - $${max.toLocaleString()}`,
      'precio-total-calculado': `$${total.toLocaleString()}`,
      'respuestas': JSON.stringify(answers),
      'timestamp': new Date().toISOString()
    };

    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', name);
      input.setAttribute('value', String(value));
      form.appendChild(input);
    });

    document.body.appendChild(form);
    
    // Enviar formulario
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form) as any).toString()
    }).then(() => {
      document.body.removeChild(form);
    }).catch(() => {
      document.body.removeChild(form);
    });
  };

  // Verificar si una opción está seleccionada
  const isOptionSelected = (optionText: string) => {
    const answer = answers[currentQuestion.id];
    if (currentQuestion.type === 'single') {
      return answer === optionText;
    } else if (currentQuestion.type === 'multiple') {
      return Array.isArray(answer) && answer.includes(optionText);
    }
    return false;
  };

  if (showResults) {
    const { min, max } = getPriceRange();
    
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
        {/* Formulario oculto para Netlify */}
        <form name="calculadora-leads" data-netlify="true" hidden>
          <input type="text" name="rango-precio" />
          <input type="text" name="precio-total-calculado" />
          <input type="text" name="respuestas" />
          <input type="text" name="timestamp" />
        </form>

        <div className="text-center mb-8">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              ¡Tu presupuesto está listo!
            </h2>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl mb-6">
            <div className="text-sm text-gray-600 mb-2">Rango estimado para tu proyecto:</div>
            <div className="text-4xl font-bold text-blue-600">
              ${min.toLocaleString()} - ${max.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 mt-2">
              * Estimación basada en tus respuestas. El precio final se definirá en la consulta.
            </div>
          </div>

          {/* CTA Principal */}
          <button
            onClick={handleScheduleCall}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-lg mb-4 transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            📅 AGENDAR LLAMADA ESTRATÉGICA
          </button>

          {/* CTA Secundario */}
          <button
            onClick={() => window.location.href = 'mailto:contacto@tudominio.com?subject=Cotización Web&body=Hola, completé la calculadora y me interesa conocer más detalles.'}
            className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
          >
            ✉️ Contactar por Email
          </button>

          <div className="mt-6 text-xs text-gray-400">
            En la llamada definiremos todos los detalles específicos de tu proyecto
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      {/* Barra de progreso */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-600">
            Paso {currentStep + 1} de {questions.length}
          </span>
          <span className="text-sm font-medium text-blue-600">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Pregunta actual */}
      <div className={`transition-all duration-200 ${isAnimating ? 'opacity-50 transform scale-95' : 'opacity-100 transform scale-100'}`}>
        <h2 className="text-2xl font-bold text-gray-800 mb-8 leading-tight">
          {currentQuestion.question}
        </h2>

        {/* Opciones */}
        <div className="space-y-4 mb-8">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option.text)}
              className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-200 ${
                isOptionSelected(option.text)
                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.text}</span>
                <div className="flex items-center space-x-2">
                  {option.value > 0 && (
                    <span className="text-sm text-green-600 font-semibold">
                      +${option.value.toLocaleString()}
                    </span>
                  )}
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    isOptionSelected(option.text)
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {isOptionSelected(option.text) && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Indicador para preguntas múltiples */}
        {currentQuestion.type === 'multiple' && (
          <div className="text-sm text-gray-500 mb-6 text-center">
            💡 Puedes seleccionar varias opciones
          </div>
        )}
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            currentStep === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ← Anterior
        </button>

        <button
          onClick={nextStep}
          disabled={!isCurrentQuestionAnswered()}
          className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
            isCurrentQuestionAnswered()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {currentStep === questions.length - 1 ? 'Ver Resultados' : 'Siguiente'} →
        </button>
      </div>
    </div>
  );
}