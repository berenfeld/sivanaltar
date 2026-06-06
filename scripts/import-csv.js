#!/usr/bin/env node
// Import base44 CSV exports into PostgreSQL.
// Usage: node scripts/import-csv.js /var/www/sivanaltar/import
//
// Drop CSV files into the import folder. File names must match entity names:
//   BlogPost.csv, GalleryImage.csv, Appointment.csv, WorkingHours.csv,
//   ContactMessage.csv, PageContent.csv, UserGuidanceSession.csv,
//   AiConfig.csv, AiInteractionLog.csv
//
// All files must be UTF-8 encoded. The script will warn if non-UTF-8 bytes are found.

'use strict';

require('dotenv').config({ path: require('path').join(__dirname, '../server/.env') });
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const IMPORT_DIR = process.argv[2] || '/var/www/sivanaltar/import';
const UPLOADS_DIR = process.env.UPLOADS_DIR || '/var/www/sivanaltar/uploads';
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://51.102.220.193';

const TABLE_MAP = {
  BlogPost:             'blog_posts',
  GalleryImage:         'gallery_images',
  Appointment:          'appointments',
  WorkingHours:         'working_hours',
  ContactMessage:       'contact_messages',
  PageContent:          'page_content',
  UserGuidanceSession:  'user_guidance_sessions',
  AiConfig:             'ai_config',
  AiInteractionLog:     'ai_interaction_log',
};

// Columns that contain JSON (arrays/objects stored as JSONB in postgres)
const JSONB_COLS = new Set(['qa_history']);

// Columns that are strictly boolean — only these get boolean coercion
const BOOL_COLS = new Set(['published', 'is_available', 'is_sample', 'replied']);

// Columns that contain base44 CDN image URLs to download and migrate
const IMAGE_URL_COLS = new Set(['image_url', 'picture']);

// Columns that may contain HTML with embedded base44 image URLs
const HTML_COLS = new Set(['content']);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const https = require('https');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

// ── CSV parser (handles quoted fields, commas inside quotes, newlines inside quotes) ──

function parseCsv(text) {
  // Normalise line endings
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; } // escaped quote
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') {
        row.push(field); field = '';
        rows.push(row); row = [];
        i++; continue;
      } else {
        field += ch;
      }
    }
    i++;
  }
  // Last field / row
  if (field || row.length > 0) { row.push(field); rows.push(row); }

  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.trim());
  return rows.slice(1)
    .filter(r => r.some(f => f.trim() !== ''))
    .map(r => {
      const obj = {};
      headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
      return obj;
    });
}

// ── UTF-8 validation ──

function checkUtf8(filePath) {
  const buf = fs.readFileSync(filePath);
  // Check for UTF-8 BOM and strip
  const hasBom = buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF;
  const start = hasBom ? 3 : 0;
  let valid = true;
  for (let i = start; i < buf.length; ) {
    const b = buf[i];
    let extra = 0;
    if (b < 0x80) { i++; continue; }
    else if ((b & 0xE0) === 0xC0) extra = 1;
    else if ((b & 0xF0) === 0xE0) extra = 2;
    else if ((b & 0xF8) === 0xF0) extra = 3;
    else { valid = false; break; }
    for (let j = 1; j <= extra; j++) {
      if ((buf[i + j] & 0xC0) !== 0x80) { valid = false; break; }
    }
    i += extra + 1;
  }
  if (!valid) console.warn(`  ⚠ WARNING: ${path.basename(filePath)} may not be valid UTF-8 — Hebrew/special chars could be garbled`);
  // Return text (strip BOM if present)
  return buf.slice(start).toString('utf8');
}

// ── Image downloader ──

function downloadUrl(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    proto.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        return downloadUrl(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve()));
    }).on('error', err => { file.close(); try { fs.unlinkSync(dest); } catch {} reject(err); });
  });
}

async function migrateImageUrl(url) {
  if (!url) return url;
  if (!url.includes('base44.app') && !url.startsWith('http')) return url; // already local
  if (!url.includes('base44.app')) return url; // external non-base44, keep as-is
  const ext = path.extname(new URL(url).pathname) || '.jpg';
  const filename = `${uuidv4()}${ext}`;
  const dest = path.join(UPLOADS_DIR, filename);
  console.log(`    ↓ downloading ${url.split('/').pop()}`);
  try {
    await downloadUrl(url, dest);
    return `/uploads/${filename}`;
  } catch (err) {
    console.warn(`    ✗ download failed (${err.message}), keeping original URL`);
    return url;
  }
}

async function migrateHtmlImageUrls(html) {
  if (!html || !html.includes('base44.app')) return html;
  // Find all base44.app file URLs in the HTML
  const urlRegex = /https:\/\/base44\.app\/api\/apps\/[^\s"'<>)]+/g;
  const urls = [...new Set(html.match(urlRegex) || [])];
  for (const url of urls) {
    const local = await migrateImageUrl(url);
    html = html.split(url).join(local);
  }
  return html;
}

// ── Type coercion ──

function coerce(value, colName) {
  if (value === '' || value === null || value === undefined) return null;
  if (JSONB_COLS.has(colName)) {
    try { return JSON.parse(value); } catch { return value || '[]'; }
  }
  // Only coerce to boolean for known boolean columns
  if (BOOL_COLS.has(colName)) {
    if (value === 'true' || value === 'True' || value === '1') return true;
    if (value === 'false' || value === 'False' || value === '0') return false;
  }
  return value;
}

// ── Main importer ──

async function importFile(entityName, filePath) {
  const table = TABLE_MAP[entityName];
  if (!table) { console.warn(`  ✗ No table mapping for "${entityName}", skipping`); return; }

  console.log(`\n📥 ${entityName} → ${table}`);
  const text = checkUtf8(filePath);
  const rows = parseCsv(text);
  console.log(`  ${rows.length} rows found`);
  if (rows.length === 0) return;

  let inserted = 0, skipped = 0;
  for (const row of rows) {
    // Drop the 'id' column — let postgres assign its own
    const data = { ...row };
    delete data.id;
    delete data.ID;
    delete data._id;

    // Migrate image URLs and HTML content
    for (const col of Object.keys(data)) {
      if (IMAGE_URL_COLS.has(col)) data[col] = await migrateImageUrl(data[col]);
      if (HTML_COLS.has(col)) data[col] = await migrateHtmlImageUrls(data[col]);
    }

    // Coerce types
    for (const col of Object.keys(data)) {
      data[col] = coerce(data[col], col);
    }

    // Drop empty/null-only rows
    const nonNull = Object.values(data).filter(v => v !== null && v !== '');
    if (nonNull.length === 0) { skipped++; continue; }

    const keys = Object.keys(data);
    const cols = keys.map(k => `"${k}"`).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const values = keys.map(k => {
      const v = data[k];
      return (typeof v === 'object' && v !== null) ? JSON.stringify(v) : v;
    });

    try {
      await pool.query(`INSERT INTO ${table} (${cols}) VALUES (${placeholders})`, values);
      inserted++;
    } catch (err) {
      console.warn(`  ⚠ Row skipped: ${err.message}`);
      skipped++;
    }
  }
  console.log(`  ✓ inserted: ${inserted}, skipped: ${skipped}`);
}

async function main() {
  console.log(`\n=== Sivanaltar CSV Import ===`);
  console.log(`Import dir : ${IMPORT_DIR}`);
  console.log(`Uploads dir: ${UPLOADS_DIR}\n`);

  if (!fs.existsSync(IMPORT_DIR)) {
    console.error(`Import directory not found: ${IMPORT_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(IMPORT_DIR).filter(f => f.endsWith('.csv'));
  if (files.length === 0) {
    console.error(`No CSV files found in ${IMPORT_DIR}`);
    process.exit(1);
  }

  // Import in dependency order (sessions before logs, etc.)
  const ORDER = ['AiConfig', 'PageContent', 'WorkingHours', 'BlogPost', 'GalleryImage',
                 'Appointment', 'ContactMessage', 'UserGuidanceSession', 'AiInteractionLog'];

  const fileMap = {};
  for (const f of files) {
    // Accept both BlogPost.csv and BlogPost_export.csv
    const entity = f.replace(/_export\.csv$/i, '').replace(/\.csv$/i, '');
    fileMap[entity] = path.join(IMPORT_DIR, f);
  }

  // Import in defined order first, then any extras
  const done = new Set();
  for (const entity of ORDER) {
    if (fileMap[entity]) {
      await importFile(entity, fileMap[entity]);
      done.add(entity);
    }
  }
  for (const entity of Object.keys(fileMap)) {
    if (!done.has(entity)) await importFile(entity, fileMap[entity]);
  }

  // Reset postgres sequences so new inserts don't collide with imported IDs
  console.log('\n🔧 Resetting sequences...');
  for (const table of Object.values(TABLE_MAP)) {
    try {
      await pool.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1, false)`);
    } catch {}
  }

  console.log('\n✅ Import complete!\n');
  await pool.end();
}

main().catch(err => { console.error(err); process.exit(1); });
