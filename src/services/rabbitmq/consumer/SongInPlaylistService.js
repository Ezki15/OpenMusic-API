/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');

class SongsInPlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongInPlaylistById(playlistId) {
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

  async getPlaylistById(playlistId) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username
                FROM playlists
                LEFT JOIN users ON playlists.owner = users.id
                WHERE playlists.id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async getResultSongsInPlaylist(playlistId) {
    const playlist = await this.getPlaylistById(playlistId);
    const songs = await this.getSongInPlaylistById(playlistId);
    return {
      playlist: {
        ...playlist,
        songs,

      },
    };
  }
}

module.exports = SongsInPlaylistService;
