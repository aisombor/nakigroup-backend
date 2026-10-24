const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDatabase() {
  let connection;
  try {
    console.log('🔄 Initializing database tables...');

    // Create connection (without database first to create it if needed)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'naki_db';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.query(`USE \`${dbName}\``);
    console.log(`📦 Using database: ${dbName}`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await connection.query(statement);
      } catch (err) {
        // Ignore "index already exists" errors
        if (err.code !== 'ER_DUP_KEYNAME') {
          throw err;
        }
      }
    }
    console.log('✅ Tables created successfully (users, jobs, applications)');

    // Check if HR user exists, if not create default admin
    const [userCheck] = await connection.query('SELECT id FROM users WHERE username = ?', ['admin']);
    if (userCheck.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        `INSERT INTO users (username, email, password_hash, full_name, role)
         VALUES (?, ?, ?, ?, ?)`,
        ['admin', 'hr@nakigroup.com', hashedPassword, 'Naki HR Manager', 'admin']
      );
      console.log('👤 Default HR user created: username="admin", password="admin123"');
    }

    // Check if any jobs exist, if not seed initial jobs
    const [jobCheck] = await connection.query('SELECT COUNT(*) AS count FROM jobs');
    if (parseInt(jobCheck[0].count, 10) === 0) {
      await connection.query(`
        INSERT INTO jobs (title, department, job_type, location, experience_level, salary_range, description, requirements, responsibilities, status)
        VALUES 
        (
          'Senior Property Development Manager',
          'Development & Planning',
          'Full-Time',
          'Phnom Penh, Cambodia',
          'Senior Level (5+ yrs)',
          'Competitive / Negotiable',
          'Lead landmark residential and commercial projects from inception through planning, execution, and handover with international standards.',
          'Bachelor or Master degree in Civil Engineering, Architecture, or Real Estate. Minimum 5 years of project management experience in high-rise or luxury residential developments.',
          'Manage consultants, contractors, timeline, budget, and government permits for major developments.',
          'open'
        ),
        (
          'Luxury Hospitality Operations Supervisor',
          'Hospitality & Suites',
          'Full-Time',
          'Phnom Penh, Cambodia',
          'Mid-Level (3+ yrs)',
          'Competitive',
          'Oversee day-to-day guest experience and operations for Naki Suites & Silvertown properties, ensuring premium hospitality standards.',
          'Degree in Hospitality or Business. Excellent English communication skills. Prior experience in 4-5 star hotels or luxury serviced apartments.',
          'Supervise front desk, housekeeping coordination, guest relations, and service quality control.',
          'open'
        ),
        (
          'Marketing & Brand Communications Executive',
          'Marketing & Sales',
          'Full-Time',
          'Phnom Penh, Cambodia',
          'Mid-Level (2+ yrs)',
          'Competitive',
          'Drive brand awareness, digital marketing campaigns, media relations, and lead generation for luxury developments.',
          'Degree in Marketing, Media, or Business. Strong knowledge of digital campaigns, social media marketing, and content creation.',
          'Plan content schedules, coordinate press releases, manage social media platforms, and track marketing ROI.',
          'open'
        )
      `);
      console.log('💼 Seeded 3 initial sample jobs into database.');
    }

    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

initDatabase();
