exports.up = (pgm) => {
  pgm.addColumn('users', {
    lang: { type: 'text', default: 'he' },
  }, { ifNotExists: true });
};

exports.down = (pgm) => {
  pgm.dropColumn('users', 'lang');
};
