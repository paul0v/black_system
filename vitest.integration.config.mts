import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.integration.test.ts'],
    exclude: ['node_modules', '.next'],
    testTimeout: 20000,
    hookTimeout: 20000,
    // Todos os arquivos de teste de integração compartilham o MESMO emulador
    // do Firestore — rodar em paralelo faz um arquivo limpar o banco no meio
    // da execução de outro. Roda tudo sequencial (arquivos e testes).
    fileParallelism: false,
    sequence: { concurrent: false },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
})
