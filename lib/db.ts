import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

// Initialize the pool only on the server side
if (typeof window === 'undefined') {
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vendor_management',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
}

// Test database connection
async function testConnection() {
  if (!pool) return;
  
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

// Get a connection from the pool
async function getConnection() {
  if (!pool) {
    throw new Error('Database connections are not available on the client side');
  }
  return await pool.getConnection();
}

// Execute a query
async function query(sql: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database queries are not available on the client side');
  }
  const [rows] = await pool.execute(sql, params);
  return rows;
}

// Execute a query and return the result with connection for API routes
async function execute(sql: string, params?: any[]) {
  if (!pool) {
    throw new Error('Database queries are not available on the client side');
  }
  return await pool.execute(sql, params);
}

export { getConnection, query, execute, testConnection };
