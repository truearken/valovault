import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

export default [
  // Global ignores
  {
    ignores: [
        "node_modules/**",
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "src-tauri/**",
    ],
  },

  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript specific configuration
  ...tseslint.configs.recommended,

  // React specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    ...pluginReact.configs.flat.recommended,
    plugins: {
      'react-hooks': pluginReactHooks,
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },

  // Next.js specific configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      "@next/next/no-img-element": "off"
    },
  },
];