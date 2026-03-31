const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Ler .env.local
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')

// Parse .env.local
const env = {}
envContent.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=')
    env[key.trim()] = valueParts.join('=').trim()
  }
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
)

async function createTestUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'test@blacktech.com',
      password: 'Black@Tech123',
      email_confirm: true,
      user_metadata: {
        nome: 'Usuário Teste',
        role: 'tecnico'
      }
    })

    if (error) {
      console.error('Erro ao criar usuário:', error.message)
      return
    }

    console.log('✅ Usuário criado com sucesso!')
    console.log('Email: test@blacktech.com')
    console.log('Senha: Black@Tech123')
    console.log('User ID:', data.user?.id)
  } catch (err) {
    console.error('Erro:', err.message)
  }
}

createTestUser()
