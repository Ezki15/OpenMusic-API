/* eslint-disable linebreak-style */
const InvariantError = require('../../exceptions/InvariantError');
const { AlmbumPayloadSchema } = require('./schema');

const AlbumsValidator = {
  validateAlbumPayload: (payload) => {
    const validationResult = AlmbumPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

};

module.exports = AlbumsValidator;
