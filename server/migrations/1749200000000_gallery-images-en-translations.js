/* Data migration: populate English translations for all gallery images */
const translations = [
  {
    id: 42,
    title_en: 'Light at the End of the Tunnel',
    subtitle_en: 'Hope and renewal',
  },
  {
    id: 13,
    title_en: 'A Moment of Contemplation',
    subtitle_en: 'A photo that captured a moment of inner peace',
  },
  {
    id: 11,
    title_en: 'Wild Nature',
    subtitle_en: 'Connecting with nature as part of the growth journey',
  },
  {
    id: 9,
    title_en: 'A New Path',
    subtitle_en: 'The beginning of a personal journey',
  },
  {
    id: 7,
    title_en: 'Colors of Life',
    subtitle_en: 'The way we choose to see the world',
  },
  {
    id: 10,
    title_en: 'Looking at the Horizon',
    subtitle_en: 'Seeing beyond what is here right now',
  },
  {
    id: 8,
    title_en: 'Inner Stillness',
    subtitle_en: 'A moment of meditation and contemplation',
  },
  {
    id: 14,
    title_en: 'Diverging Paths',
    subtitle_en: 'The choices that shape our journey',
  },
  {
    id: 6,
    title_en: 'Breathtaking Sunset',
    subtitle_en: 'The end of an inspiring day',
  },
  {
    id: 12,
    title_en: 'Open Spaces',
    subtitle_en: 'The infinite possibilities before us',
  },
  {
    id: 5,
    title_en: 'The Mulberry Tree',
    subtitle_en: 'The quiet beauty of the mulberry tree — a symbol of roots, growth, and the sweetness of life',
  },
  {
    id: 4,
    title_en: 'Ladybugs United',
    subtitle_en: 'A kind of family',
  },
  {
    id: 3,
    title_en: 'Cat in a Basket',
    subtitle_en: null,
  },
  {
    id: 2,
    title_en: 'Pipe Dreams',
    subtitle_en: null,
  },
  {
    id: 1,
    title_en: 'Bavaria Tricolore',
    subtitle_en: null,
  },
];

exports.up = async (pgm) => {
  for (const { id, title_en, subtitle_en } of translations) {
    await pgm.db.query(
      'UPDATE gallery_images SET title_en = $1, subtitle_en = $2 WHERE id = $3',
      [title_en, subtitle_en, id]
    );
  }
};

exports.down = async (pgm) => {
  const ids = translations.map(t => t.id);
  await pgm.db.query(
    `UPDATE gallery_images SET title_en = NULL, subtitle_en = NULL WHERE id = ANY($1)`,
    [ids]
  );
};
