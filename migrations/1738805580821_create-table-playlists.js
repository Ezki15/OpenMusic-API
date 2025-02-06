/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: { type: 'VARCHAR(50)', primaryKey: true, notNull: true },
    name: { type: 'TEXT', notNull: true },
    owner: { type: 'TEXT', notNull: true },
  });

  pgm.addConstraint(
    'playlists',
    'owner_to_id_users',
    'FOREIGN KEY ("owner") REFERENCES users(id) ON DELETE CASCADE',
  );
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropConstraint('plyalists', 'owner_to_id_users');
  pgm.dropTable('playlists');
};
