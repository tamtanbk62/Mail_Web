const imaps = require('imap-simple');

let activeWatchers = {}

const startMailWatcher = async (email, password, io) => {
  if (activeWatchers[email]) return;

  const config = {
    imap: {
      user: email,
      password,
      host: process.env.MAILSERVER_HOST,
      port: 143,
      tls: false,
      authTimeout: 3000,
      tlsOptions: { rejectUnauthorized: false }
    }
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX', false);
    console.log(`Watching inbox for ${email}`);

    
    connection.on('mail', async (numNew) => {
      console.log(`[IMAP] ${numNew} new message(s) for ${email}`);

      // Lấy UID mới nhất 
      const results = await connection.search(['ALL'], { bodies: ['HEADER'], struct: true });
      const uids = results.map(m => m.attributes.uid);
      const newestUid = Math.max(...uids);

      io.emit('new-mail', { email, uid: newestUid });
    });

    activeWatchers[email] = connection;
  } catch (err) {
    console.error('IMAP connect error:', err.message);
  }
};

module.exports = { startMailWatcher };