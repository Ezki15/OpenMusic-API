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
    title, year, genre, performer, duration, albumId,
  }) {
    const nanoidSong = nanoid(16);
    const id = `song-${nanoidSong}`;
    // proses memasukkan ke database
    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, year, genre, performer, duration, albumId],
    };

    const result = await this._pool.query(query);

    // debugging
    console.log({
      title, year, genre, performer, duration, albumId,
    });
    console.log(query);
    console.log(result);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getSongs(queryParams) {
    if (!queryParams) {
      const result = await this._pool.query('SELECT id, title, performer FROM songs');
      return result.rows;
    }

    const { title } = queryParams;
    const { performer } = queryParams;
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE title = $1 OR performer = $2',
      values: [title, performer],
    };
    const result = await this._pool.query(query);
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
      text: 'UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, albumId = $6 WHERE id = $7 RETURNING id',
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
