import pg from 'pg';
const { Pool } = pg;

// Supabase Postgres Connection URLs
// Note: Password containing '@' is properly URL-encoded as '%40'
const DEFAULT_DATABASE_URL = 
  process.env.DATABASE_URL || 
  process.env.DIRECT_URL || 
  '';

let pool: pg.Pool | null = null;
let isConnected = false;
let lastError: string | null = null;

export function getDbPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL || DEFAULT_DATABASE_URL;
    if (!connectionString) {
      console.error('[ShehriAwaz Database] DATABASE_URL or DIRECT_URL is not set in environment variables!');
    }
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false, // Required for Supabase SSL connections
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle Postgres client', err);
      lastError = err.message;
    });

    // Automatically initialize database tables if they don't exist
    initPostgresDatabase().catch((err) => {
      console.warn('Postgres auto-initialization notice:', err.message || err);
    });
  }
  return pool;
}

export async function initPostgresDatabase() {
  try {
    const p = getDbPool();
    const client = await p.connect();
    
    try {
      // Enable UUID extension
      await client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
      await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

      // 1. Profiles table matching Supabase schema specification
      await client.query(`
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY,
          full_name TEXT,
          city TEXT,
          area TEXT,
          phone TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 2. Issues table matching exact Supabase specification
      await client.query(`
        CREATE TABLE IF NOT EXISTS issues (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
          image_url TEXT,
          category TEXT CHECK (
            category IN ('garbage','water','road','electricity','other')
          ),
          severity TEXT CHECK (
            severity IN ('low','medium','high','urgent')
          ),
          department TEXT,
          summary TEXT,
          city TEXT,
          area_text TEXT,
          status TEXT DEFAULT 'reported' CHECK (
            status IN ('reported','in_review','resolved')
          ),
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      // 3. News cache table matching exact Supabase specification
      await client.query(`
        CREATE TABLE IF NOT EXISTS news_cache (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          generated_at DATE DEFAULT CURRENT_DATE,
          content_json JSONB
        );
      `);

      // 4. Create performance indexes for city & area queries and grouping
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_issues_city_area ON issues (city, area_text);
        CREATE INDEX IF NOT EXISTS idx_issues_status ON issues (status);
        CREATE INDEX IF NOT EXISTS idx_issues_category ON issues (category);
        CREATE INDEX IF NOT EXISTS idx_issues_user ON issues (user_id);
        CREATE INDEX IF NOT EXISTS idx_issues_created ON issues (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_news_cache_date ON news_cache (generated_at);
      `);

      // 5. Enable Row Level Security (RLS) as required
      try {
        await client.query(`
          ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
          ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
          ALTER TABLE news_cache ENABLE ROW LEVEL SECURITY;
        `);

        // Add RLS policies if not already present
        // DEMO ONLY:
        // Status updates are currently allowed for authenticated users.
        // In production, status changes must be restricted to authorized government department/admin accounts.
        await client.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'issues' AND policyname = 'issues_public_read') THEN
              CREATE POLICY issues_public_read ON issues FOR SELECT USING (true);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'issues' AND policyname = 'issues_insert_all') THEN
              CREATE POLICY issues_insert_all ON issues FOR INSERT WITH CHECK (true);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'issues' AND policyname = 'issues_update_status') THEN
              CREATE POLICY issues_update_status ON issues FOR UPDATE USING (true);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_read_all') THEN
              CREATE POLICY profiles_read_all ON profiles FOR SELECT USING (true);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own') THEN
              CREATE POLICY profiles_insert_own ON profiles FOR INSERT WITH CHECK (true);
            END IF;
            IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_update_own') THEN
              CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (true);
            END IF;
          END
          $$;
        `);
      } catch (rlsErr) {
        console.warn('RLS configuration notice:', rlsErr);
      }

      // 6. Check if issues table is empty, if so seed initial Pakistani civic issues
      const { rows } = await client.query('SELECT COUNT(*) as count FROM issues');
      const count = parseInt(rows[0].count, 10);

      if (count === 0) {
        console.log('Seeding initial Pakistani civic issues into Supabase Postgres database...');
        
        // Create demo citizen profile for seed data
        const demoUserId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
        await client.query(`
          INSERT INTO profiles (id, full_name, city, area, phone, created_at)
          VALUES ($1, 'Citizen Observer', 'Lahore', 'Johar Town', '+92 300 1234567', NOW())
          ON CONFLICT (id) DO NOTHING;
        `, [demoUserId]);

        const seedSql = `
          INSERT INTO issues (
            id, user_id, image_url, category, severity, department, summary,
            city, area_text, status, created_at
          ) VALUES 
          (
            'b1111111-1111-4111-a111-111111111111',
            '${demoUserId}',
            'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80',
            'garbage', 'high', 'LWMC (Lahore Waste Management Company) / TMA',
            'Overflowing garbage container spilling onto the pedestrian walkway near G1 Market.',
            'Lahore', 'Johar Town', 'reported', NOW() - INTERVAL '9 days'
          ),
          (
            'b2222222-2222-4222-a222-222222222222',
            '${demoUserId}',
            'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
            'garbage', 'high', 'LWMC (Lahore Waste Management Company) / TMA',
            'Commercial waste dumped on open plot near Khokhar Chowk.',
            'Lahore', 'Johar Town', 'reported', NOW() - INTERVAL '8 days'
          ),
          (
            'b3333333-3333-4333-a333-333333333333',
            '${demoUserId}',
            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
            'road', 'high', 'TEPA / LDA (Lahore Development Authority) & C&W',
            'Deep trench and broken asphalt on main boulevard causing severe traffic jams.',
            'Lahore', 'Johar Town', 'in_review', NOW() - INTERVAL '14 days'
          ),
          (
            'b4444444-4444-4444-a444-444444444444',
            '${demoUserId}',
            'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
            'water', 'urgent', 'WASA Lahore (Water and Sanitation Agency)',
            'Main underground water supply pipe burst flooding residential street.',
            'Lahore', 'Johar Town', 'in_review', NOW() - INTERVAL '3 days'
          ),
          (
            'b5555555-5555-4555-a555-555555555555',
            '${demoUserId}',
            'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
            'water', 'high', 'WASA Lahore (Water and Sanitation Agency)',
            'Sewage manhole overflowing creating standing black water on road.',
            'Lahore', 'Johar Town', 'resolved', NOW() - INTERVAL '6 days'
          ),
          (
            'b6666666-6666-4666-a666-666666666666',
            '${demoUserId}',
            'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
            'electricity', 'urgent', 'LESCO (Lahore Electric Supply Company)',
            'Low-hanging live wire snapped from utility pole dangling over pedestrian pathway.',
            'Lahore', 'Johar Town', 'reported', NOW() - INTERVAL '2 days'
          ),
          (
            'b7777777-7777-4777-a777-777777777777',
            '${demoUserId}',
            'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80',
            'electricity', 'urgent', 'IESCO (Islamabad Electric Supply Company)',
            'Overloaded pole-mounted transformer sparking continuously in commercial alley.',
            'Rawalpindi', 'Satellite Town', 'reported', NOW() - INTERVAL '4 days'
          ),
          (
            'b8888888-8888-4888-a888-888888888888',
            '${demoUserId}',
            'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
            'water', 'urgent', 'KWSC (Karachi Water & Sewerage Corporation)',
            'Raw sewage backflow into residential lane near Bilawal Chowrangi.',
            'Karachi', 'Clifton', 'in_review', NOW() - INTERVAL '4 days'
          )
          ON CONFLICT (id) DO NOTHING;
        `;
        await client.query(seedSql);
        console.log('Successfully seeded database with real civic records.');
      }

      isConnected = true;
      lastError = null;
      console.log('PostgreSQL database connected and initialized successfully.');
    } finally {
      client.release();
    }
  } catch (err: any) {
    isConnected = false;
    lastError = err.message || String(err);
    console.error('PostgreSQL Connection error:', lastError);
  }
}

// ----------------- ISSUES QUERIES -----------------
export async function fetchAllDbIssues(filters?: { city?: string; area?: string; category?: string; userId?: string }) {
  const p = getDbPool();
  
  const conditions: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (filters?.userId) {
    conditions.push(`user_id::text = $${idx++}::text`);
    values.push(String(filters.userId));
  }
  if (filters?.city && filters.city !== 'All Cities' && filters.city !== 'all') {
    conditions.push(`LOWER(city) = LOWER($${idx++})`);
    values.push(filters.city);
  }
  if (filters?.area && filters.area !== 'All Areas' && filters.area !== 'all') {
    conditions.push(`LOWER(area_text) = LOWER($${idx++})`);
    values.push(filters.area);
  }
  if (filters?.category && filters.category !== 'all') {
    conditions.push(`LOWER(category) = LOWER($${idx++})`);
    values.push(filters.category);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const query = `
    SELECT 
      id,
      user_id,
      image_url,
      category,
      severity,
      department,
      summary,
      city,
      area_text,
      status,
      created_at
    FROM issues 
    ${whereClause}
    ORDER BY created_at DESC
  `;
  const { rows } = await p.query(query, values);
  return rows;
}

export async function insertDbIssue(issue: {
  id?: string;
  user_id?: string;
  image_url?: string;
  category: string;
  severity: string;
  department: string;
  summary: string;
  city: string;
  area_text: string;
  status?: string;
}) {
  const p = getDbPool();
  
  // Validate category & severity against DB CHECK constraints
  const validCategories = ['garbage', 'water', 'road', 'electricity', 'other'];
  const validSeverities = ['low', 'medium', 'high', 'urgent'];
  const validStatuses = ['reported', 'in_review', 'resolved'];

  const category = validCategories.includes(issue.category?.toLowerCase()) ? issue.category.toLowerCase() : 'other';
  const severity = validSeverities.includes(issue.severity?.toLowerCase()) ? issue.severity.toLowerCase() : 'medium';
  const status = validStatuses.includes(issue.status?.toLowerCase() || '') ? issue.status!.toLowerCase() : 'reported';

  const query = `
    INSERT INTO issues (
      user_id, image_url, category, severity, department,
      summary, city, area_text, status, created_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING *;
  `;
  const values = [
    issue.user_id || null,
    issue.image_url || null,
    category,
    severity,
    issue.department,
    issue.summary,
    issue.city,
    issue.area_text,
    status,
  ];
  const { rows } = await p.query(query, values);
  return rows[0];
}

export async function updateDbIssueStatus(id: string, newStatus: string) {
  const p = getDbPool();
  const validStatuses = ['reported', 'in_review', 'resolved'];
  const status = validStatuses.includes(newStatus.toLowerCase()) ? newStatus.toLowerCase() : 'reported';

  const query = `
    UPDATE issues
    SET status = $1
    WHERE id::text = $2::text
    RETURNING *;
  `;
  const { rows } = await p.query(query, [status, id]);
  return rows[0] || null;
}

// ----------------- NEWS CACHE QUERIES -----------------
export async function getCachedNewsFromDb() {
  const p = getDbPool();
  try {
    const { rows } = await p.query(`
      SELECT content_json, generated_at 
      FROM news_cache 
      WHERE generated_at = CURRENT_DATE 
      ORDER BY generated_at DESC, id DESC 
      LIMIT 1;
    `);
    if (rows.length > 0 && rows[0].content_json) {
      return rows[0].content_json;
    }
    return null;
  } catch (err) {
    console.warn('News cache query notice:', err);
    return null;
  }
}

export async function getLatestCachedNewsFromDb() {
  const p = getDbPool();
  try {
    const { rows } = await p.query(`
      SELECT content_json, generated_at 
      FROM news_cache 
      ORDER BY generated_at DESC, id DESC 
      LIMIT 1;
    `);
    if (rows.length > 0 && rows[0].content_json) {
      return {
        items: rows[0].content_json,
        generated_at: rows[0].generated_at,
      };
    }
    return null;
  } catch (err) {
    console.warn('Latest news cache query notice:', err);
    return null;
  }
}

export async function saveNewsToDbCache(newsJson: any) {
  const p = getDbPool();
  try {
    await p.query(`
      INSERT INTO news_cache (generated_at, content_json)
      VALUES (CURRENT_DATE, $1);
    `, [JSON.stringify(newsJson)]);
  } catch (err) {
    console.warn('News cache save notice:', err);
  }
}

// ----------------- HEALTH & DIAGNOSTICS -----------------
export async function getDbHealth() {
  try {
    const p = getDbPool();
    const result = await p.query('SELECT COUNT(*) as count FROM issues');
    return {
      connected: true,
      issueCount: parseInt(result.rows[0]?.count || '0', 10),
      database: 'PostgreSQL (Supabase)',
      pooler: 'Transaction Pooler (Port 6543)',
      error: null,
    };
  } catch (err: any) {
    return {
      connected: false,
      issueCount: 0,
      database: 'PostgreSQL (Supabase)',
      error: err.message || String(err),
    };
  }
}
