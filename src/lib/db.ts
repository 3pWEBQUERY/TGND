import { PrismaClient } from '@prisma/client';

// PrismaClient Singleton
declare global {
  var prisma: PrismaClient | undefined;
}

// Direkter Verbindungsstring (nur für Entwicklung, in Produktion immer env-Variablen verwenden)
const neonDbUrl = process.env.DATABASE_URL;

export const db = globalThis.prisma || new PrismaClient({
  datasources: {
    db: {
      url: neonDbUrl
    }
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
