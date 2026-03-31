import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

async function createTestUser() {
  try {
    // Criar usuário de teste
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
      console.error('Erro ao criar usuário:', error)
      return
    }

    console.log('✅ Usuário criado com sucesso!')
    console.log('Email: test@blacktech.com')
    console.log('Senha: Black@Tech123')
    console.log('User ID:', data.user?.id)
  } catch (err) {
    console.error('Erro:', err)
  }
}

createTestUser()
