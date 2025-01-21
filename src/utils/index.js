const mapDBToModelDetail = ({
    id,title, year, genre, performer, duration, album_id
}) => ({
    title, year, genre, performer, duration, albumId: album_id
});

const mapDBToModelAll = (songs) => {
    const listSongs = [];
    songs.forEach((song) => {
        const {id, title, performer} = book;
        listSongs.push({id, title, performer});
    });
    return listSongs;
}
module.exports = {mapDBToModelDetail, mapDBToModelAll};