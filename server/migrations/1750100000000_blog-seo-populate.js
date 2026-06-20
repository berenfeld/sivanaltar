/* Populate seo_url and keywords for existing blog posts.
 * seo_url: always English, derived from title for en posts or transliterated for he posts.
 * keywords: extracted from post content (top significant words).
 */

const STOPWORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','that','this',
  'it','is','are','was','were','be','been','have','has','had','do','does','did','not',
  'from','as','by','we','you','i','my','your','our','their','its','if','so','than',
  'then','when','where','who','how','what','will','would','could','should','may',
  'might','can','just','about','more','also','like','very','all','get','one','two',
  'there','they','them','these','those','some','any','each','which','while','after',
  'before','during','between','through','up','down','into','out','over','under',
  'again','here','now','no','yes','only','even','such','same','other','than','too',
  'very','still','back','after','since','before','without','both','few','most',
  'other','into','through','itself','himself','herself','ourselves','themselves',
]);

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractKeywords(content, title) {
  const text = ((title || '') + ' ' + (content || ''))
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = text.toLowerCase().split(/\s+/);
  const seen = new Set();
  const keywords = [];
  for (const w of words) {
    const clean = w.replace(/[^a-z]/g, '');
    if (clean.length >= 4 && !STOPWORDS.has(clean) && !seen.has(clean)) {
      seen.add(clean);
      keywords.push(clean);
      if (keywords.length >= 12) break;
    }
  }
  return keywords.join(', ');
}

// Manual English slugs for Hebrew posts (matched by approximate title content)
// Hebrew posts have the same topics as the English translations.
// These are best-effort slugs; admin can edit via the post editor.
const HEBREW_SLUG_HINTS = [
  { titleContains: 'פרח',  slug: 'i-started-growing-roots' },
  { titleContains: 'גדיל', slug: 'i-started-growing-roots' },
  { titleContains: 'שור',  slug: 'i-started-growing-roots' },
  { titleContains: 'פנים', slug: 'face-to-face-connection' },
  { titleContains: 'לוינ', slug: 'face-to-face-connection' },
  { titleContains: 'ים',   slug: 'face-to-face-connection' },
  { titleContains: 'יהיה', slug: 'emotional-preparation-for-important-conversations' },
  { titleContains: 'שיחה', slug: 'emotional-preparation-for-important-conversations' },
  { titleContains: 'הכנה', slug: 'emotional-preparation-for-important-conversations' },
];

function hebrewSlug(title, id) {
  for (const hint of HEBREW_SLUG_HINTS) {
    if (title && title.includes(hint.titleContains)) return hint.slug;
  }
  return `blog-post-${id}`;
}

exports.up = async (pgm) => {
  const result = await pgm.db.query(
    `SELECT id, title, content, lang FROM blog_posts WHERE seo_url IS NULL`
  );

  const usedSlugs = new Map(); // slug -> count for deduplication

  for (const post of result.rows) {
    let seoUrl;
    if (post.lang === 'en' || !post.lang) {
      const base = slugify(post.title || `post-${post.id}`);
      seoUrl = base || `blog-post-${post.id}`;
    } else {
      seoUrl = hebrewSlug(post.title || '', post.id);
    }

    // Deduplicate: if slug already used, append -id
    if (usedSlugs.has(seoUrl)) {
      seoUrl = `${seoUrl}-${post.id}`;
    }
    usedSlugs.set(seoUrl, true);

    const keywords = extractKeywords(post.content, post.title);

    await pgm.db.query(
      `UPDATE blog_posts SET seo_url = $1, keywords = $2 WHERE id = $3`,
      [seoUrl, keywords, post.id]
    );
  }
};

exports.down = async (pgm) => {
  await pgm.db.query(`UPDATE blog_posts SET seo_url = NULL, keywords = NULL`);
};
