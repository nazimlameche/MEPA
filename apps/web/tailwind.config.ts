import type { Config } from 'tailwindcss';
import { baseConfig } from '@ai-edu/config/tailwind/base';

const config: Config = {
  ...baseConfig,
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  plugins: [],
};

export default config;
