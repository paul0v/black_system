// Erros de domínio: representam falhas de regra de negócio, não de infraestrutura.
// Use cases lançam esses erros; os controllers (Server Actions) os traduzem pra
// {success:false, error} sem precisar saber de Firestore, HTTP, etc.
export class DomainError extends Error {}

export class NaoEncontradoError extends DomainError {
  constructor(entidade: string) {
    super(`${entidade} não encontrado`)
  }
}

export class TransicaoInvalidaError extends DomainError {}

export class EstoqueInsuficienteError extends DomainError {}

export class ValidacaoError extends DomainError {}

export class PermissaoNegadaError extends DomainError {}
