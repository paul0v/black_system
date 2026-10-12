import type { NextConfig } from "next";

// 'unsafe-inline' em script-src é necessário porque o próprio Next.js injeta
// scripts inline (hidratação/dados da página) em toda página — sem isso a
// página carrega mas o React nunca liga os event handlers (nada reage a
// clique). Em dev também precisa de 'unsafe-eval' (React Refresh/HMR).
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  allowedDevOrigins: ["192.168.1.4", "192.168.1.5"],
  // firebase-admin (via jwks-rsa -> jose) tem um submódulo ESM-only que o
  // bundler do Next (Turbopack) não consegue empacotar corretamente — isso
  // quebra em produção com "ERR_REQUIRE_ESM". Pedindo pro Next não empacotar
  // esse pacote (usar ele direto do node_modules em runtime) resolve.
  serverExternalPackages: ["firebase-admin"],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: CSP },
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' }]
            : []),
        ],
      },
    ];
  },
};

export default nextConfig;
