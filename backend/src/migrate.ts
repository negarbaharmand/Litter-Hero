import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const client = postgres(connectionString, { max: 1 });
const db = drizzle(client);

console.log('Running migrations...');

migrate(db, { migrationsFolder: './drizzle' })
  .then(() => {
    console.log('Migrations complete');
    return client.end();
  })
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Migration failed:', err);
    client.end().finally(() => process.exit(1));
  });
