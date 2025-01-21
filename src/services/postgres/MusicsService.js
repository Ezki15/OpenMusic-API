const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { mapDBToModelDetail, mapDBToModelAll } = require('../../utils');



class MusicsService {
    // Inisiasi pg
    constructor(){
        this._pool = new Pool();
    }

    // album services
    async addAlbum({name, year}){
        const nanoidAlbum = nanoid(16);
        const id = `album-${nanoidAlbum}`;
        // proses memasukkan ke database
        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3) RETURNING id',
            values: [id, name, year],
        };
        
        const result = await this._pool.query(query);

        if(!result.rows[0].id){
            throw new Error('Album gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getAlbumById(id){
        // proses query database
        const query = {
            text: 'SELECT * FROM albums WHERE id = $1',
            values: [id],
        }
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new Error('Album tidak ditemukan');
        }
        return result.rows[0];
    }

    async editAlbumById(id, {name, year}){
        // proses query database
        const query = {
            text: 'UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id',
            values: [name, year, id],
        };
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new Error('Gagal memperbarui data albums. Id tidak ditemukan');
        }
    }

    async deleteAlbumById(id){
        // proses query database
        const query = {
            text: 'DELETE FROM albums WHERE id = $1 RETURNING id',
            values: [id],
        };
        const result = await this._pool.query(query);

        if(!result.rows.length){
            throw new Error('Gagal menghapus data albums');
        }
    }

    // songs service =====
    async addSong({title, year, genre, performer, duration, albumId}){
        const nanoidAlbum = nanoid(16);
        const id = `song-${nanoidAlbum}`;
        // proses memasukkan ke database
        const query = {
            text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            values: [id, title, year, , performer, genre, duration, albumId],
        };
        
        const result = await this._pool.query(query);

        if(!result.rows[0].id){
            throw new Error('Song gagal ditambahkan');
        }

        return result.rows[0].id;
    }

    async getSongs(){
        const result = await this._pool.query('SELECT * FROM songs');
        return mapDBToModelAll(result.rows);
    }

    async getSongById(id){
        // proses query database
        const query = {
            text: 'SELECT * FROM songs WHERE id = $1',
            values: [id],
        }
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new Error('Song tidak ditemukan');
        }
        return result.rows.map(mapDBToModelDetail)[0];
    }

    async editSongById(id, {title, year, genre, performer, duration, albumId}){
        // proses query database
        const query = {
            text: 'UPDATE songs SET title = $1, year = $2, genre: $3, performer: $4, duration: $5, albumId: $6 WHERE id = $7 RETURNING id',
            values: [title, year, genre, performer, duration, albumId, id],
        };
        const result = await this._pool.query(query);
        if(!result.rows.length){
            throw new Error('Gagal memperbarui data songs. Id tidak ditemukan');
        }
    }

    async deleteSongById(id){
        // proses query database
        const query = {
            text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
            values: [id],
        };
        const result = await this._pool.query(query);

        if(!result.rows.length){
            throw new Error('Gagal menghapus data songs');
        }
    }
    

}

module.exports = MusicsService