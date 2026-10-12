import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.ts'],
    // Testes de integração têm config própria (vitest.integration.config.mts) e
    // precisam do emulador do Firestore rodando — não entram no `npm test` normal.
    exclude: ['node_modules', '.next', '**/*.integration.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
