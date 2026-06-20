import { defineConfig } from 'vitest/config';

/**
 * Config de tests de la web. Por ahora cubre lógica pura (validators); el entorno
 * `node` basta porque no se renderizan componentes. Excluimos node_modules y el
 * build de Next.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules', '.next'],
  },
});
