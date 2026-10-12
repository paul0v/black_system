'use client'

// Grade de desenho/exibição do padrão de desbloqueio (estilo Android, 3x3 pontos)

import { useState } from 'react'

const POSICOES = [
  [16, 16], [50, 16], [84, 16],
  [16, 50], [50, 50], [84, 50],
  [16, 84], [50, 84], [84, 84],
]

function parseSequencia(valor: string): number[] {
  return valor
    .split(',')
    .map((v) => Number(v.trim()))
    .filter((n) => Number.isInteger(n) && n >= 0 && n <= 8)
}

export function PatternLockInput({
  value,
  onChange,
}: {
  value: string
  onChange: (valor: string) => void
}) {
  const [sequencia, setSequencia] = useState<number[]>(parseSequencia(value))

  const handleClickPonto = (indice: number) => {
    if (sequencia.includes(indice)) return
    const nova = [...sequencia, indice]
    setSequencia(nova)
    onChange(nova.join(','))
  }

  const handleLimpar = () => {
    setSequencia([])
    onChange('')
  }

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="w-32 h-32 bg-gray-800/50 border border-orange-600/30 rounded-lg">
        {sequencia.slice(1).map((indice, i) => {
          const [x1, y1] = POSICOES[sequencia[i]]
          const [x2, y2] = POSICOES[indice]
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f97316" strokeWidth={3} />
        })}
        {POSICOES.map(([cx, cy], indice) => (
          <circle
            key={indice}
            cx={cx}
            cy={cy}
            r={8}
            className={sequencia.includes(indice) ? 'fill-orange-500' : 'fill-gray-600 hover:fill-gray-500'}
            style={{ cursor: 'pointer' }}
            onClick={() => handleClickPonto(indice)}
          />
        ))}
      </svg>
      <button
        type="button"
        onClick={handleLimpar}
        className="px-3 py-1.5 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
      >
        Limpar
      </button>
    </div>
  )
}

export function PatternLockDisplay({ value }: { value: string }) {
  const sequencia = parseSequencia(value)

  if (sequencia.length === 0) {
    return <p className="text-gray-500 text-sm">Padrão não informado</p>
  }

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 bg-gray-800/50 border border-gray-700 rounded-lg">
      {sequencia.slice(1).map((indice, i) => {
        const [x1, y1] = POSICOES[sequencia[i]]
        const [x2, y2] = POSICOES[indice]
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#f97316" strokeWidth={3} />
      })}
      {POSICOES.map(([cx, cy], indice) => (
        <circle key={indice} cx={cx} cy={cy} r={8} className={sequencia.includes(indice) ? 'fill-orange-500' : 'fill-gray-600'} />
      ))}
    </svg>
  )
}
