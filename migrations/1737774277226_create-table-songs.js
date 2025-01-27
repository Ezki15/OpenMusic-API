/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // create songs table
  pgm.createTable('songs', {
    id: { type: 'VARCHAR(50)', primaryKey: true, notNull: true },
    title: { type: 'TEXT', notNull: true },
    year: { type: 'INTEGER', notNull: true },
    genre: { type: 'TEXT', notNull: true },
    performer: { type: 'TEXT', notNull: true },
    duration: { type: 'INTEGER', notNull: false },
    albumId: { type: 'VARCHAR(50)', notNull: false },
  });

  // add constraint
  pgm.addConstraint(
    'songs',
    'albumId_to_id_almbums',
    'FOREIGN KEY ("albumId") REFERENCES albums(id) ON DELETE CASCADE',
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'albumId_to_id_almbums');
  pgm.dropTable('songs');
};
