const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
});

pool.on('connect', () => {
  console.log('✅ Connected to Supabase PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ DB Error:', err.message);
  } else {
    console.log('✅ DB Connected:', res.rows[0]);
  }
});
module.exports = pool;
