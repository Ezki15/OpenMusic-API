/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
const authoBind = require('auto-bind');

class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    authoBind(this);
  }

  async postUploadImageHandler(request, h) {
    const { data } = request.payload;
    console.log(data); // =========================
    const { id: albumId } = request.params;
    this._validator.validateImageHeaders(data.hapi.headers);

    const filename = await this._service.writeFile(data, data.hapi);
    const urlCover = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

    await this._service.addCoverToAlbum(albumId, urlCover);

    const response = h.response({
      status: 'success',
      mesassage: 'Sampul berhasil diunggah',
    });
    response.code(201);
    return response;
  }
}

module.exports = UploadsHandler;
