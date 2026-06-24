const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'property_portal',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'your_password_here',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    return true;
  } catch (err) {
  console.error('❌ Database connection failed');
  console.error('Message:', err.message);
  console.error('Code:', err.code);
  console.error('Detail:', err.detail);
  console.error('Stack:', err.stack);
  return false;

console.log("HOST:", process.env.DB_HOST);
console.log("PORT:", process.env.DB_PORT);
console.log("DATABASE:", process.env.DB_NAME);
console.log("USER:", process.env.DB_USER);
  }
};

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text: text.substring(0, 80), duration, rows: result.rowCount });
  return result;
};

// Get client for transactions
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
};