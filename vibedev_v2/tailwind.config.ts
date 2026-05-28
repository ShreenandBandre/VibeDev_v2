import type { Config } from "tailwindcss";

const config: Config = {
  // ... rest of your existing configuration maps
  plugins: [
    // 🚀 FIXED: Set parameter type inline to 'any' to bypass missing module lookups entirely
    function ({ addUtilities }: any) {
      addUtilities({
        '.scrollbar-none': {
          '-ms-overflow-style': 'none', /* IE and Edge */
          'scrollbar-width': 'none',    /* Firefox */
          '&::-webkit-scrollbar': {
            'display': 'none'           /* Chrome, Safari and Opera */
          }
        }
      });
    }
  ],
};

export default config;