/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
class Listener {
  constructor(songInPlaylistService, mailSender) {
    this._songInPlaylistService = songInPlaylistService;
    this._mailSender = mailSender;

    this._listener = this._listener.bind(this);
  }

  async listen(message) {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString());

      const playlistSongs = await this._songInPlaylistService.getResultSongsInPlaylist(playlistId);
      const result = await this._mailSender.sendEmail(targetEmail, JSON.stringify(playlistSongs));
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
