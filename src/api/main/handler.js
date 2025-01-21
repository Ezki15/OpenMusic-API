class MusicsHandler {
    constructor(service){
        this._service = service;

    this.postAlbumHandler = this.postAlbumHandler.bind(this);
    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this);
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this);
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this);

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsdHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
    }
    // Album handler ==========
    async postAlbumHandler(request, h){
        const {name, year} = request.payload;

        const albumId = await this._service.addAlbum({name, year});

        const response = h.response({
            status: 'success',
            data: {albumId},
        });
        response.code(201);
        return response;
    }

    async getAlbumByIdHandler(request){
        const {id} = request.params;
        const album = await this._service.getAlbumById(id);
        return {
            status:'success',
            data: {album},
        };
    }

    async putAlbumByIdHandler(request){
        const {id} = request.params;

        await this._service.editAlbumById(id, request.payload);

        return {
            status: 'success',
            message: 'Data album berhasil diperbarui',
        };
    }

    async deleteAlbumByIdHandler(request){
        const {id} = request.params;
        await this._service.deleteAlbumById(id);
        return {
            status: 'success',
            message: 'Data album berhasil dihapus',
        };
    }

    // Songs Handler ==============
    async postSongHandler(request, h){
        const {title, year, genre, performer, duration, albumId} = request.payload;

        const songId = await this._service.addSong({title, year, genre, performer, duration, albumId});

        const response = h.response({
            status: 'success',
            data: {songId},
        });
        response.code(201);
        return response;
    }

    async getSongsHandler(){
        const songs = await this._service.getSongs();
        return {
            status: 'success',
            data: {songs},
        };
    }

    async getSongByIdHandler(request){
        const {id} = request.params;
        const song = await this._service.getSongById(id);
        return {
            status:'success',
            data: {song},
        };
    }

    async putSongByIdHandler(request){
        const {id} = request.params;

        await this._service.editSongById(id, request.payload);

        return {
            status: 'success',
            message: 'Data Song berhasil diperbarui',
        };
    }

    async deleteSongByIdHandler(request){
        const {id} = request.params;
        await this._service.deleteSongById(id);
        return {
            status: 'success',
            message: 'Data Song berhasil dihapus',
        };
    }

}

module.exports = MusicsHandler;