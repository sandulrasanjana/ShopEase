import fs from 'fs';
import path from 'path';
import { pool } from './db.js';

export const runSeedData = async () => {
  console.log('Running database seeding...');
  const seedPath = path.resolve(process.cwd(), '../database/seed.sql');
  const fallbackPath = path.resolve(process.cwd(), 'database/seed.sql');

  const targetPath = fs.existsSync(seedPath) ? seedPath : fallbackPath;

  if (!fs.existsSync(targetPath)) {
    throw new Error(`seed.sql not found at ${seedPath} or ${fallbackPath}`);
  }

  const sql = fs.readFileSync(targetPath, 'utf-8');
  await pool.query(sql);
  console.log('Database seeded successfully!');
};

if (process.argv[1]?.endsWith('seedDb.ts') || process.argv[1]?.endsWith('seedDb.js')) {
  runSeedData()
    .then(() => {
      console.log('Database seeding completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

