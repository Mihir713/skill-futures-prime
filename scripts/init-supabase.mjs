// Run Supabase schema SQL
import pg from "pg"

const pool = new pg.Pool({
  host: process.env.SUPABASE_DB_HOST || "",
  port: 6543,
  database: process.env.SUPABASE_DB_NAME || "postgres",
  user: process.env.SUPABASE_DB_USER || "",
  password: process.env.SUPABASE_DB_PASSWORD || "",
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
})

const sql = `
CREATE TABLE IF NOT EXISTS talentmkt_users (
  id text PRIMARY KEY,
  name text NOT NULL,
  email text,
  university text,
  program text,
  grad_year text,
  specialization text,
  coop_count int DEFAULT 0,
  courses jsonb DEFAULT '[]'::jsonb,
  employer text,
  bucket_id text,
  erc8004 text UNIQUE,
  wallet_balance float DEFAULT 0,
  joined_at bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint
);

CREATE TABLE IF NOT EXISTS credentials (
  id SERIAL PRIMARY KEY,
  user_id text REFERENCES talentmkt_users(id),
  type text NOT NULL,
  issuer text,
  status text DEFAULT 'pending',
  hash text,
  uploaded_at bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint
);

CREATE TABLE IF NOT EXISTS buckets (
  id text PRIMARY KEY,
  label text,
  category text,
  region text DEFAULT 'Ontario',
  grad_year text,
  price float DEFAULT 0.5,
  student_count int DEFAULT 0,
  volume24h float DEFAULT 0,
  holders int DEFAULT 0,
  history jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_txs (
  id text PRIMARY KEY,
  user_id text REFERENCES talentmkt_users(id),
  type text,
  amount float,
  bucket_id text,
  shares int,
  timestamp bigint DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::bigint,
  note text
);

CREATE TABLE IF NOT EXISTS positions (
  id SERIAL PRIMARY KEY,
  user_id text REFERENCES talentmkt_users(id),
  bucket_id text,
  shares int DEFAULT 0,
  avg_price float DEFAULT 0,
  total_invested float DEFAULT 0
);

-- Seed buckets
INSERT INTO buckets (id, label, category, grad_year, price, history) VALUES
  ('ELECENG_RF_Ontario_2028_COOP', 'RF Engineering — $75k+ by 2028', 'ELECENG', '2028', 0.35, '[0.28,0.29,0.31,0.33,0.34,0.35]'),
  ('ELECENG_POWER_Ontario_2028_COOP', 'Power Engineering — $80k+ by 2028', 'ELECENG', '2028', 0.22, '[0.20,0.21,0.22,0.21,0.22,0.22]'),
  ('COMPENG_SOFTWARE_Ontario_2028_COOP', 'Software Engineering — $100k+ by 2028', 'COMPENG', '2028', 0.61, '[0.55,0.57,0.59,0.60,0.61,0.61]'),
  ('COMPENG_AI_Ontario_2028_COOP', 'AI/ML Engineering — $130k+ by 2028', 'COMPENG', '2028', 0.78, '[0.70,0.72,0.75,0.76,0.78,0.78]'),
  ('MECHENG_CAD_Ontario_2028_COOP', 'CAD/Mechanical — $70k+ by 2028', 'MECHENG', '2028', 0.18, '[0.22,0.21,0.20,0.19,0.18,0.18]'),
  ('ELECENG_FPGA_Ontario_2027_COOP', 'FPGA Design — $95k+ by 2027', 'ELECENG', '2027', 0.84, '[0.62,0.66,0.72,0.78,0.82,0.84]')
ON CONFLICT (id) DO NOTHING;
`

try {
  console.log("Connecting to Supabase...")
  const client = await pool.connect()
  console.log("Connected! Running schema...")
  
  // Run the full schema
  await client.query(sql)
  console.log("Schema created successfully!")
  
  // Verify tables exist
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
  `)
  console.log("Tables:", tables.rows.map(r => r.table_name).join(", "))
  
  const bucketCount = await client.query("SELECT COUNT(*) FROM buckets")
  console.log("Buckets seeded:", bucketCount.rows[0].count)
  
  client.release()
} catch (e) {
  console.error("Error:", e)
}
await pool.end()
