/* eslint-disable linebreak-style */
const AlbumsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'albums',
  version: '1.0.0',
  register: async (server, { service, validator }) => {
    const almbumsHandler = new AlbumsHandler(service, validator);
    server.route(routes(almbumsHandler));
  },
};
