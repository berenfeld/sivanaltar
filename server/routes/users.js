const express = require('express');
const pool = require('../db/pool');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// PATCH /api/users/me/lang — save language preference for logged-in user
router.patch('/me/lang', requireAuth, async (req, res) => {
  const { lang } = req.body;
  if (!['he', 'en'].includes(lang)) return res.status(400).json({ error: 'Invalid lang' });
  await pool.query('UPDATE users SET lang = $1 WHERE id = $2', [lang, req.user.userId]);
  res.json({ ok: true });
});

// GET /api/users/me/lang — return saved lang for logged-in user
router.get('/me/lang', requireAuth, async (req, res) => {
  const result = await pool.query('SELECT lang FROM users WHERE id = $1', [req.user.userId]);
  res.json({ lang: result.rows[0]?.lang || 'he' });
});

module.exports = router;
