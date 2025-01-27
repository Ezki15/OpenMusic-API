/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
const mapDBToModelDetail = ({
  id, title, year, genre, performer, duration, albumId,
}) => ({
  id, title, year, performer, genre, duration, albumId,
});

module.exports = { mapDBToModelDetail };
