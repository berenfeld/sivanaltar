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
  const { question, lang: reqLang } = req.body || {};
  if (!question) return res.status(400).json({ error: 'question is required' });

  const lang = ['he', 'en'].includes(reqLang) ? reqLang : 'he';
  const isHe = lang === 'he';

  const user = req.user;
  const isAdmin = user.role === 'admin' || ADMIN_EMAILS.includes(user.email);

  try {
    // Load lang-specific system prompt, fall back gracefully if lang column doesn't exist yet
    let systemPrompt = 'You are a helpful guidance assistant.';
    try {
      const promptResult = await pool.query(
        `SELECT value FROM ai_config WHERE key='guidance_system_prompt' AND lang=$1 LIMIT 1`,
        [lang]
      );
      if (promptResult.rows.length > 0) {
        systemPrompt = promptResult.rows[0].value;
      } else {
        const fallback = await pool.query(`SELECT value FROM ai_config WHERE key='guidance_system_prompt' LIMIT 1`);
        if (fallback.rows.length > 0) systemPrompt = fallback.rows[0].value;
      }
    } catch (_) {
      // lang column may not exist yet — fall back to unfiltered query
      try {
        const fallback = await pool.query(`SELECT value FROM ai_config WHERE key='guidance_system_prompt' LIMIT 1`);
        if (fallback.rows.length > 0) systemPrompt = fallback.rows[0].value;
      } catch (__) {}
    }

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
        answer: isHe
          ? 'הגעת למגבלת השאלות. אנא צרי קשר ישירות עם סיון.'
          : 'You have reached the question limit. Please contact Sivan directly.',
        sessionId: session.id,
      });
    }

    // Build prompt
    const gender = isHe ? detectGender(question) : 'unknown';
    const historyText = isHe
      ? qaHistory.map((qa) => `שאלה: ${qa.question}\nתשובה: ${qa.answer}`).join('\n\n')
      : qaHistory.map((qa) => `Question: ${qa.question}\nAnswer: ${qa.answer}`).join('\n\n');

    const fullPrompt = isHe
      ? `${historyText ? `היסטוריית שיחה:\n${historyText}\n\n` : ''}שאלה חדשה (${gender === 'female' ? 'פנייה בלשון נקבה' : 'פנייה'}): ${question}`
      : `${historyText ? `Conversation history:\n${historyText}\n\n` : ''}New question: ${question}`;

    console.log('=== AI GUIDANCE PROMPT ===');
    console.log('--- SYSTEM ---\n', systemPrompt);
    console.log('--- USER ---\n', fullPrompt);
    console.log('==========================');

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
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
