/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    // Agregado para mejor purging
    "./public/**/*.html",
  ],
  
  // REMOVIDO: mode ya no es necesario en Tailwind CSS 3.x+
  // Next.js 15 maneja automáticamente JIT
  
  theme: {
    extend: {
      colors: {
        gray: {
          900: "#1C1C1C",
          800: "#2D3036", 
          700: "#565A63",
          600: "#808591",
          500: "#A0A5B1",
          400: "#B6BCC7",
          300: "#CACFDB",
          200: "#D9DEE5",
          100: "#ECEFF4",
        },
        emerald: {
          400: "#34d399",
        },
        primary: "#FF5741",
        dark: "#000000",
      },
      fontFamily: {
        display: ["Clash Display", "sans-serif"], 
        poppins: ["Poppins", "sans-serif"], 
        archivo: ["Archivo", "sans-serif"],
      },
      // Optimizaciones específicas para animaciones
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      // Spacing optimizado para tu diseño
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      // Tamaños de contenedor específicos
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
      },
    },
  },
  
  // SIMPLIFICADO: Configuración de corePlugins más práctica
  // Solo desactiva lo que realmente no usas
  corePlugins: {
    preflight: true,
    container: false, // Si no usas container de Tailwind
    // Desactivar solo features que definitivamente no usas
    backgroundAttachment: false, // bg-fixed raramente usado
    float: false, // Float layouts obsoletos
    clear: false, // Va con float
    listStylePosition: false, // Si no usas listas con estilos
    listStyleType: false,
    overscrollBehavior: false, // Scroll behaviors específicos
    resize: false, // Resize de elementos
    skew: false, // Transformaciones skew
    tableLayout: false, // Si no usas tablas
    textIndent: false, // Indentación de texto
    verticalAlign: false, // Vertical align (no necesario con flexbox/grid)
  },
  
  plugins: [
    // Plugin personalizado para utilidades específicas de tu sitio
    function({ addUtilities }) {
      const newUtilities = {
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.bg-gradient-radial': {
          'background-image': 'radial-gradient(circle, var(--tw-gradient-stops))',
        },
        '.bg-gradient-conic': {
          'background-image': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        },
        // Utilidades para animaciones smooth
        '.animate-in': {
          'animation-fill-mode': 'both',
        },
        '.animate-out': {
          'animation-fill-mode': 'both',
          'animation-direction': 'reverse',
        },
      }
      addUtilities(newUtilities)
    }
  ],
  
  // Configuración de safelist simplificada
  safelist: [
    // Solo las clases que realmente se generan dinámicamente
    'animate-pulse',
    'animate-spin',
    'animate-bounce',
    'bg-primary',
    'text-primary',
    'border-primary',
    // Estados de animación comunes
    'opacity-0',
    'opacity-100',
    'translate-y-0',
    'translate-y-4',
    'scale-95',
    'scale-100',
  ],
}