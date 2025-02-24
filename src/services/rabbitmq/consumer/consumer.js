/* eslint-disable linebreak-style */
/* eslint-disable import/no-extraneous-dependencies */
const amqp = require('amqplib');
const SongsInPlaylistService = require('./SongInPlaylistService');
const MailSender = require('./MailSender');
const Listener = require('./listener');

const init = async () => {
  const songsInPlaylistService = new SongsInPlaylistService();
  const mailSender = new MailSender();
  const listener = new Listener(songsInPlaylistService, mailSender);

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
  const channel = await connection.createChannel();

  await channel.assertQueue('export:playlists', {
    durable: true,
  });

  channel.consume('export:playlists', listener.listen, { noAck: true });
};

init();
