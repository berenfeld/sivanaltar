#!/usr/bin/env node
// One-shot data import: base44 JSON dump → PostgreSQL
// Usage: node scripts/import-data.js <path-to-dump.json>
//
// Expected dump format:
// {
//   "BlogPost": [...],
//   "GalleryImage": [...],
//   "Appointment": [...],
//   "WorkingHours": [...],
//   "ContactMessage": [...],
//   "PageContent": [...],
//   "UserGuidanceSession": [...],
//   "AiConfig": [...],
//   "AiInteractionLog": [...]
// }

require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
const { Pool } = require('pg');
const fs = require('fs');
const https = require('https');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const UPLOADS_DIR = process.env.UPLOADS_DIR || '/var/www/sivanaltar/uploads';
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://51.102.220.193';

const TABLE_MAP = {
  BlogPost: 'blog_posts',
  GalleryImage: 'gallery_images',
  Appointment: 'appointments',
  WorkingHours: 'working_hours',
  ContactMessage: 'contact_messages',
  PageContent: 'page_content',
  UserGuidanceSession: 'user_guidance_sessions',
  AiConfig: 'ai_config',
  AiInteractionLog: 'ai_interaction_log',
};

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function downloadFile(url) {
  return new Promise((resolve, reject) => {
    const ext = path.extname(new URL(url).pathname) || '.jpg';
    const filename = `${uuidv4()}${ext}`;
    const dest = path.join(UPLOADS_DIR, filename);
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve(`/uploads/${filename}`)));
    }).on('error', reject);
  });
}

async function migrateImageUrl(url) {
  if (!url || !url.includes('base44.app')) return url;
  console.log(`  Downloading: ${url}`);
  try {
    return await downloadFile(url);
  } catch (err) {
    console.warn(`  Failed to download ${url}: ${err.message}`);
    return url;
  }
}

async function importEntity(entityName, rows) {
  const table = TABLE_MAP[entityName];
  if (!table) { console.warn(`Unknown entity: ${entityName}`); return; }
  console.log(`Importing ${rows.length} ${entityName} records...`);

  for (const row of rows) {
    // Migrate image URLs
    if (row.image_url) row.image_url = await migrateImageUrl(row.image_url);
    if (row.content && row.content.includes('base44.app')) {
      // Replace inline base44 image URLs in HTML content
      row.content = row.content.replace(
        /https:\/\/base44\.app\/api\/apps\/[^"'\s)]+/g,
        (url) => { console.log(`  Inline URL (run separately): ${url}`); return url; }
      );
    }

    const keys = Object.keys(row).filter(k => k !== 'id'); // let DB auto-assign IDs
    if (keys.length === 0) continue;
    const cols = keys.map(k => `"${k}"`).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const values = keys.map(k => {
      const v = row[k];
      return typeof v === 'object' && v !== null ? JSON.stringify(v) : v;
    });

    try {
      await pool.query(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`, values);
    } catch (err) {
      console.warn(`  Row insert failed: ${err.message}`);
    }
  }
}

async function main() {
  const dumpPath = process.argv[2];
  if (!dumpPath) {
    console.error('Usage: node scripts/import-data.js <dump.json>');
    process.exit(1);
  }

  const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));

  for (const [entityName, rows] of Object.entries(dump)) {
    await importEntity(entityName, rows);
  }

  console.log('\nImport complete!');
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
