import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import path from 'path';

const generatePrismaClient = () => {
  try {
    const schemaPath = path.resolve(__dirname, '../../prisma/schema.prisma');
    console.log('[Prisma] Running prisma generate (schema:', schemaPath, ')');
    execSync(`npx prisma generate --schema="${schemaPath}"`, {
      stdio: 'inherit',
      cwd: path.resolve(__dirname, '../../'),
    });
    console.log('[Prisma] Generation complete');
  } catch (error) {
    console.error('[Prisma] Failed to generate client:', error);
  }
};

let prisma: PrismaClient;

try {
  prisma = new PrismaClient();
} catch (error: any) {
  if (error?.message?.includes('Prisma has detected that this project was built on Vercel')) {
    console.warn('[Prisma] Outdated / missing client detected. Generating now...');
    generatePrismaClient();
    prisma = new PrismaClient();
  } else {
    throw error;
  }
}

export default prisma;
