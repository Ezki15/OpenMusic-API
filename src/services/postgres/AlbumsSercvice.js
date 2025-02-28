/* eslint-disable linebreak-style */
/* eslint-disable no-sparse-arrays */
/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService {
  // Inisiasi pg
  constructor(cacheService) {
    this._cacheService = cacheService;
    this._pool = new Pool();
  }

  // album services
  async addAlbum({ name, year }) {
    const nanoidAlbum = nanoid(16);
    const id = `album-${nanoidAlbum}`;
    // proses memasukkan ke database
    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getAlbumById(id) {
    // proses query database
    // mendapatkan data album berdasarkan id
    const queryAlbum = {
      text: 'SELECT * FROM albums WHERE id = $1',
      values: [id],
    };
    const resultAlbum = await this._pool.query(queryAlbum);
    if (!resultAlbum.rows.length) {
      throw new NotFoundError('Album tidak ditemukan');
    }

    return resultAlbum.rows[0];
  }

  async getSongByAlbumId(albumId) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE "albumId" = $1',
      values: [albumId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async editAlbumById(id, { name, year }) {
    // proses query database
    const query = {
      text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
      values: [name, year, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui data albums. Id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    // proses query database
    const query = {
      text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus data albums');
    }
  }

  // user album likes
  async addLike(albumId, userId) {
    const id = `like-${nanoid(16)}`;

    // check jika album ada
    await this.getAlbumById(albumId);

    // check jika sudah pernah like
    const queryCheck = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2',
      values: [userId, albumId],
    };
    const checkLike = await this._pool.query(queryCheck);
    if (checkLike.rows.length) {
      throw new InvariantError('Gagal menambahkan like. Like hanya bisa dilakukan sekali');
    }

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Gagal menambahkan like');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async deleteLike(albumId, userId) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id',
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus like. Id tidak ditemukan');
    }

    await this._cacheService.delete(`likes:${albumId}`);
  }

  async getLikes(albumId) {
    try {
      const key = `likes:${albumId}`;
      const cache = await this._cacheService.get(`likes:${albumId}`);
      return { cache, key };
    } catch (error) {
      const query = {
        text: 'SELECT COUNT(id) FROM user_album_likes WHERE album_id = $1',
        values: [albumId],
      };

      const result = await this._pool.query(query);

      if (!result.rows[0].count) {
        throw new NotFoundError('Gagal mendapatkan like');
      }

      await this._cacheService.set(`likes:${albumId}`, Number(result.rows[0].count));
      return result.rows[0].count;
    }
  }
}

module.exports = AlbumsService;
