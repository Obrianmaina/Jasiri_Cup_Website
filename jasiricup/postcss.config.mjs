// postcss.config.mjs
const config = {
  plugins: {
    // Corrected to use the plugin as suggested by the error message
    '@tailwindcss/postcss': {}, // This is the correct way to include Tailwind CSS as a PostCSS plugin
    autoprefixer: {}, // Autoprefixer is also commonly used with Tailwind for vendor prefixes
  },
};

export default config;
