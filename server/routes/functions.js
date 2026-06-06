const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const nodemailer = require('nodemailer');
const pool = require('../db/pool');
const { requireAuth } = require('../middleware/requireAuth');

const router = express.Router();

const ADMIN_EMAILS = ['berenfeldran@gmail.com', 'sivanaltar@gmail.com'];
const MAX_QUESTIONS_FOR_NON_ADMIN = 3;

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendEmail(to, subject, html) {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"${process.env.SMTP_FROM_NAME || 'sivanaltar.com'}" <${process.env.SMTP_USER}>`,
      to, subject, html,
    });
  } catch (err) {
    console.error('sendEmail error:', err.message);
  }
}

// Detect grammatical gender from Hebrew text
function detectGender(text) {
  if (!text) return 'unknown';
  const femaleMarkers = /אני\s+\w*ת\b|אני\s+\w*ה\b|הייתי\s+\w*ת\b/;
  if (femaleMarkers.test(text)) return 'female';
  return 'unknown';
}

// POST /api/functions/invokeAiGuidance
router.post('/invokeAiGuidance', requireAuth, async (req, res) => {
  const { question } = req.body || {};
  if (!question) return res.status(400).json({ error: 'question is required' });

  const user = req.user;
  const isAdmin = user.role === 'admin' || ADMIN_EMAILS.includes(user.email);

  try {
    // Load AI config
    const configResult = await pool.query('SELECT key, value FROM ai_config');
    const config = {};
    for (const row of configResult.rows) config[row.key] = row.value;

    const systemPrompt = config.guidance_system_prompt || 'You are a helpful guidance assistant.';

    // Get or create active session
    let sessionResult = await pool.query(
      `SELECT * FROM user_guidance_sessions WHERE user_email=$1 AND status='active' LIMIT 1`,
      [user.email]
    );

    let session;
    if (sessionResult.rows.length === 0) {
      const created = await pool.query(
        `INSERT INTO user_guidance_sessions (user_email, user_full_name, status, qa_history)
         VALUES ($1, $2, 'active', '[]') RETURNING *`,
        [user.email, user.name]
      );
      session = created.rows[0];
    } else {
      session = sessionResult.rows[0];
    }

    const qaHistory = session.qa_history || [];

    // Enforce question limit for non-admins
    if (!isAdmin && qaHistory.length >= MAX_QUESTIONS_FOR_NON_ADMIN) {
      return res.json({
        answer: 'הגעת למגבלת השאלות. אנא צרי קשר ישירות עם סיון.',
        sessionId: session.id,
      });
    }

    // Build prompt
    const gender = detectGender(question);
    const historyText = qaHistory
      .map((qa) => `שאלה: ${qa.question}\nתשובה: ${qa.answer}`)
      .join('\n\n');

    const fullPrompt = `${systemPrompt}\n\n${historyText ? `היסטוריית שיחה:\n${historyText}\n\n` : ''}שאלה חדשה (${gender === 'female' ? 'פנייה בלשון נקבה' : 'פנייה'}): ${question}`;

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: fullPrompt }],
    });
    const answer = message.content?.[0]?.text ?? '';

    // Update session
    const updatedHistory = [...qaHistory, { question, answer }];
    await pool.query(
      `UPDATE user_guidance_sessions SET qa_history=$1 WHERE id=$2`,
      [JSON.stringify(updatedHistory), session.id]
    );

    // Log interaction
    await pool.query(
      `INSERT INTO ai_interaction_log (session_id, user_email, question, llm_answer) VALUES ($1,$2,$3,$4)`,
      [session.id, user.email, question, answer]
    );

    // Email admins on first question
    if (qaHistory.length === 0) {
      const displayName = user.name || user.email;
      const emailBody = `<p>משתמש/ת חדש/ה התחיל/ה שיחת הכוונה:</p>
        <p><b>שם:</b> ${displayName}</p>
        <p><b>אימייל:</b> ${user.email}</p>
        <p><b>שאלה ראשונה:</b> ${question}</p>
        <p><b>תשובה:</b> ${answer}</p>`;
      for (const adminEmail of ADMIN_EMAILS) {
        await sendEmail(adminEmail, `הכוונה ראשונית - ${displayName}`, emailBody);
      }
    }

    res.json({ answer, sessionId: session.id });
  } catch (err) {
    console.error('invokeAiGuidance error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
