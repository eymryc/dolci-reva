/**
 * Tokens de couleur repris tels quels de dolci-reva-web/app/globals.css (@theme)
 * pour garder une identité visuelle strictement identique entre web et mobile.
 */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        theme: {
          primary: '#f08400',
          secondary: '#12100c',
          accent: '#ff6b35',
          warm: '#ff8c42',
          cool: '#4a90e2',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        rajdhani: ['Rajdhani_400Regular'],
        'rajdhani-medium': ['Rajdhani_500Medium'],
        'rajdhani-semibold': ['Rajdhani_600SemiBold'],
        'rajdhani-bold': ['Rajdhani_700Bold'],
      },
    },
  },
  plugins: [],
};
