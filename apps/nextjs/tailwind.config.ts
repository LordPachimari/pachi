import type { Config } from 'tailwindcss'

import baseConfig from '@pachi/tailwind-config'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  //@ts-ignore
  presets: [baseConfig],
} satisfies Config
