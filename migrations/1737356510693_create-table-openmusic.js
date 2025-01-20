/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
    // create album table
    pgm.createTable('album',{
        id: {type: 'VARCHAR(50)', primaryKey: true, notNull: true},
        name: {type: 'TEXT', notNull:true},
        year: {type: 'INTEGER', notNull:true},
    });

    // create songs table
    pgm.createTable('songs', {
        id: {type: 'VARCHAR(50)', primaryKey:true, notNull:true},
        title: {type: 'TEXT', notNull:true},
        year: {type: 'INTEGER', notNull:true},
        perfromer: {type: 'TEXT', notNull:true},
        genre: {type: 'TEXT', notNull:true},
        duration: {type: 'INTEGER', notNull:false},
        album_id: {type: 'VARCHAR(50)', notNull:false, references: '"album"', onDelete:'cascade'},
    });

};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
    pgm.dropTable('songs');
    pgm.dropTable('album');
};