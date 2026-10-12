// Redimensiona e comprime uma imagem no navegador (via canvas) antes de
// converter para base64 — usado tanto no upload de fotos de equipamento
// quanto no upload da logo da empresa em Configurações.
export function comprimirImagem(
  file: File,
  opcoes: { maxLargura?: number; qualidade?: number; formato?: 'image/jpeg' | 'image/png' } = {}
): Promise<string> {
  const { maxLargura = 1024, qualidade = 0.7, formato = 'image/jpeg' } = opcoes

  return new Promise((resolve, reject) => {
    const leitor = new FileReader()
    leitor.onload = () => {
      const img = new Image()
      img.onload = () => {
        const escala = Math.min(1, maxLargura / img.width)
        const canvas = document.createElement('canvas')
        canvas.width = img.width * escala
        canvas.height = img.height * escala
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas não suportado'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL(formato, qualidade))
      }
      img.onerror = reject
      img.src = leitor.result as string
    }
    leitor.onerror = reject
    leitor.readAsDataURL(file)
  })
}
