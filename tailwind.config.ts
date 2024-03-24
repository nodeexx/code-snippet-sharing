import { skeleton } from '@skeletonlabs/tw-plugin';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import { join } from 'path';
import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config = {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    join(
      require.resolve('@skeletonlabs/skeleton'),
      '../**/*.{html,js,svelte,ts}',
    ),
  ],
  plugins: [
    forms,
    typography,
    // @ts-ignore
    skeleton({
      themes: { preset: [{ name: 'wintry', enhancements: true }] },
    }),
  ],
  theme: {
    screens: {
      /**
       * # Custom breakpoints
       * https://www.notion.so/General-Solution-design-UX-UI-ccc77160621a437d917ab1bd64b9da1a?pvs=4#f7a2509578e2465c9c83a6f7f86e6980
       */
      sm: '768px',
      md: '1280px',
      lg: '1440px',
      xl: '1920px',
    },
    extend: {
      accentColor: {
        /**
         * # Skeleton accent color design tokens
         * https://www.skeleton.dev/docs/tokens#accent
         */
      },
      backgroundColor: {
        /**
         * # Skeleton background color design tokens
         * https://www.skeleton.dev/docs/tokens#backgrounds
         * https://www.skeleton.dev/docs/themes#backgrounds
         */
        'primary-500-400-10-token': 'rgb(var(--color-primary-500) / 0.1)',
      },
      borderColor: {
        /**
         * # Skeleton border color design tokens
         * https://www.skeleton.dev/docs/tokens#borders
         */
      },
      borderRadius: {
        /**
         * # Skeleton border radius design tokens
         * https://www.skeleton.dev/docs/tokens#border-radius
         */
      },
      borderWidth: {
        /**
         * # Skeleton border width design tokens
         * https://www.skeleton.dev/docs/tokens#borders
         */
      },
      boxShadow: {
        xl: defaultTheme.boxShadow.xl,
      },
      colors: {
        /**
         * # Skeleton colors
         * https://www.skeleton.dev/docs/colors
         */
      },
      fill: {
        /**
         * # Skeleton fill color design tokens
         * https://www.skeleton.dev/docs/tokens#svg-fill-color
         */
      },
      fontFamily: {
        /**
         * # Skeleton font family design tokens
         * https://www.skeleton.dev/docs/tokens#text
         */
        'mono-token': ['Source Code Pro', ...defaultTheme.fontFamily.mono],
      },
      fontSize: {
        /**
         * # Skeleton typography classes
         * https://www.skeleton.dev/elements/typography
         */
        sm: [
          '0.875rem', // 14px, if 1rem = 16px
          {
            lineHeight: '1.25rem', // 20px, if 1rem = 16px
          },
        ],
        base: [
          '1rem', // 16px, if 1rem = 16px
          {
            lineHeight: '1.5rem', // 24px, if 1rem = 16px
          },
        ],
        lg: [
          '1.125rem', // 18px, if 1rem = 16px
          {
            lineHeight: '1.75rem', // 28px, if 1rem = 16px
          },
        ],
        xl: [
          '1.25rem', // 20px, if 1rem = 16px
          {
            lineHeight: '1.75rem', // 28px, if 1rem = 16px
          },
        ],
        '2xl': [
          '1.5rem', // 24px, if 1rem = 16px
          {
            lineHeight: '2rem', // 32px, if 1rem = 16px
          },
        ],
        '3xl': [
          '1.875rem', // 30px, if 1rem = 16px
          {
            lineHeight: '2.25rem', // 36px, if 1rem = 16px
          },
        ],
        '4xl': [
          '2.25rem', // 36px, if 1rem = 16px
          {
            lineHeight: '2.5rem', // 40px, if 1rem = 16px
          },
        ],
        '5xl': [
          '3rem', // 48px, if 1rem = 16px
          {
            lineHeight: '1',
          },
        ],
      },
      ringColor: {
        /**
         * # Skeleton ring color design tokens
         * https://www.skeleton.dev/docs/tokens#rings
         */
      },
      spacing: {
        2: '0.5rem', // 8px, if 1rem = 16px
        2.5: '0.625rem', // 10px, if 1rem = 16px
        4: '1rem', // 16px, if 1rem = 16px
        5: '1.25rem', // 20px, if 1rem = 16px
        8: '2rem', // 32px, if 1rem = 16px
        10: '2.5rem', // 40px, if 1rem = 16px
      },
      textColor: {
        /**
         * # Skeleton text color design tokens
         * https://www.skeleton.dev/docs/tokens#text
         */
      },
      zIndex: {
        popup: '100',
      },
    },
  },
} satisfies Config;

export default config;
