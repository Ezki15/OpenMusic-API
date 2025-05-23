/* eslint-disable no-underscore-dangle */
const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService {
  constructor(collaborationsService, cacheService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
    this._cacheService = cacheService;
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

    await this._cacheService.delete(`playlists:${owner}`);
    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    try {
      const key = `playlists:${owner}`;
      const cache = await this._cacheService.get(key);
      return { cache, key };
    } catch {
      const query = {
        text: `SELECT playlists.id, playlists.name, users.username
              FROM playlists
              LEFT JOIN users
              ON playlists.owner = users.id
              LEFT JOIN collaborations
              ON playlists.id = collaborations.playlist_id
              WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
        values: [owner],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`playlists:${owner}`, result.rows);
      return result.rows;
    }
  }

  async getPlaylistById(id) {
    try {
      const key = `playlist:${id}`;
      const cache = await this._cacheService.get(key);
      return { cache, key };
    } catch {
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

      await this._cacheService.set(`playlist:${id}`, result.rows[0]);
      return result.rows[0];
    }
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

    await this._cacheService.delete(`playlist:${id}`);
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

    await this._cacheService.delete(`songPlaylist:${playlistId}`);
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
    try {
      const key = `songPlaylist:${playlistId}`;
      const cache = await this._cacheService.get(key);
      return { cache, key };
    } catch {
      const query = {
        text: `SELECT songs.id, songs.title, songs.performer
              FROM songs
              LEFT JOIN playlist_songs ON playlist_songs.song_id = songs.id
              WHERE playlist_songs.playlist_id = $1`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      await this._cacheService.set(`songPlaylist:${playlistId}`, result.rows);
      return result.rows;
    }
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

    await this._cacheService.delete(`songPlaylist:${playlistId}`);
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

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  // Fitur playlist_activities
  async addPlaylistActivities(playlistId, songId, userId, action) {
    const id = `activities-${nanoid(16)}`;
    const createAt = new Date().toISOString();

    const playlist = await this.getPlaylistById(playlistId);
    if (!playlist) {
      throw new NotFoundError('Gagal mendapatkan playlist. Id tidak ditemukan');
    }

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6) RETURNING id',
      values: [id, playlistId, songId, userId, action, createAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Aktivitas gagal ditambahkan');
    }

    await this._cacheService.delete(`activities:${playlistId}`);
  }

  async getPlaylistActivites(playlistId) {
    try {
      const key = `activities:${playlistId}`;
      const cache = await this._cacheService.get(key);
      return { cache, key };
    } catch {
      const query = {
        text: `SELECT users.username, songs.title, playlist_song_activities.action, playlist_song_activities.time
                FROM playlist_song_activities
                LEFT JOIN users ON playlist_song_activities.user_id = users.id
                LEFT JOIN songs ON playlist_song_activities.song_id = songs.id
                WHERE playlist_song_activities.playlist_id = $1
                ORDER BY playlist_song_activities.time ASC`,
        values: [playlistId],
      };

      const result = await this._pool.query(query);

      if (!result.rowCount) {
        throw new NotFoundError('Gagal mendapatkan aktivitas playlist. Id tidak ditemukan');
      }

      await this._cacheService.set(`activities:${playlistId}`, result.rows);
      return result.rows;
    }
  }
}

module.exports = PlaylistsService;
