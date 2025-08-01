/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Include if you have a `pages` directory
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // **CRUCIAL: This line ensures Tailwind scans your 'src' folder**
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
