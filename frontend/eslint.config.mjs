import nextPlugin from '@next/eslint-plugin-next';

export default [
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
    nextPlugin.configs.recommended,
    nextPlugin.configs['core-web-vitals'],
    {
        rules: {
            "@next/next/no-img-element": "off"
        },
    },
];
