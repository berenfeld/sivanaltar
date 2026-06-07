exports.up = async (pgm) => {
  await pgm.db.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS lang TEXT DEFAULT 'he'`);
  await pgm.db.query(`UPDATE blog_posts SET lang = 'he' WHERE lang IS NULL`);
};

exports.down = (pgm) => {
  pgm.dropColumn('blog_posts', 'lang');
};
