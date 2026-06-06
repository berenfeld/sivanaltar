const express = require('express');
const pool = require('../db/pool');
const { optionalAuth } = require('../middleware/requireAuth');

const router = express.Router();

// Map from PascalCase entity names (used by the SDK) to postgres table names
const ENTITY_TABLE = {
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

// Validate entity name to prevent SQL injection via table name
function resolveTable(entityName) {
  const table = ENTITY_TABLE[entityName];
  if (!table) throw new Error(`Unknown entity: ${entityName}`);
  return table;
}

// Build an ORDER BY clause from a sort string like "-created_date" or "order"
function buildSort(sort) {
  if (!sort) return 'id ASC';
  const desc = sort.startsWith('-');
  const col = sort.replace(/^-/, '');
  // Whitelist safe column name characters
  if (!/^[a-z_]+$/.test(col)) return 'id ASC';
  return `"${col}" ${desc ? 'DESC' : 'ASC'}`;
}

// GET /api/entities/:entity?sort=field
router.get('/:entity', optionalAuth, async (req, res) => {
  try {
    const table = resolveTable(req.params.entity);
    const sort = buildSort(req.query.sort);
    const result = await pool.query(`SELECT * FROM ${table} ORDER BY ${sort}`);
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/entities/:entity/filter  { field: value, ... }
router.post('/:entity/filter', optionalAuth, async (req, res) => {
  try {
    const table = resolveTable(req.params.entity);
    const filters = req.body || {};
    const keys = Object.keys(filters);
    if (keys.length === 0) {
      const result = await pool.query(`SELECT * FROM ${table}`);
      return res.json(result.rows);
    }
    const conditions = keys.map((k, i) => `"${k}" = $${i + 1}`).join(' AND ');
    const values = keys.map((k) => filters[k]);
    const result = await pool.query(`SELECT * FROM ${table} WHERE ${conditions}`, values);
    res.json(result.rows);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/entities/:entity  (create)
router.post('/:entity', optionalAuth, async (req, res) => {
  try {
    const table = resolveTable(req.params.entity);
    const data = req.body || {};
    const keys = Object.keys(data);
    if (keys.length === 0) return res.status(400).json({ error: 'Empty body' });
    const cols = keys.map((k) => `"${k}"`).join(', ');
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const values = keys.map((k) => data[k]);
    const result = await pool.query(
      `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/entities/:entity/:id  (update)
router.patch('/:entity/:id', optionalAuth, async (req, res) => {
  try {
    const table = resolveTable(req.params.entity);
    const { id } = req.params;
    const data = req.body || {};
    const keys = Object.keys(data);
    if (keys.length === 0) return res.status(400).json({ error: 'Empty body' });
    const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const values = [...keys.map((k) => data[k]), id];
    const result = await pool.query(
      `UPDATE ${table} SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/entities/:entity/:id
router.delete('/:entity/:id', optionalAuth, async (req, res) => {
  try {
    const table = resolveTable(req.params.entity);
    const { id } = req.params;
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
