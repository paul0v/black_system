'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface ModalClienteExistenteProps {
  isOpen: boolean
  onExistente: () => void
  onNovo: () => void
  onClose: () => void
}

export function ModalClienteExistente({
  isOpen,
  onExistente,
  onNovo,
  onClose,
}: ModalClienteExistenteProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-lg font-semibold">Novo Cliente?</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">O cliente já tem cadastro em nosso sistema?</p>

          <div className="flex flex-col gap-3">
            <button
              onClick={onExistente}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Sim, já tem cadastro
            </button>
            <button
              onClick={onNovo}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition"
            >
              Não, é novo cliente
            </button>
            <button
              onClick={onClose}
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
