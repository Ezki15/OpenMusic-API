/* eslint-disable linebreak-style */
/* eslint-disable no-sparse-arrays */
/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToModelDetail } = require('../../utils');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class SongsService {
  // Inisiasi pg
  constructor() {
    this._pool = new Pool();
  }

  // songs service =====
  async addSong({
    title, year, performer, genre, duration, albumId,
  }) {
    const nanoidAlbum = nanoid(16);
    const id = `song-${nanoidAlbum}`;
    // proses memasukkan ke database
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query('SELECT id, title, performer FROM songs');
    return result.rows;
  }

  async getSongById(id) {
    // proses query database
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }
    return result.rows.map(mapDBToModelDetail)[0];
  }

  async editSongById(id, {
    title, year, genre, performer, duration, albumId,
  }) {
    // proses query database
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, genre: $3, performer: $4, duration: $5, albumId: $6 WHERE id = $7 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui data lagu. Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    // proses query database
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus data lagu');
    }
  }
}

module.exports = SongsService;
