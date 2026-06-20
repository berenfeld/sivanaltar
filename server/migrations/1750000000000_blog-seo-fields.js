/* Add seo_url and keywords columns to blog_posts */

exports.up = async (pgm) => {
  await pgm.db.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_url TEXT`);
  await pgm.db.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS keywords TEXT`);
  await pgm.db.query(`CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_seo_url_idx ON blog_posts(seo_url) WHERE seo_url IS NOT NULL`);
};

exports.down = async (pgm) => {
  await pgm.db.query(`DROP INDEX IF EXISTS blog_posts_seo_url_idx`);
  await pgm.db.query(`ALTER TABLE blog_posts DROP COLUMN IF EXISTS seo_url`);
  await pgm.db.query(`ALTER TABLE blog_posts DROP COLUMN IF EXISTS keywords`);
};
