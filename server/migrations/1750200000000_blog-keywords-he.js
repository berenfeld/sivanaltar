/* Populate keywords for posts that have none (or near-empty keywords).
 * Hebrew posts need a Hebrew-aware extractor; English posts reuse the ASCII one.
 */

// Common Hebrew function words to skip
const HE_STOPWORDS = new Set([
  'של','את','זה','זאת','הם','הן','לא','יש','כי','אם','אל','על','עם','כל',
  'אני','הוא','היא','אנחנו','אתם','אתן','אלה','אלו','כך','כן','רק','גם',
  'עוד','כבר','אבל','אז','או','שלי','שלך','שלו','שלה','שלנו','שלכם','שלהם',
  'אחד','שתי','שני','שתיים','היה','הייתה','היו','יהיה','תהיה','יהיו',
  'אחרי','לפני','בין','תוך','דרך','עבור','בגלל','למרות','אצל','ליד',
  'מתוך','לתוך','כמו','ממש','מאוד','יותר','פחות','כבר','עצמי','עצמה',
  'שלנו','שלהם','בכל','לכל','מכל','עליי','אליי','ממני','אותי','אותו',
  'אותה','אותם','אותן','אנחנו','אתכם','עליך','אליך','ממך','לנו','להם',
  'להן','אליהם','עליהם','אליה','עליה','ממנה','מהם','מהן','בהם','בהן',
  'היום','הלילה','השנה','הזה','הזאת','האלה','שהם','שהן','שהוא','שהיא',
]);

const EN_STOPWORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','that',
  'this','it','is','are','was','were','be','been','have','has','had','do','does',
  'did','not','from','as','by','we','you','i','my','your','our','their','its',
  'if','so','than','then','when','where','who','how','what','will','would',
  'could','should','may','might','can','just','about','more','also','like',
  'very','all','get','one','two','there','they','them','these','those','some',
  'any','each','which','while','after','before','during','between','through',
  'up','down','into','out','over','under','again','here','now','no','yes','only',
  'even','such','same','other','too','still','back','since','without','both',
  'few','most','into','itself','himself','herself','ourselves','themselves',
]);

function stripHtml(html) {
  return (html || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();
}

function hebrewKeywords(title, content) {
  const text = stripHtml((title || '') + ' ' + (content || ''));
  // Match sequences of Hebrew letters (U+05D0–U+05EA, including final forms)
  const words = text.match(/[א-תיִ-פֿ]{2,}/g) || [];
  const seen = new Set();
  const result = [];
  for (const w of words) {
    if (!HE_STOPWORDS.has(w) && !seen.has(w)) {
      seen.add(w);
      result.push(w);
      if (result.length >= 12) break;
    }
  }
  return result.join(', ');
}

function englishKeywords(title, content) {
  const text = stripHtml((title || '') + ' ' + (content || '')).toLowerCase();
  const words = text.split(/\s+/);
  const seen = new Set();
  const result = [];
  for (const w of words) {
    const clean = w.replace(/[^a-z]/g, '');
    if (clean.length >= 4 && !EN_STOPWORDS.has(clean) && !seen.has(clean)) {
      seen.add(clean);
      result.push(clean);
      if (result.length >= 12) break;
    }
  }
  return result.join(', ');
}

exports.up = async (pgm) => {
  const { rows } = await pgm.db.query(
    `SELECT id, lang, title, content FROM blog_posts WHERE keywords IS NULL OR LENGTH(TRIM(keywords)) < 5`
  );

  for (const post of rows) {
    const keywords = (post.lang === 'he')
      ? hebrewKeywords(post.title, post.content)
      : englishKeywords(post.title, post.content);

    if (keywords) {
      await pgm.db.query(
        `UPDATE blog_posts SET keywords = $1 WHERE id = $2`,
        [keywords, post.id]
      );
      console.log(`  Post ${post.id} (${post.lang}): ${keywords}`);
    }
  }
};

exports.down = async (pgm) => {
  // Clear only posts that were populated by this migration (near-empty before)
  await pgm.db.query(`UPDATE blog_posts SET keywords = NULL WHERE lang = 'he'`);
};
