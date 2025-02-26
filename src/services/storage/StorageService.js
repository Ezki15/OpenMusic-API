/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
const fs = require('fs');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

class StorageService {
  constructor(folder) {
    this._folder = folder;
    this._pool = new Pool();

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writefile(file, meta) {
    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => {
        resolve(filename);
      });
    });
  }

  addCoverToAlbum(albumId, urlCover) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2 RETURNING id',
      values: [urlCover, albumId],
    };

    const result = this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = StorageService;
