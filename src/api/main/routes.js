const routes = (handler) => [
    // album routes
    {
        method: 'POST',
        path: '/albums',
        handler: () => {},
    },
    {
        method: 'GET',
        path: '/albums/{id}',
        handler: () => {},
    },
    {
        method: 'PUT',
        path: '/albums/{id}',
        handler: () => {},
    },
    {
        method: 'DELETE',
        path: '/albums/{id}',
        handler: () => {},
    },

    
    // song routes
    {
        method: 'POST',
        path: '/songs',
        handler: () => {},
    },
    {
        method: 'GET',
        path: '/songs',
        handler: () => {},
    },
    {
        method: 'GET',
        path: '/songs/{id}',
        handler: () => {},
    },
    {
        method: 'PUT',
        path: '/songs/{id}',
        handler: () => {},
    },
    {
        method: 'DELETE',
        path: '/songs/{id}',
        handler: () => {},
    },
];

module.exports = routes;