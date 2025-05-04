/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const autoBin = require('auto-bind');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBin(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);
    const { name } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({
      name, owner: credentialId,
    });

    const response = h.response({
      status: 'success',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request, h) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);

    if (playlists.key) {
      const cachePlaylists = playlists.cache;
      const response = h.response({
        status: 'success',
        data: {
          playlists: cachePlaylists,
        },
      }).header('X-Data-Source', 'cache');
      response.code(200);
      return response;
    }
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHanlder(request) {
    const { id } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(id, credentialId);
    await this._service.deletePlaylistById(id);

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongsPlaylistHandler(request, h) {
    await this._validator.validateSongPlaylistPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.addSongsPlaylist(songId, playlistId);

    // menambahkan ke aktivitas
    await this._service.addPlaylistActivities(playlistId, songId, credentialId, 'add');

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan ke playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsPlaylistHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);

    const playlist = await this._service.getPlaylistById(playlistId);
    const songs = await this._service.getSongsPlaylistById(playlistId);

    if (songs.key) {
      const cacheSongs = songs.cache;
      const cachePlaylist = playlist.cache;
      const response = h.response({
        status: 'success',
        data: {
          playlist: {
            ...cachePlaylist,
            songs: cacheSongs,
          },
        },
      }).header('X-Data-Source', 'cache');
      response.code(200);
      return response;
    }

    return {
      status: 'success',
      data: {
        playlist: {
          ...playlist,
          songs,
        },
      },
    };
  }

  async deleteSongsPlaylistHandler(request) {
    await this._validator.validateSongPlaylistPayload(request.payload);

    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._service.verifyPlaylistAccess(playlistId, credentialId);
    await this._service.deleteSongInPlaylistById(playlistId, songId);

    // menambahkan ke aktivitas
    await this._service.addPlaylistActivities(playlistId, songId, credentialId, 'delete');

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus dari playlist',
    };
  }

  // mendapatkan aktivitas playlist
  async getPlaylistActivitiesHandler(request, h) {
    const { id: playlistId } = request.params;
    const { id: credentialId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner(playlistId, credentialId);

    const activitiesResult = await this._service.getPlaylistActivites(playlistId);

    if (activitiesResult.key) {
      const cacheActivities = activitiesResult.cache;
      const response = h.response({
        status: 'success',
        data: {
          playlistId,
          activities: cacheActivities,
        },
      }).header('X-Data-Source', 'cache');
      response.code(200);
      return response;
    }

    return {
      status: 'success',
      data: {
        playlistId,
        activities: activitiesResult,
      },
    };
  }
}

module.exports = PlaylistsHandler;
