const express = require('express');
const nodemailer = require('nodemailer');
const Anthropic = require('@anthropic-ai/sdk');

const router = express.Router();

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// POST /api/integrations/send-email
// Body: { to, subject, body, from_name? }
router.post('/send-email', async (req, res) => {
  const { to, subject, body, from_name } = req.body || {};
  if (!to || !subject) return res.status(400).json({ error: 'to and subject are required' });

  try {
    const transporter = getTransporter();
    const fromName = from_name || process.env.SMTP_FROM_NAME || 'sivanaltar.com';
    await transporter.sendMail({
      from: `"${fromName}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: body,
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('SendEmail error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/integrations/invoke-llm
// Body: { prompt, add_context_from_internet? }
router.post('/invoke-llm', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const text = message.content?.[0]?.text ?? '';
    res.json(text);
  } catch (err) {
    console.error('InvokeLLM error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
