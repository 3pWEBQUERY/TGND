import { PrismaClient } from '@prisma/client';

// PrismaClient Singleton
declare global {
  var prisma: PrismaClient | undefined;
}

// Direkter Verbindungsstring (nur für Entwicklung, in Produktion immer env-Variablen verwenden)
const neonDbUrl = process.env.DATABASE_URL || 'postgresql://TheGirlNextDoor_owner:npg_7zL4osPIfGNn@ep-late-union-a2mxt6b9-pooler.eu-central-1.aws.neon.tech/TheGirlNextDoor?sslmode=require';

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
