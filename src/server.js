require('dotenv').config();
const Hapi = require('@hapi/hapi');
const musics = require('./api/main');
const MusicsService = require('./services/postgres/MusicsService');



const init = async () => {
    const musicsService = new MusicsService();

    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    await server.register({
        plugin: musics,
        options: {
            service: musicsService,
        }
    })

    await server.start();
    console.log(`Server berjalana pada ${server.info.uri}`);
};

init();