/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './public/**/*.html',
  ],
  theme: {
    extend: {
      colors: {
        // Terminal Grounds Color System
        primary: {
          DEFAULT: '#00ff88',
          dark: '#00cc6a',
          light: '#33ffaa',
        },
        secondary: {
          DEFAULT: '#ff6b35',
          dark: '#e55a2b',
          light: '#ff8859',
        },
        accent: {
          blue: '#0077ff',
          purple: '#8b5cf6',
          cyan: '#00ffff',
          magenta: '#ff00ff',
        },
        // Faction Colors (Official Palettes)
        faction: {
          directorate: '#0099cc',
          free77: '#ff4444', 
          'iron-scavengers': '#ffaa00',
          'corporate-hegemony': '#0077ff',
          'nomad-clans': '#8b5a2b',
          'archive-keepers': '#8b5cf6',
          'civic-wardens': '#27ca3f',
        },
        // Background System
        bg: {
          primary: '#0a0a0a',
          secondary: '#1a1a1a',
          tertiary: '#2a2a2a',
          glass: 'rgba(15, 15, 25, 0.9)',
        },
        text: {
          primary: '#ffffff',
          secondary: '#cccccc',
          muted: '#888888',
        },
        border: {
          DEFAULT: '#333333',
          light: '#555555',
          accent: '#00ff88',
        }
      },
      fontFamily: {
        'display': ['Orbitron', 'monospace'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'glitch': 'glitch 1s linear infinite',
        'particle-drift': 'particle-drift 4s ease-in-out infinite',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'scale-in': 'scale-in 0.5s ease-out forwards',
      },
      keyframes: {
        'pulse-glow': {
          '0%': { 
            boxShadow: '0 0 5px rgb(0 255 136 / 0.5), 0 0 10px rgb(0 255 136 / 0.3), 0 0 15px rgb(0 255 136 / 0.2)' 
          },
          '100%': { 
            boxShadow: '0 0 10px rgb(0 255 136 / 0.8), 0 0 20px rgb(0 255 136 / 0.5), 0 0 30px rgb(0 255 136 / 0.3)' 
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' }
        },
        'particle-drift': {
          '0%, 100%': { transform: 'translateX(0px) translateY(0px)' },
          '25%': { transform: 'translateX(10px) translateY(-5px)' },
          '50%': { transform: 'translateX(-5px) translateY(-10px)' },
          '75%': { transform: 'translateX(-10px) translateY(5px)' }
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      backgroundImage: {
        'gradient-cyber': 'linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))',
        'grid-pattern': "url('data:image/svg+xml,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\"><defs><pattern id=\"grid\" width=\"10\" height=\"10\" patternUnits=\"userSpaceOnUse\"><path d=\"M 10 0 L 0 0 0 10\" fill=\"none\" stroke=\"%23333\" stroke-width=\"0.5\"/></pattern></defs><rect width=\"100\" height=\"100\" fill=\"url(%23grid)\"/></svg>')",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 255, 136, 0.3)',
        'glow-lg': '0 0 40px rgba(0, 255, 136, 0.4)',
        'neon': '0 0 5px currentColor, 0 0 10px currentColor, 0 0 15px currentColor',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}