'use client';

import { useState, useEffect, useRef } from 'react';

// Función para formatear números
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// =================================================================
// === ESTRUCTURA DE PRECIOS Y COMPONENTES ESTÁTICOS (SIN CAMBIOS) ===
// =================================================================
const questions = [
  { id: 'project_goal', question: "¿Cuál es el objetivo principal de tu nuevo sitio web?", type: 'single', options: [ { text: 'Necesito una Landing Page de alta conversión', value: 550, description: 'Página única y optimizada para una campaña específica, diseñada para convertir visitantes en clientes.' }, { text: 'Presentar mi empresa, servicios o portafolio', value: 1250, description: 'Crearemos una presencia online profesional (hasta 5 páginas) para conectar con tus clientes y mostrar lo que haces.' }, { text: 'Vender productos directamente (Tienda Online)', value: 2650, description: 'Construiremos una plataforma de e-commerce completa, lista para procesar ventas desde el primer día.' }, { text: 'Un rediseño completo de mi sitio actual', value: 1600, description: 'Auditamos y modernizamos tu web actual, mejorando diseño, velocidad y, sobre todo, resultados.' }, ], },
  { id: 'branding_services', question: "¿Cómo está la identidad visual de tu marca?", type: 'single', options: [ { text: 'Ya tengo una marca sólida y un manual de estilo', value: 0, description: 'Perfecto, trabajaremos con tu identidad visual existente para asegurar coherencia.' }, { text: 'Tengo un logo, pero necesito una identidad visual completa', value: 450, description: 'Expandimos tu logo creando una identidad coherente: colores, tipografías y elementos gráficos.' }, { text: 'Necesito una marca completa, incluyendo naming y logo', value: 950, description: 'Creamos tu marca desde cero: nombre, logo, colores y guía de estilo completa.' }, ], },
  { id: 'functionalities', question: "¿Qué funcionalidades especiales necesitas integrar?", type: 'multiple', options: [ { text: 'Blog para marketing de contenidos (SEO)', value: 350, description: 'Sistema de blog optimizado para posicionamiento en buscadores y generación de leads.' }, { text: 'Tienda Online (E-commerce)', value: 1400, description: 'Plataforma completa de ventas online con carrito, pagos seguros y gestión de inventario.' }, { text: 'Sistema de Reservas o Agendamiento de Citas', value: 300, description: 'Los clientes pueden reservar citas o servicios automáticamente, sincronizado con tu calendario.' }, { text: 'Sitio Multilingüe', value: 400, description: 'Expande tu alcance con contenido en múltiples idiomas.' }, { text: 'Área Privada para Clientes (con inicio de sesión)', value: 1200, description: 'Portal exclusivo donde tus clientes acceden a contenido, descargas o servicios personalizados.' }, ], },
  { id: 'seo_content', question: "¿Cómo planeas atraer visitantes a tu nuevo sitio?", type: 'single', options: [ { text: 'Me encargaré yo mismo del contenido y SEO por ahora', value: 0, description: 'Te entregaremos el sitio con las bases técnicas optimizadas para que puedas gestionar el contenido.' }, { text: 'Necesito una configuración SEO técnica inicial', value: 250, description: 'Nos aseguramos de que Google pueda encontrar, entender y clasificar tu sitio correctamente desde el primer día.' }, { text: 'Quiero un paquete de contenido inicial (3 artículos de blog)', value: 500, description: 'Creamos 3 artículos de blog optimizados para SEO, diseñados para empezar a atraer a tu público objetivo.' }, ], },
  { id: 'seo_content_landing', question: "¿Cómo quieres optimizar tu Landing Page?", type: 'single', options: [ { text: 'Me encargaré yo mismo del contenido y SEO', value: 0, description: 'Te entregaremos la landing page con las bases técnicas optimizadas.' }, { text: 'Necesito una configuración SEO técnica inicial', value: 150, description: 'Nos aseguramos de que Google pueda encontrar y clasificar tu página correctamente.' }, { text: 'Quiero un servicio de Copywriting de alta conversión', value: 300, description: 'Creamos textos persuasivos y optimizados para tu landing page, diseñados para maximizar los resultados.' }, ], }
];
interface Answers { [key: string]: string[] | string; }

// --- CORRECCIÓN APLICADA AQUÍ ---
const StaticHeader = () => ( <div className="w-full pt-6 pb-0 lg:pt-12 lg:pb-12 font-archivo"> <div className="flex items-center space-x-2 text-sm text-gray-400 uppercase mb-4 lg:mb-8"> <div className="w-2 h-2 bg-gray-400 rounded-full"></div> <span>Bienvenido</span> </div> <h1 className="font-display font-semibold text-gray-400 leading-none lg:leading-none uppercase mb-8 lg:mb-6" style={{ fontSize: 'clamp(3rem, 8vw, 72px)' }}> Vamos a definir tu<br className="lg:hidden" /><br className="hidden lg:block" /> proyecto web </h1> <div className="w-full border-t border-gray-800 mb-8 lg:hidden"></div> </div> );

const StaticDescription = () => ( <div className="lg:col-span-4 xl:col-span-4 2xl:col-span-3 space-y-8 font-archivo"> <div className="space-y-4 text-lg lg:text-2xl text-gray-400 max-w-[20rem]"> <p>En solo <strong className="text-gray-300">4 pasos</strong> tendrás un presupuesto personalizado a tu medida</p> <div className="text-xs text-gray-500 border border-gray-800 rounded-full px-4 py-2 inline-block"> TIEMPO ESTIMADO — 2 — 3 MINUTOS </div> </div> </div> );
const ClarificationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => { useEffect(() => { const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; if (isOpen) { document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden'; } else { document.body.style.overflow = 'unset'; } return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = 'unset'; }; }, [isOpen, onClose]); if (!isOpen) return null; return ( <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-archivo"> <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose}></div> <div className="relative bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 animate-fade-in"> <div className="flex justify-between items-center p-6 border-b border-gray-700"><h2 className="text-xl lg:text-2xl font-bold text-white">Puntos Clave de Nuestra Estimación</h2><button onClick={onClose} className="text-gray-400 hover:text-white p-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div> <div className="p-6 space-y-6 text-gray-300"> <p className="text-lg leading-relaxed">Para asegurar total transparencia, aquí te detallamos el alcance y la tecnología en la que se basa el rango de precios que has recibido.</p> <div className="space-y-3"><h3 className="text-lg font-bold text-white">1. Tecnología de Referencia: WordPress</h3><p className="leading-relaxed">Nuestra estimación se basa en el desarrollo sobre <strong className="text-white">WordPress</strong>, el gestor de contenidos más popular y versátil del mundo. Esta elección nos permite ofrecerte la mejor relación entre funcionalidad, escalabilidad y costo para la gran mayoría de proyectos web.</p></div> <div className="space-y-3"><h3 className="text-lg font-bold text-white">2. Otras Tecnologías y Desarrollo a Medida</h3><p className="leading-relaxed">Entendemos que cada proyecto es único. Para aquellos que requieran otras plataformas o un desarrollo completamente personalizado, realizaremos una cotización a medida tras nuestra consulta estratégica. Esto incluye:</p><ul className="space-y-2 pl-4"><li className="flex items-start"><span className="text-primary mr-2">•</span><div><strong className="text-white">Webflow:</strong> Para proyectos centrados en un diseño visual de alta complejidad y animaciones avanzadas.</div></li><li className="flex items-start"><span className="text-primary mr-2">•</span><div><strong className="text-white">Shopify:</strong> Para tiendas online que requieran el ecosistema específico de esta plataforma.</div></li><li className="flex items-start"><span className="text-primary mr-2">•</span><div><strong className="text-white">Development a Medida (Next.js, etc.):</strong> Para plataformas web, aplicaciones y soluciones que necesiten una arquitectura única desde cero.</div></li></ul></div> <div className="space-y-3"><h3 className="text-lg font-bold text-white">3. Kit de Herramientas Premium</h3><p className="leading-relaxed">Tu proyecto en WordPress se beneficia de nuestro kit de herramientas premium (valorado en +$500/año), que incluye licencias para software de optimización, seguridad y diseño. Para mantener estas ventajas a largo plazo, te ofreceremos un <strong className="text-white">plan de mantenimiento opcional</strong> en nuestra consulta.</p></div> <div className="space-y-3"><h3 className="text-lg font-bold text-white">4. Alcance General de la Estimación</h3><ul className="space-y-2 pl-4"><li className="flex items-start"><span className="text-red-400 mr-2">•</span><span><strong className="text-white">Esto es una estimación, no una propuesta final.</strong> El precio detallado se entregará en una propuesta formal después de nuestra llamada.</span></li><li className="flex items-start"><span className="text-red-400 mr-2">•</span><span><strong className="text-white">No incluye costos de terceros</strong> como dominios, hosting, o las licencias de plugins muy específicos que tu modelo de negocio pueda requerir.</span></li><li className="flex items-start"><span className="text-red-400 mr-2">•</span><span><strong className="text-white">No incluye la creación de contenido</strong> (textos, imágenes, videos), a menos que se haya seleccionado explícitamente.</span></li></ul></div> </div> <div className="p-6 border-t border-gray-700"><button onClick={onClose} className="w-full bg-primary text-black font-bold py-3 px-6 rounded-full hover:bg-primary/90 transition-colors">ENTENDIDO</button></div> </div> </div> ); };

export default function CalculadoraPresupuesto() {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [showResults, setShowResults] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    
    const isEcommerceProject = answers.project_goal === 'Vender productos directamente (Tienda Online)';
    const isLandingPageProject = answers.project_goal === 'Necesito una Landing Page de alta conversión';

    const activeQuestions = questions.filter(q => {
        if (isLandingPageProject) return q.id !== 'seo_content';
        return q.id !== 'seo_content_landing';
    });

    const totalSteps = activeQuestions.length;
    const progress = showResults ? 100 : ((currentStep + 1) / totalSteps) * 100;

    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.style.opacity = '0';
            containerRef.current.style.transform = 'translateY(20px)';
            setTimeout(() => { if (containerRef.current) { containerRef.current.style.transition = 'all 0.6s ease-out'; containerRef.current.style.opacity = '1'; containerRef.current.style.transform = 'translateY(0)'; } }, 100);
        }
    }, []);

    const calculateTotal = () => { let total = 0; const firstAnswer = answers[questions[0].id]; if (firstAnswer) { const selectedOption = questions[0].options.find(opt => opt.text === firstAnswer); if (selectedOption) total += selectedOption.value; } activeQuestions.slice(1).forEach(question => { const answer = answers[question.id]; if (!answer) return; if (question.type === 'single') { const selectedOption = question.options.find(opt => opt.text === answer); if (selectedOption) total += selectedOption.value; } else if (question.type === 'multiple' && Array.isArray(answer)) { answer.forEach(answerText => { const selectedOption = question.options.find(opt => opt.text === answerText); if (selectedOption && !(isEcommerceProject && selectedOption.text === 'Tienda Online (E-commerce)')) { total += selectedOption.value; } }); } }); return total; };
    const getPriceRange = () => { const total = calculateTotal(); const min = total; const max = Math.round(total * 1.2); return { min, max, total }; };
    const handleAnswer = (optionText: string) => { if (!activeQuestions[currentStep]) return; const currentQuestion = activeQuestions[currentStep]; const newAnswers = { ...answers }; if (currentQuestion.id === 'project_goal' && newAnswers[currentQuestion.id] !== optionText) { const resetAnswers: Answers = { [currentQuestion.id]: optionText }; setAnswers(resetAnswers); return; } if (currentQuestion.type === 'single') { newAnswers[currentQuestion.id] = optionText; } else if (currentQuestion.type === 'multiple') { const currentAnswers = (newAnswers[currentQuestion.id] as string[]) || []; if (currentAnswers.includes(optionText)) { newAnswers[currentQuestion.id] = currentAnswers.filter(answer => answer !== optionText); } else { newAnswers[currentQuestion.id] = [...currentAnswers, optionText]; } } setAnswers(newAnswers); };
    const isCurrentQuestionAnswered = () => { if (showResults || !activeQuestions[currentStep]) return false; const currentQuestion = activeQuestions[currentStep]; const answer = answers[currentQuestion.id]; if (currentQuestion.id === 'functionalities') { return true; } if (currentQuestion.type === 'single') { return !!answer; } return false; };
    const animateTransition = (direction: 'next' | 'prev', callback: () => void) => { if (!contentRef.current) return; setIsAnimating(true); const slideDistance = direction === 'next' ? -30 : 30; contentRef.current.style.transition = 'all 0.3s ease-in'; contentRef.current.style.opacity = '0'; contentRef.current.style.transform = `translateX(${slideDistance}px)`; setTimeout(() => { callback(); if (contentRef.current) { contentRef.current.style.transform = `translateX(${-slideDistance}px)`; setTimeout(() => { if (contentRef.current) { contentRef.current.style.transition = 'all 0.3s ease-out'; contentRef.current.style.opacity = '1'; contentRef.current.style.transform = 'translateX(0)'; setTimeout(() => { setIsAnimating(false); }, 300); } }, 50); } }, 300); };
    const nextStep = () => { if (!isCurrentQuestionAnswered() && !showResults) return; animateTransition('next', () => { if (currentStep < totalSteps - 1) { setCurrentStep(currentStep + 1); } else { setShowResults(true); } }); };
    const prevStep = () => { animateTransition('prev', () => { if (showResults) { setShowResults(false); setCurrentStep(totalSteps - 1); } else if (currentStep > 0) { setCurrentStep(currentStep - 1); } }); };
    const submitToNetlify = () => { const { min, max, total } = getPriceRange(); const formData: Record<string, string> = { 'form-name': 'calculadora-leads', 'rango-precio': `$${formatNumber(min)} - $${formatNumber(max)}`, 'precio-total-calculado': `$${formatNumber(total)}`, ...Object.entries(answers).reduce((acc, [questionId, answer]) => { acc[questionId] = Array.isArray(answer) ? answer.join(', ') : answer; return acc; }, {} as Record<string, string>), 'timestamp': new Date().toISOString() }; const encodedData = new URLSearchParams(formData).toString(); fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: encodedData }).then(() => { console.log('Formulario de presupuesto enviado a Netlify con éxito.'); }).catch((error) => { console.error('Error al enviar el formulario a Netlify:', error); }); };
    const handleScheduleCall = () => { submitToNetlify(); window.open('https://calendly.com/antagonik-studio/30min', '_blank'); };
    const isOptionSelected = (optionText: string) => { if (showResults || !activeQuestions[currentStep]) return false; const currentQuestion = activeQuestions[currentStep]; const answer = answers[currentQuestion.id]; if (currentQuestion.type === 'single') { return answer === optionText; } else if (currentQuestion.type === 'multiple') { return Array.isArray(answer) && answer.includes(optionText); } return false; };
    const Tooltip = ({ children, content }: { children: React.ReactNode; content: string }) => { const [isVisible, setIsVisible] = useState(false); return ( <div className="relative inline-block"> <div onMouseEnter={() => setIsVisible(true)} onMouseLeave={() => setIsVisible(false)}>{children}</div> {isVisible && ( <div className="absolute bottom-full right-0 transform mb-2 px-3 py-2 bg-gray-700 text-white text-sm rounded-lg shadow-lg z-10 w-64 font-archivo"> {content} <div className="absolute top-full right-4 transform border-4 border-transparent border-t-gray-700"></div> </div> )} </div> ); };
    
    const currentQuestionData = activeQuestions[currentStep];
    let currentOptions = currentQuestionData?.options || [];
    if (currentQuestionData?.id === 'functionalities') {
      if (isEcommerceProject) { currentOptions = currentOptions.filter(opt => opt.text !== 'Tienda Online (E-commerce)'); }
      if (isLandingPageProject) { const relevantOptions = ['Sistema de Reservas o Agendamiento de Citas', 'Sitio Multilingüe']; currentOptions = currentOptions.filter(opt => relevantOptions.includes(opt.text)); }
    }

    return (
        <div className="relative min-h-screen text-white font-archivo">
            {/* El formulario oculto se ha eliminado de aquí, ya que ahora Netlify lo detectará desde /public/form.html */}
            
            <div className="relative z-20 px-4 lg:px-8 xl:px-10 2xl:px-20 pt-20 lg:pt-32 2xl:pt-40">
                <StaticHeader />
                <div className="flex items-center justify-center pt-0 lg:pt-8 pb-20 lg:pb-40">
                    <div ref={containerRef} className="w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                            <div className="lg:col-span-1 xl:col-span-1 2xl:col-span-2 hidden lg:block"></div>
                            <StaticDescription />
                            <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-6">
                                {!showResults && (
                                    <div className="mb-8">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm text-gray-400">Paso {currentStep + 1} de {totalSteps}</span>
                                            <span className="text-sm font-bold text-gray-400 ">{Math.round(progress)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-800 rounded-full h-2">
                                            <div className="bg-primary h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                )}
                                <div className="relative p-4 lg:p-8" style={{ background: 'transparent' }}>
                                    <div className="absolute top-0 left-4 right-4 lg:left-4 lg:right-4 border-t border-gray-800" style={{ height: '1px' }}></div>
                                    <div className="absolute bottom-0 left-4 right-4 lg:left-4 lg:right-4 border-b border-gray-800" style={{ height: '1px' }}></div>
                                    <div className="absolute left-0 top-4 bottom-4 lg:top-4 lg:bottom-4 border-l border-gray-800" style={{ width: '1px' }}></div>
                                    <div className="absolute right-0 top-4 bottom-4 lg:top-4 lg:bottom-4 border-r border-gray-800" style={{ width: '1px' }}></div>
                                    {showResults ? (
                                        <div ref={contentRef} className="text-center">
                                            <div className="flex justify-center mb-8"><div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-600 rounded-full flex items-center justify-center"><svg className="w-6 h-6 lg:w-8 lg:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></div></div>
                                            <h2 className="text-xl lg:text-2xl xl:text-3xl font-bold mb-8 leading-tight">Tu presupuesto está listo</h2>
                                            <div className="border-t border-gray-700 my-8"></div>
                                            <div className="mb-8">
                                                <div className="text-gray-400 text-sm mb-4">Rango estimado para tu proyecto:</div>
                                                <div className="text-3xl lg:text-4xl font-bold mb-6">${formatNumber(getPriceRange().min)} - ${formatNumber(getPriceRange().max)}</div>
                                                <div className="text-sm text-gray-500">* Estimación basada en tus respuestas. El precio final se definirá en la consulta.</div>
                                                <div className="mt-4"><button onClick={() => setShowModal(true)} className="text-gray-400 hover:text-white transition-colors text-sm underline underline-offset-4">Puntos Clave de la Estimación</button></div>
                                            </div>
                                            <div className="border-t border-gray-700 my-8"></div>
                                            <div className="space-y-4">
                                                <button onClick={handleScheduleCall} className="w-full bg-primary text-dark font-archivo font-bold py-4 px-6 rounded-full text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-3"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/></svg>AGENDAR LLAMADA ESTRATÉGICA</button>
                                                <button onClick={() => window.location.href = 'mailto:info@antagonik.com?subject=Cotización Web&body=Hola, completé la calculadora y me interesa conocer más detalles.'} className="w-full border border-gray-600 text-gray-300 font-archivo font-bold py-4 px-6 rounded-full text-sm hover:border-gray-500 hover:text-white transition-colors flex items-center justify-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26c.67.36 1.45.36 2.12 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>CONTACTAR POR MAIL</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div ref={contentRef}>
                                            <h2 className="text-xl lg:text-2xl xl:text-3xl font-semibold text-gray-300 mb-8 leading-tight">{currentQuestionData?.question}</h2>
                                            <div className="space-y-4 mb-12">
                                                {currentOptions.map((option, index) => (
                                                    <div key={index}>
                                                        <button onClick={() => handleAnswer(option.text)} disabled={isAnimating} className={`w-full py-3 px-4 text-left border border-gray-800 rounded-full transition-all duration-200 group ${isOptionSelected(option.text) ? 'bg-gray-800/30 text-white' : 'hover:border-gray-600 text-gray-300 hover:text-white hover:bg-gray-800/20'} ${isAnimating ? 'pointer-events-none opacity-50' : ''}`}>
                                                            <div className="flex items-center justify-between">
                                                                <span className="flex-1 pr-4">{option.text}</span>
                                                                <div className="flex items-center space-x-3">
                                                                    {option.value > 0 && (<span className="text-sm text-gray-400 font-mono">+{formatNumber(option.value)}</span>)}
                                                                    {option.description && (<Tooltip content={option.description}><svg className="w-4 h-4 text-gray-400 hover:text-gray-300 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></Tooltip>)}
                                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isOptionSelected(option.text) ? 'border-primary bg-primary' : 'border-gray-600 group-hover:border-gray-500'}`}>{isOptionSelected(option.text) && (<div className="w-2 h-2 bg-gray-900 rounded-full"></div>)}</div>
                                                                </div>
                                                            </div>
                                                        </button>
                                                        {option.description && isOptionSelected(option.text) && (<div className="mt-2 px-4 py-2 bg-gray-800/50 rounded-lg border-l-4 border-gray-500 lg:hidden"><p className="text-sm text-gray-300">{option.description}</p></div>)}
                                                    </div>
                                                ))}
                                            </div>
                                            {currentQuestionData?.id === 'functionalities' && currentOptions.length > 0 && (<div className="text-sm text-gray-500 mb-8 text-center">Puedes seleccionar varias opciones</div>)}
                                            <div className="flex justify-between gap-4">
                                                <button onClick={prevStep} disabled={isAnimating || currentStep === 0} className={`px-8 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${isAnimating || currentStep === 0 ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'}`}>← ANTERIOR</button>
                                                <button onClick={nextStep} disabled={!isCurrentQuestionAnswered() || isAnimating} className={`px-8 py-3 rounded-full font-semibold text-sm transition-all duration-200 ${isCurrentQuestionAnswered() && !isAnimating ? 'bg-primary text-black hover:bg-primary/90' : 'bg-gray-800 text-gray-600 cursor-not-allowed'}`}>{currentStep === totalSteps - 1 ? 'VER RESULTADOS' : 'SIGUIENTE'} →</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ClarificationModal isOpen={showModal} onClose={() => setShowModal(false)} />
            <style jsx>{`
                @keyframes fade-in { 
                    from { opacity: 0; transform: translateY(-10px) scale(0.95); } 
                    to { opacity: 1; transform: translateY(0) scale(1); } 
                }
                .animate-fade-in { 
                    animation: fade-in 0.3s ease-out; 
                }
            `}</style>
        </div>
    );
}