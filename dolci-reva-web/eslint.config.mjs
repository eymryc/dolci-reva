import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Sans ce bloc, ESLint lint aussi la sortie compilée de .next/build
  // (JS minifié/transformé par le bundler) : à elle seule elle produisait
  // plus de 30 000 erreurs et rendait `npm run lint` inexploitable comme
  // signal de qualité (cf. audit du 10/07/2026).
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "coverage/**",
      // Généré automatiquement par Next.js, jamais édité à la main.
      "next-env.d.ts",
      // Config Jest : le require() CommonJS est le patron officiel documenté
      // par Next.js (next/jest), pas quelque chose à réécrire en ESM ici.
      "jest.config.js",
      // Fichier de référence : exemples de shapes de réponse API à but
      // documentaire, volontairement non importés ailleurs dans le code.
      "types/api-response.example.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
