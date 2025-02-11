/* eslint-disable linebreak-style */
/* eslint-disable no-sparse-arrays */
/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
            FROM playlists
            LEFT JOIN users
            ON playlists.owner = users.id
            WHERE playlists.owner = $1`,
      values: [owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal mendapatkan data. Id tidak ditemukan');
    }
    return result.rows;
  }

  async getPlaylistById(id) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
              FROM playlists
              LEFT JOIN users ON playlists.owner = users.id
              WHERE playlists.id = $1`,
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows) {
      throw new NotFoundError('Gagal mendapatkan data. Id tidak ');
    }

    return result.rows[0];
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus playlist. Id tidak ditemukan');
    }
  }

  async addSongsPlaylist(songId, playlistId) {
    const id = `songplaylist-${nanoid(16)}`;

    // memverifikasi apakah songId memiliki song
    await this.verifySong(songId);

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }
  }

  async verifySong(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal mendapatkan lagu. Id tidak ditemukan');
    }
  }

  async getSongsPlaylistById(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
            FROM songs
            LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
            WHERE playlist_songs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteSongInPlaylistById(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlist_songs
              WHERE playlist_id = $1 AND song_id = $2`,
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Gagal mengahapus lagu dari playlist. Id playlist dan song tidak ditemukan');
    }
  }

  // Verifikasi akses fitur dengan memveriikasi owner dan akses
  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak bisa mengakses resource ini');
    }
  }
}

module.exports = PlaylistsService;
