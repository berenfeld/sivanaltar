exports.up = async (pgm) => {
  // Add lang column
  await pgm.db.query(`ALTER TABLE ai_config ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'he'`);
  // Mark all existing rows as Hebrew
  await pgm.db.query(`UPDATE ai_config SET lang = 'he' WHERE lang IS NULL OR lang = ''`);

  // Drop the old unique constraint on key alone, replace with (key, lang)
  // Find and drop any unique constraint on the key column
  await pgm.db.query(`
    DO $$
    DECLARE r RECORD;
    BEGIN
      FOR r IN
        SELECT con.conname
        FROM pg_constraint con
        JOIN pg_class cls ON cls.oid = con.conrelid
        JOIN pg_attribute att ON att.attrelid = cls.oid AND att.attnum = ANY(con.conkey)
        WHERE cls.relname = 'ai_config'
          AND con.contype = 'u'
          AND att.attname = 'key'
          AND array_length(con.conkey, 1) = 1
      LOOP
        EXECUTE 'ALTER TABLE ai_config DROP CONSTRAINT ' || quote_ident(r.conname);
      END LOOP;
    END $$;
  `);

  // Add composite unique constraint on (key, lang)
  await pgm.db.query(`
    ALTER TABLE ai_config ADD CONSTRAINT ai_config_key_lang_unique UNIQUE (key, lang)
  `);

  // Insert English system prompt
  await pgm.db.query(`
    INSERT INTO ai_config (key, value, lang)
    VALUES ('guidance_system_prompt', $1, 'en')
    ON CONFLICT (key, lang) DO NOTHING
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
  await pgm.db.query(`ALTER TABLE ai_config DROP CONSTRAINT IF EXISTS ai_config_key_lang_unique`);
  await pgm.db.query(`ALTER TABLE ai_config ADD CONSTRAINT ai_config_key_key UNIQUE (key)`);
  await pgm.db.query(`ALTER TABLE ai_config DROP COLUMN IF EXISTS lang`);
};
