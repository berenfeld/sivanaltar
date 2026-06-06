const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();

const ADMIN_EMAILS = ['berenfeldran@gmail.com', 'sivanaltar@gmail.com'];

function getOAuthClient() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );
}

// Step 1: redirect user to Google
router.get('/google', (req, res) => {
  const returnUrl = req.query.return_url || '/';
  const client = getOAuthClient();
  const url = client.generateAuthUrl({
    access_type: 'online',
    scope: ['email', 'profile'],
    state: encodeURIComponent(returnUrl),
  });
  res.redirect(url);
});

// Step 2: Google redirects back here with ?code=...
router.get('/google/callback', async (req, res) => {
  const { code, state } = req.query;
  const returnUrl = state ? decodeURIComponent(state) : '/';

  try {
    const client = getOAuthClient();
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';

    // Upsert user
    const result = await pool.query(
      `INSERT INTO users (email, name, picture, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET name=$2, picture=$3, role=$4
       RETURNING id, email, name, picture, role`,
      [email, name, picture, role]
    );
    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, name: user.name, picture: user.picture },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.redirect(returnUrl);
  } catch (err) {
    console.error('Google OAuth error:', err);
    res.status(500).send('Authentication failed');
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    res.json({
      id: user.userId,
      email: user.email,
      full_name: user.name,
      picture: user.picture,
      role: user.role,
    });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

module.exports = router;
