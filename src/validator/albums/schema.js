/* eslint-disable linebreak-style */
const Joi = require('joi');

const AlmbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  year: Joi.number().required(),
});

module.exports = { AlmbumPayloadSchema };
