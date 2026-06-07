exports.up = (pgm) => {
  // Rename existing title/subtitle to title_he/subtitle_he
  pgm.renameColumn('gallery_images', 'title', 'title_he');
  pgm.renameColumn('gallery_images', 'subtitle', 'subtitle_he');
  // Add English columns
  pgm.addColumns('gallery_images', {
    title_en: { type: 'text' },
    subtitle_en: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('gallery_images', 'title_en');
  pgm.dropColumn('gallery_images', 'subtitle_en');
  pgm.renameColumn('gallery_images', 'title_he', 'title');
  pgm.renameColumn('gallery_images', 'subtitle_he', 'subtitle');
};
