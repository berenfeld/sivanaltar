exports.up = async (pgm) => {
  pgm.addColumns('blog_posts', {
    lang: { type: 'text', default: 'he' },
  });
  // Mark all existing posts as Hebrew
  await pgm.db.query(`UPDATE blog_posts SET lang = 'he' WHERE lang IS NULL`);
};

exports.down = (pgm) => {
  pgm.dropColumn('blog_posts', 'lang');
};
