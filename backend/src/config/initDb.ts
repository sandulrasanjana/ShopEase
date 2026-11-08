import fs from 'fs';
import path from 'path';
import { pool } from './db.js';

export const runSchemaMigration = async () => {
  console.log('Running database schema migration...');
  const schemaPath = path.resolve(process.cwd(), '../database/schema.sql');
  const fallbackPath = path.resolve(process.cwd(), 'database/schema.sql');
  
  const targetPath = fs.existsSync(schemaPath) ? schemaPath : fallbackPath;
  
  if (!fs.existsSync(targetPath)) {
    throw new Error(`schema.sql not found at ${schemaPath} or ${fallbackPath}`);
  }

  const sql = fs.readFileSync(targetPath, 'utf-8');
  await pool.query(sql);
  console.log('Database schema created successfully!');
};

if (process.argv[1]?.endsWith('initDb.ts') || process.argv[1]?.endsWith('initDb.js')) {
  runSchemaMigration()
    .then(() => {
      console.log('Schema migration completed.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

