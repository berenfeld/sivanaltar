/* Re-generate keywords for ALL posts using Claude.
 * Replaces the stopword-extracted keywords (migration 1750200000000) with
 * meaningful, language-aware SEO keywords chosen by the model.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const Anthropic = require('@anthropic-ai/sdk').default;

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

async function generateKeywords(client, lang, title, content) {
  const text = stripHtml(content).slice(0, 1500);
  const langLabel = lang === 'he' ? 'Hebrew' : 'English';

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 100,
    messages: [{
      role: 'user',
      content: `Read this ${langLabel} blog post and return 5-10 comma-separated SEO keywords in ${langLabel}.
Return ONLY the keywords, no explanation, no numbering.

Title: ${title}

Content: ${text}`,
    }],
  });

  return message.content[0].text.trim().replace(/\n/g, ', ');
}

exports.up = async (pgm) => {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const { rows } = await pgm.db.query(
    `SELECT id, lang, title, content FROM blog_posts ORDER BY id`
  );

  console.log(`Generating Claude keywords for ${rows.length} posts…`);

  for (const post of rows) {
    const keywords = await generateKeywords(client, post.lang, post.title, post.content);
    await pgm.db.query(`UPDATE blog_posts SET keywords = $1 WHERE id = $2`, [keywords, post.id]);
    console.log(`  Post ${post.id} (${post.lang}): ${keywords}`);
  }
};

exports.down = async (pgm) => {
  await pgm.db.query(`UPDATE blog_posts SET keywords = NULL`);
};
