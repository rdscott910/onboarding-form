import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      backgroundColor: {
        'page-bg': '#111521',
        'input-bg': '#002357',
        'button-primary': '#2563EB',
        'button-hover': '#1D4ED8',
      },
      textColor: {
        primary: '#FFFFFF',
        secondary: '#9CA3AF',
        'button-text': '#FFFFFF',
      },
      borderColor: {
        input: '#1F2937',
      },
      fontSize: {
        'form-heading': ['32px', '40px'],
      },
      maxWidth: {
        'form-container': '460px',
      },
    },
  },
  plugins: [],
};

export default config;
