'use client'

import { useEffect, useState } from 'react'
import { Plus, Loader2, UserX, UserCheck } from 'lucide-react'
import { buscarUsuarios } from '@/modules/usuarios/queries'
import { criarUsuario, atualizarPerfilUsuario, alternarAtivoUsuario } from '@/modules/usuarios/actions'
import type { UserProfile } from '@/modules/auth/types'

interface Usuario {
  id: string
  nome: string
  email: string
  perfil: UserProfile
  ativo: boolean
}

const PERFIS: { value: UserProfile; label: string }[] = [
  { value: 'atendente', label: 'Atendente' },
  { value: 'tecnico', label: 'Técnico' },
  { value: 'admin', label: 'Admin' },
]

const USUARIO_VAZIO = { nome: '', email: '', password: '', perfil: 'atendente' as UserProfile }

export function AbaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [mostraFormulario, setMostraFormulario] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [form, setForm] = useState(USUARIO_VAZIO)

  function carregar() {
    return buscarUsuarios()
      .then(setUsuarios)
      .catch((err) => console.error('Erro ao carregar usuários:', err))
  }

  useEffect(() => {
    carregar().finally(() => setLoading(false))
  }, [])

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!form.nome.trim() || !form.email.trim() || !form.password) {
      setErro('Preencha nome, email e senha')
      return
    }

    setSalvando(true)
    try {
      const result = await criarUsuario(form)
      if (!result.success) {
        setErro(result.error || 'Erro ao criar usuário')
        return
      }
      setForm(USUARIO_VAZIO)
      setMostraFormulario(false)
      await carregar()
    } catch (err) {
      setErro('Erro ao criar usuário')
    } finally {
      setSalvando(false)
    }
  }

  async function handleTrocarPerfil(id: string, perfil: UserProfile) {
    try {
      const result = await atualizarPerfilUsuario(id, perfil)
      if (!result.success) throw new Error(result.error)
      setUsuarios((u) => u.map((x) => (x.id === id ? { ...x, perfil } : x)))
    } catch (err) {
      console.error('Erro ao trocar perfil:', err)
    }
  }

  async function handleAlternarAtivo(id: string, ativo: boolean) {
    try {
      const result = await alternarAtivoUsuario(id, ativo)
      if (!result.success) throw new Error(result.error)
      setUsuarios((u) => u.map((x) => (x.id === id ? { ...x, ativo } : x)))
    } catch (err) {
      console.error('Erro ao alterar status:', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => setMostraFormulario(!mostraFormulario)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-orange-600/50"
        >
          <Plus size={20} />
          Novo Usuário
        </button>
      </div>

      {mostraFormulario && (
        <form onSubmit={handleCriar} className="bg-gray-900/50 rounded-xl border border-gray-700/50 p-6 space-y-4">
          <h3 className="text-lg font-bold text-orange-400">Novo Usuário</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <input
              type="text"
              placeholder="Nome *"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="password"
              placeholder="Senha *"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <select
              value={form.perfil}
              onChange={(e) => setForm({ ...form, perfil: e.target.value as UserProfile })}
              className="px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {PERFIS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <p className="text-xs text-gray-500">A senha deve ter 6+ caracteres, com ao menos 1 letra maiúscula e 1 número.</p>
          {erro && (
            <div className="p-3 bg-red-500/15 border border-red-500/50 rounded-lg text-red-400 text-sm font-medium">
              ⚠️ {erro}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
            >
              {salvando && <Loader2 size={16} className="animate-spin" />}
              {salvando ? 'Criando...' : 'Criar Usuário'}
            </button>
            <button
              type="button"
              onClick={() => setMostraFormulario(false)}
              className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-8 text-center">
          <p className="text-orange-400 font-medium">Carregando usuários...</p>
        </div>
      ) : usuarios.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-12 text-center">
          <p className="text-white text-lg font-medium">Nenhum usuário cadastrado</p>
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-xl border border-gray-700/50 shadow-2xl backdrop-blur overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-gradient-to-r from-orange-600 to-orange-500 border-b border-orange-600/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Nome</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Email</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Perfil</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Status</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-white">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/30">
              {usuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-800/30 transition-colors border-b border-gray-700/30">
                  <td className="px-6 py-4 text-sm font-medium text-orange-400">{usuario.nome}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{usuario.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={usuario.perfil}
                      onChange={(e) => handleTrocarPerfil(usuario.id, e.target.value as UserProfile)}
                      className="px-3 py-1.5 bg-gray-800/50 border border-orange-600/30 rounded text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-orange-600"
                    >
                      {PERFIS.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${usuario.ativo ? 'bg-green-950/50 border border-green-600/50 text-green-400' : 'bg-red-950/50 border border-red-600/50 text-red-400'}`}>
                      {usuario.ativo ? 'Ativo' : 'Desativado'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleAlternarAtivo(usuario.id, !usuario.ativo)}
                      className={`p-2 rounded-lg transition-colors border ${usuario.ativo ? 'text-red-500 hover:bg-red-950/30 border-red-700/30' : 'text-green-500 hover:bg-green-950/30 border-green-700/30'}`}
                      title={usuario.ativo ? 'Desativar' : 'Reativar'}
                      aria-label={`${usuario.ativo ? 'Desativar' : 'Reativar'} usuário ${usuario.nome}`}
                    >
                      {usuario.ativo ? <UserX size={18} /> : <UserCheck size={18} />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
