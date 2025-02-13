/* eslint-disable linebreak-style */
/* eslint-disable max-len */
/* eslint-disable no-underscore-dangle */
const AutoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(collaborationService, playlistsService, validator) {
    this._collaborationService = collaborationService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    AutoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    const collaborationId = await this._collaborationService.addCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Collaboration added successfully',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request, h) {
    this._validator.validateCollaborationPayload(request.payload);
    const { playlistId, userId } = request.payload;
    const { id: credentialId } = request.auth.credentials;
    await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
    await this._collaborationService.deleteCollaboration(playlistId, userId);

    const response = h.response({
      status: 'success',
      message: 'Collaboration deleted successfully',
    });
    response.code(200);
    return response;
  }
}

module.exports = CollaborationsHandler;
