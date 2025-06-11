import React from 'react';

export default function PrivacyPolicy() {
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto px-6 py-40">
        <div className="relative p-12">
          {/* Disconnected borders */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Top border */}
            <div className="absolute top-0 left-4 right-4 h-[0.25px] bg-gray-800"></div>
            {/* Bottom border */}
            <div className="absolute bottom-0 left-4 right-4 h-[0.25px] bg-gray-800"></div>
            {/* Left border */}
            <div className="absolute left-0 top-4 bottom-4 w-[0.25px] bg-gray-800"></div>
            {/* Right border */}
            <div className="absolute right-0 top-4 bottom-4 w-[0.25px] bg-gray-800"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <header className="mb-16">
              <h1 className="text-4xl font-display font-semibold text-gray-400 mb-6 uppercase">
                POLÍTICA DE PRIVACIDAD Y COOKIES
              </h1>
              <p className="font-archivo text-gray-600 text-lg">
                Antagonik Estudio
              </p>
              <p className="font-archivo text-gray-600 mt-4">
                <span className="font-semibold">Última actualización:</span> {currentDate}
              </p>
            </header>

            {/* Introduction */}
            <div className="mb-12">
              <p className="font-archivo text-gray-600 leading-relaxed text-lg">
                En <strong>Antagonik Estudio</strong>, respetamos tu privacidad y nos comprometemos a proteger 
                los datos personales que compartes con nosotros a través de nuestro sitio web{' '}
                <a href="https://antagonik.com" className="text-gray-400 hover:text-gray-300 underline">
                  https://antagonik.com
                </a>.
              </p>
            </div>

            {/* Section 1: Data Controller */}
            <section className="mb-12">
              <h2 className="text-2xl font-display font-medium text-gray-400 mb-6 uppercase">
                1. RESPONSABLE DEL TRATAMIENTO DE DATOS
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="font-archivo text-gray-600">
                    <span className="font-semibold">Nombre comercial:</span> Antagonik Estudio
                  </p>
                </div>
                <div>
                  <p className="font-archivo text-gray-600">
                    <span className="font-semibold">Responsable:</span> Héctor Fabián Barriga Castellano
                  </p>
                </div>
                <div>
                  <p className="font-archivo text-gray-600">
                    <span className="font-semibold">Correo de contacto:</span>{' '}
                    <a href="mailto:info@antagonik.com" className="text-gray-400 hover:text-gray-300">
                      info@antagonik.com
                    </a>
                  </p>
                </div>
                <div>
                  <p className="font-archivo text-gray-600">
                    <span className="font-semibold">Ubicación:</span> Quito, Ecuador
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Data Collection */}
            <section className="mb-12">
              <h2 className="text-2xl font-display font-medium text-gray-400 mb-6 uppercase">
                2. DATOS QUE RECOPILAMOS
              </h2>
              <p className="font-archivo text-gray-600 leading-relaxed mb-6">
                A través del formulario de contacto de este sitio, recopilamos los siguientes datos personales:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="font-archivo text-gray-600">• Nombre</li>
                <li className="font-archivo text-gray-600">• Empresa</li>
                <li className="font-archivo text-gray-600">• Teléfono</li>
                <li className="font-archivo text-gray-600">• Correo electrónico</li>
              </ul>
              <p className="font-archivo text-gray-600 leading-relaxed">
                Estos datos son proporcionados voluntariamente por el usuario con el fin de establecer 
                contacto profesional o solicitar información sobre nuestros servicios.
              </p>
            </section>

            {/* Section 3: Purpose */}
            <section className="mb-12">
              <h2 className="text-2xl font-display font-medium text-gray-400 mb-6 uppercase">
                3. FINALIDAD DEL TRATAMIENTO
              </h2>
              <p className="font-archivo text-gray-600 leading-relaxed mb-6">
                Utilizamos los datos recopilados exclusivamente para:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="font-archivo text-gray-600">• Contactarte en respuesta a tus consultas</li>
                <li className="font-archivo text-gray-600">• Enviar información relacionada con los servicios ofrecidos</li>
                <li className="font-archivo text-gray-600">• Elaborar propuestas o presupuestos solicitados</li>
              </ul>
              <p className="font-archivo text-gray-600 leading-relaxed font-semibold">
                No utilizamos tus datos con fines publicitarios, ni los compartimos con terceros.
              </p>
            </section>

            {/* Section 4: Google Analytics */}
            <section className="mb-12">
              <h2 className="text-2xl font-display font-medium text-gray-400 mb-6 uppercase">
                4. GOOGLE ANALYTICS
              </h2>
              <p className="font-archivo text-gray-600 leading-relaxed mb-4">
                Este sitio utiliza <strong>Google Analytics</strong>, un servicio de análisis web proporcionado 
                por Google Inc., que utiliza cookies para ayudar a analizar el uso del sitio web.
              </p>
              <p className="font-archivo text-gray-600 leading-relaxed mb-4">
                La información generada por las cookies sobre tu uso del sitio web (incluyendo tu dirección IP) 
                puede ser transmitida y almacenada por Google en servidores en Estados Unidos u otros países.
              </p>
              <p className="font-archivo text-gray-600 leading-relaxed">
                Puedes leer la política de privacidad de Google aquí:{' '}
                <a 
                  href="https://policies.google.com/privacy?hl=es" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-300 underline"
                >
                  https://policies.google.com/privacy?hl=es
                </a>
              </p>
            </section>

            {/* Section 5: User Rights */}
            <section className="mb-12">
              <h2 className="text-2xl font-display font-medium text-gray-400 mb-6 uppercase">
                5. DERECHOS DEL USUARIO
              </h2>
              <p className="font-archivo text-gray-600 leading-relaxed mb-6">
                Como titular de los datos, tienes derecho a:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="font-archivo text-gray-600">• Acceder a tus datos personales</li>
                <li className="font-archivo text-gray-600">• Rectificarlos o actualizarlos</li>
                <li className="font-archivo text-gray-600">• Solicitar su eliminación</li>
                <li className="font-archivo text-gray-600">• Oponerte a su tratamiento</li>
              </ul>
              <p className="font-archivo text-gray-600 leading-relaxed">
                Para ejercer estos derechos, puedes escribir a:{' '}
                <a href="mailto:info@antagonik.com" className="text-gray-400 hover:text-gray-300 font-semibold">
                  info@antagonik.com
                </a>
              </p>
            </section>

            {/* Section 6: Security */}
            <section className="mb-12">
              <h2 className="text-2xl font-display font-medium text-gray-400 mb-6 uppercase">
                6. SEGURIDAD
              </h2>
              <p className="font-archivo text-gray-600 leading-relaxed">
                Aplicamos medidas técnicas y organizativas para proteger los datos personales contra 
                pérdida, uso indebido, acceso no autorizado o divulgación.
              </p>
            </section>

            {/* Section 7: Cookies Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-display font-medium text-gray-400 mb-6 uppercase">
                7. POLÍTICA DE COOKIES
              </h2>
              <p className="font-archivo text-gray-600 leading-relaxed mb-6">
                Nuestro sitio utiliza cookies para mejorar la experiencia del usuario y obtener estadísticas 
                de navegación mediante <strong>Google Analytics</strong>.
              </p>
              <p className="font-archivo text-gray-600 leading-relaxed mb-6">
                Una <strong>cookie</strong> es un pequeño archivo de texto que un sitio web guarda en tu 
                navegador cuando lo visitas. Estas cookies pueden recopilar datos como la dirección IP, 
                tipo de navegador, páginas visitadas, etc.
              </p>
              <p className="font-archivo text-gray-600 leading-relaxed">
                Puedes configurar tu navegador para bloquear o eliminar las cookies si así lo deseas. 
                Ten en cuenta que esto puede afectar el funcionamiento de ciertas partes del sitio.
              </p>
            </section>

            {/* Section 8: Policy Changes */}
            <section className="mb-16">
              <h2 className="text-2xl font-display font-medium text-gray-400 mb-6 uppercase">
                8. CAMBIOS EN ESTA POLÍTICA
              </h2>
              <p className="font-archivo text-gray-600 leading-relaxed">
                Nos reservamos el derecho de modificar esta política para adaptarla a cambios legislativos 
                o de funcionamiento del sitio. Te recomendamos revisarla periódicamente.
              </p>
            </section>

            {/* Contact Footer */}
            <footer className="pt-8 border-t border-gray-800">
              <div className="text-center">
                <h3 className="text-2xl font-display text-gray-400 mb-4 uppercase">¿TIENES PREGUNTAS?</h3>
                <p className="font-archivo text-gray-600 mb-6 leading-relaxed">
                  Si tienes alguna duda sobre esta política de privacidad, no dudes en contactarnos.
                </p>
                <a 
                  href="mailto:info@antagonik.com"
                  className="font-archivo text-gray-400 hover:text-gray-300 underline text-lg"
                >
                  info@antagonik.com
                </a>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}