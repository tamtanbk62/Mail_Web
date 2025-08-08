const nodemailer = require('nodemailer');
const imaps = require('imap-simple');
const { simpleParser } = require('mailparser');
const _ = require('lodash');
require('dotenv').config();


exports.sendMail = async (req, res) => {
  const { to, subject, message } = req.body;
  const { email, password } = req.user;

  const dynamicTransporter = nodemailer.createTransport({
    host: process.env.MAILSERVER_HOST,
    port: 587,
    secure: false,
    auth: {
      user: email,
      pass: password
    },
    tls: {
      rejectUnauthorized: false
    }
  });


  let attachments = [];
  if (req.file) {
    attachments.push({
      filename: req.file.originalname,
      path: req.file.path // đường dẫn từ multer
    });
  }

  try {
    await dynamicTransporter.sendMail({
      from: email,
      to,
      subject,
      text: message,
      attachments
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error("Send error:", error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
};



exports.getInbox = async (req, res) => {
  const { email, password } = req.user;

  const config = {
    imap: {
      user: email,
      password,
      host: process.env.MAILSERVER_HOST,
      port: 143,
      tls: false,
      authTimeout: 3000
    }
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const searchCriteria = ['ALL'];
    const fetchOptions = {
      bodies: [''],
      markSeen: false
    };

    const messages = await connection.search(searchCriteria, fetchOptions);

    const parsed = await Promise.all(messages.map(async (item, index) => {
      const all = _.find(item.parts, { which: '' });
      const parsedEmail = await simpleParser(all.body);

      return {
        uid: item.attributes.uid,
        subject: parsedEmail.subject || '',
        from: parsedEmail.from?.text || '',
        date: parsedEmail.date || '',
        body: parsedEmail.text?.trim() || '(no text)'
      };
    }));

    res.status(200).json(parsed);
    connection.end();
  } catch (error) {
    console.error("Inbox error:", error);
    res.status(500).json({ error: 'Failed to fetch inbox', details: error.message });
  }
};

exports.getMailByUid = async (req, res) => {
  const { email, password } = req.user;
  const uid = parseInt(req.params.uid);

  if (isNaN(uid)) {
    return res.status(400).json({ error: 'Invalid UID' });
  }

  const config = {
    imap: {
      user: email,
      password,
      host: process.env.MAILSERVER_HOST,
      port: 143,
      tls: false,
      authTimeout: 3000
    }
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const searchCriteria = [['UID', uid]];
    const fetchOptions = {
      bodies: [''],
      markSeen: false,
      struct: true
    };

    const messages = await connection.search(searchCriteria, fetchOptions);
    if (!messages.length) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const message = messages[0];
    const all = _.find(message.parts, { which: '' });
    const parsedEmail = await simpleParser(all.body, { streamAttachments: false });

    const attachments = parsedEmail.attachments?.map(att => ({
      filename: att.filename,
      contentType: att.contentType,
      size: att.size,
      content: att.content.toString('base64')
    })) || [];

    connection.end();
    res.status(200).json({
      uid,
      subject: parsedEmail.subject || '',
      from: parsedEmail.from?.text || '',
      date: parsedEmail.date || '',
      body: parsedEmail.text?.trim() || '(no text)',
      attachments
    });
  } catch (error) {
    console.error("Fetch by UID error:", error);
    res.status(500).json({ error: 'Failed to fetch email', details: error.message });
  }
};

exports.searchBySubject = async (req, res) => {
  const { email, password } = req.user;
  const { keyword } = req.query; 

  if (!keyword) return res.status(400).json({ error: 'Missing keyword' });

  const config = {
    imap: {
      user: email,
      password,
      host: process.env.MAILSERVER_HOST,
      port: 143,
      tls: false,
      authTimeout: 3000
    }
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const messages = await connection.search(['ALL'], {
      bodies: [''],
      markSeen: false
    });

    const parsed = await Promise.all(
      messages.map(async (item) => {
        const all = _.find(item.parts, { which: '' });
        const parsedEmail = await simpleParser(all.body);
        return {
          uid: item.attributes.uid,
          subject: parsedEmail.subject || '',
          from: parsedEmail.from?.text || '',
          date: parsedEmail.date || '',
          body: parsedEmail.text?.trim() || '(no text)'
        };
      })
    );

    const lowerKey = keyword.toLowerCase();
    const filtered = parsed.filter(mail =>
      mail.subject && mail.subject.toLowerCase().includes(lowerKey)
    );

    connection.end();
    res.status(200).json(filtered);
  } catch (error) {
    console.error('Search by subject error:', error);
    res.status(500).json({ error: 'Failed to search by subject', details: error.message });
  }
};

exports.searchByBody = async (req, res) => {
  const { email, password } = req.user;
  const { keyword } = req.query; 

  if (!keyword) return res.status(400).json({ error: 'Missing keyword' });

  const config = {
    imap: {
      user: email,
      password,
      host: process.env.MAILSERVER_HOST,
      port: 143,
      tls: false,
      authTimeout: 3000
    }
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');

    const messages = await connection.search(['ALL'], {
      bodies: [''],
      markSeen: false
    });

    const parsed = await Promise.all(
      messages.map(async (item) => {
        const all = _.find(item.parts, { which: '' });
        const parsedEmail = await simpleParser(all.body);
        return {
          uid: item.attributes.uid,
          subject: parsedEmail.subject || '',
          from: parsedEmail.from?.text || '',
          date: parsedEmail.date || '',
          body: parsedEmail.text?.trim() || '(no text)'
        };
      })
    );

    // Lọc theo nội dung (body)
    const lowerKey = keyword.toLowerCase();
    const filtered = parsed.filter(mail =>
      mail.body && mail.body.toLowerCase().includes(lowerKey)
    );

    connection.end();
    res.status(200).json(filtered);
  } catch (error) {
    console.error('Search by body error:', error);
    res.status(500).json({ error: 'Failed to search by body', details: error.message });
  }
};

