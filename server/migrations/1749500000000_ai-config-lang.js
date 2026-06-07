exports.up = async (pgm) => {
  // Add lang column to ai_config
  await pgm.db.query(`ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'he'`);
  // Mark all existing rows as Hebrew
  await pgm.db.query(`UPDATE ai_config SET lang = 'he' WHERE lang IS NULL OR lang = ''`);
  // Insert English system prompt if not already present
  await pgm.db.query(`
    INSERT INTO ai_config (key, value, lang)
    SELECT 'guidance_system_prompt', $1, 'en'
    WHERE NOT EXISTS (
      SELECT 1 FROM ai_config WHERE key = 'guidance_system_prompt' AND lang = 'en'
    )
  `, [
    `You are the virtual assistant of Sivan Altarovici, an emotional coach using the Satya method.
Your role is to warmly welcome visitors and provide initial emotional guidance in English.
Listen with empathy, ask one thoughtful follow-up question at a time, and help the visitor explore their feelings and what brings them here.
Keep each response short — 2 to 4 sentences. Never diagnose or give clinical advice.
After the conversation, gently encourage the visitor to book an introductory session with Sivan.
Always respond in English only.`
  ]);
};

exports.down = async (pgm) => {
  await pgm.db.query(`DELETE FROM ai_config WHERE key = 'guidance_system_prompt' AND lang = 'en'`);
  await pgm.db.query(`ALTER TABLE ai_config DROP COLUMN IF EXISTS lang`);
};
