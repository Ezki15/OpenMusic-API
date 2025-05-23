/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const autoBin = require('auto-bind');

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBin(this);
  }

  // Album handler ==========
  async postAlbumHandler(request, h) {
    this._validator.validateAlbumPayload(request.payload);
    const { name, year } = request.payload;

    const albumId = await this._service.addAlbum({ name, year });

    const response = h.response({
      status: 'success',
      data: { albumId },
    });
    response.code(201);
    return response;
  }

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params;
    const album = await this._service.getAlbumById(id);
    const song = await this._service.getSongByAlbumId(id);

    if (album.key || song.key) {
      const cacheAlbum = album.cache;
      const cacheSongs = song.cache;
      const response = h.response({
        status: 'succes',
        data: {
          album: {
            id: cacheAlbum.id,
            name: cacheAlbum.name,
            year: cacheAlbum.year,
            coverUrl: cacheAlbum.coverUrl,
            songs: cacheSongs.map((unit) => ({
              id: unit.id,
              title: unit.title,
              performer: unit.performer,
            })),
          },
        },
      });
      response.code(200);
      return response;
    }

    const response = h.response({
      status: 'success',
      data: {
        album: {
          id: album.id,
          name: album.name,
          year: album.year,
          coverUrl: album.coverUrl,
          songs: song.map((unit) => ({
            id: unit.id,
            title: unit.title,
            performer: unit.performer,
          })),
        },
      },
    }).header('X-Data-Source', 'cache');

    response.code(200);
    return response;
  }

  async putAlbumByIdHandler(request) {
    this._validator.validateAlbumPayload(request.payload);
    const { id } = request.params;

    await this._service.editAlbumById(id, request.payload);

    return {
      status: 'success',
      message: 'Data album berhasil diperbarui',
    };
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteAlbumById(id);
    return {
      status: 'success',
      message: 'Data album berhasil dihapus',
    };
  }

  // user album likes
  async postLikeAlbumByIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.addLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil ditambahkan',
    });
    response.code(201);
    return response;
  }

  async deleteLikeAlbumByIdHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: albumId } = request.params;

    await this._service.deleteLike(albumId, userId);

    const response = h.response({
      status: 'success',
      message: 'Like berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  async getLikesAlbumByIdHandler(request, h) {
    const { id: albumId } = request.params;

    const like = await this._service.getLikes(albumId);

    if (like.key) {
      const response = h.response({
        status: 'success',
        data: {
          likes: Number(like.cache),
        },
      }).header('X-Data-Source', 'cache');
      response.code(200);
      return response;
    }

    return {
      status: 'success',
      data: {
        likes: Number(like),
      },
    };
  }
}

module.exports = AlbumsHandler;
