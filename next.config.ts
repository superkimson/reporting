import type { NextConfig } from "next";

// Tout est self-hosted (polices via next/font, pas de CDN externe, pas de
// script tiers) : une CSP restreinte à 'self' est possible sans rien casser.
// 'unsafe-inline' reste nécessaire pour les scripts d'hydratation/thème de
// Next.js et les styles inline générés par React — un vrai durcissement
// nonce-based demanderait un middleware, hors scope pour l'instant.
// React/Next.js dev mode utilise eval() pour le Fast Refresh et les stack
// traces — jamais en production, donc l'assouplissement reste local au dev.
const scriptSrc =
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

const contentSecurityPolicy = [
  "default-src 'self'",
  scriptSrc,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: contentSecurityPolicy },
        ],
      },
    ];
  },
};

export default nextConfig;
