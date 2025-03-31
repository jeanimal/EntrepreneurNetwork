import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { log } from './vite';

const { Pool } = pg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test the database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    log('Database connection successful', 'database');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
}

// Initialize the database connection
export async function initDatabase() {
  const connected = await testConnection();
  if (!connected) {
    log('Failed to connect to the database. Please check your connection string.', 'database');
    process.exit(1);
  }
  return drizzle(pool);
}

// Export the database client
export const db = drizzle(pool);