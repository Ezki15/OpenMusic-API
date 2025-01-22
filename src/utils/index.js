/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
const mapDBToModelDetail = ({
  id, title, year, genre, performer, duration, album_id,
}) => ({
  id, title, year, genre, performer, duration, albumId: album_id,
});

module.exports = { mapDBToModelDetail };
