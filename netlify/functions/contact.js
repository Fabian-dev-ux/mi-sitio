// netlify/functions/contact.js
exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parsear los datos del formulario
    const data = JSON.parse(event.body);
    
    // Validar campos requeridos
    if (!data.nombre || !data.email || !data.telefono) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Campos requeridos faltantes',
          details: 'Nombre, email y teléfono son obligatorios'
        })
      };
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Email inválido',
          details: 'Por favor, proporciona un email válido'
        })
      };
    }

    // Aquí puedes integrar con servicios de email como:
    // - SendGrid
    // - Resend
    // - Nodemailer
    // - O simplemente guardar en una base de datos

    console.log('Datos del formulario recibidos:', {
      nombre: data.nombre,
      email: data.email,
      telefono: data.telefono,
      empresa: data.empresa || 'No especificada',
      mensaje: data.mensaje || 'Sin mensaje',
      intereses: data.intereses || []
    });

    // Por ahora, simulamos éxito
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Formulario enviado correctamente' 
      })
    };

  } catch (error) {
    console.error('Error processing form:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Error interno del servidor',
        details: 'No se pudo procesar el formulario'
      })
    };
  }
};