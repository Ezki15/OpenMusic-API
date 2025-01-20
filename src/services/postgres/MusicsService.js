const {nanoid} = require('nanoid');


class MusicsService {

    // album services
    addAlbum({name, year}){
        const id = `album-${nanoid(16)}`;
        // proses memasukkan ke database

        return id;
    }

    getAlbumById(id){
        // proses query database
    }

    editAlbumById(id, {name, year}){
        // proses query database
    }

    deleteAlbumById(id){
        // proses query database
    }

    // songs service
    

}

module.exports = MusicsService