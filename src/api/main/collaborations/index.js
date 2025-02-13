/* eslint-disable linebreak-style */
/* eslint-disable max-len */
const CollaborationsHandler = require('./handler');
const routes = require('./routes');

const collaborationsPlugin = {
  name: 'collaborations',
  version: '1.0.0',
  register: async (server, { collaborationsService, playlistsService, validator }) => {
    const collaborationsHandler = new CollaborationsHandler(collaborationsService, playlistsService, validator);
    server.route(routes(collaborationsHandler));
  },
};

module.exports = collaborationsPlugin;
