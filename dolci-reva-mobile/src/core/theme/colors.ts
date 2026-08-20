/**
 * Mêmes valeurs que tailwind.config.js (theme.*) et que
 * dolci-reva-web/app/globals.css, exposées en constantes JS pour les cas où
 * une className Tailwind ne suffit pas (ex: prop `color` d'une icône lucide,
 * `StatusBar`, `tintColor` natif).
 */
export const colors = {
  primary: '#f08400',
  secondary: '#12100c',
  accent: '#ff6b35',
  warm: '#ff8c42',
  cool: '#4a90e2',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  white: '#ffffff',
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
} as const;
