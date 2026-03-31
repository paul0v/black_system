import * as fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltam credenciais Supabase em .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function executeMigration(filePath: string, name: string) {
  try {
    console.log(`\n⏳ Executando ${name}...`)
    const sql = fs.readFileSync(filePath, 'utf-8')

    const { error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      // Tentar executar direto via HTTP (sem RPC)
      console.log('   Tentando método alternativo...')
      const response = await fetch(`${supabaseUrl}/rest/v1/sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }
    }

    console.log(`✅ ${name} executada com sucesso!`)
    return true
  } catch (error) {
    console.error(`❌ Erro ao executar ${name}:`, error)
    return false
  }
}

async function runMigrations() {
  console.log('🚀 Iniciando migrações Supabase...')
  console.log(`📦 Banco: ${supabaseUrl}`)

  const migrations = [
    { file: 'supabase/migrations/001_init.sql', name: 'Migration 001 (Tabelas)' },
    { file: 'supabase/migrations/002_rls.sql', name: 'Migration 002 (Row Level Security)' },
    { file: 'supabase/migrations/003_triggers.sql', name: 'Migration 003 (Triggers)' },
  ]

  let successCount = 0

  for (const migration of migrations) {
    const filePath = path.join(process.cwd(), migration.file)
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Arquivo não encontrado: ${filePath}`)
      continue
    }

    if (await executeMigration(filePath, migration.name)) {
      successCount++
    }
  }

  console.log(`\n${'='.repeat(50)}`)
  console.log(`✅ ${successCount}/3 migrações completadas!`)
  console.log(`\n🎉 Seu banco de dados está pronto!`)
  console.log(`\n📝 Próximo passo: npm run dev`)
}

runMigrations()
