
require('dotenv').config();
const axios = require('axios');
const pool = require('../config/db'); 
const crypto = require('crypto');
const { execSync } = require('child_process');


const clientId = process.env.LAOID_CLIENT_ID;
const clientSecret = process.env.LAOID_CLIENT_SECRET;

exports.loginWithLaoID = async (req, res) => {
  const { authorization_code } = req.body;

  if (!authorization_code) {
    return res.status(400).json({ message: "Missing authorization_code" });
  }

  try {
 
    const tokenRes = await axios.post(
      "https://demo-sso.tinasoft.io/api/v1/third-party/verify",
      {
        code: authorization_code,
        clientId,
        clientSecret
      },
      {
        headers: { "Content-Type": "application/json" }
      }
    );

    const accessToken = tokenRes.data?.data?.accessToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Không lấy được token từ LaoID" });
    }




    const userRes = await axios.get(
      "https://demo-sso.tinasoft.io/api/v1/third-party/me",
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "x-api-key": clientId,
          "X-Accept-Language": "vi"
        }
      }
    );

    const user = userRes.data?.data;
    console.log("User info:", user);
    const email = `${user.username}@yourdomain.com`;

   
    const [rows] = await pool.query('SELECT * FROM virtual_users WHERE email = ?', [email]);

    let rawPassword = null;

    if (rows.length === 0) {
      
      rawPassword = crypto.randomBytes(8).toString('hex');
      const sshUser = 'tamtanbk62'; 
      const sshHost = process.env.MAILSERVER_HOST; 
      const doveadmCmd = `ssh ${sshUser}@${sshHost} "sudo doveadm pw -s SHA512-CRYPT -p '${rawPassword}'"`;

      const hash = execSync(doveadmCmd).toString().trim();
      console.log(`Tạo mật khẩu mới cho email: ${email} - Mật khẩu: ${hash}`);
      
      const [domainRows] = await pool.query("SELECT id FROM virtual_domains WHERE name = ?", ["yourdomain.com"]);

      if (domainRows.length === 0) {
        return res.status(500).json({ message: "Không tìm thấy domain trong DB" });
      }

      const domainId = domainRows[0].id;

      await pool.query(
        'INSERT INTO virtual_users (email, password, domain_id, raw_password) VALUES (?, ?, ?, ?)',
        [email, hash, domainId, rawPassword]
      );

      console.log(`Tạo tài khoản email mới cho: ${email}`);
    } else {
      console.log(`Tài khoản email đã tồn tại: ${email}`);
      rawPassword = rows[0].raw_password;
    }

    return res.status(200).json({
      message: "Đăng nhập thành công",
      user,
      mailAccount: {
        email,
        password: rawPassword
      }
    });

  } catch (err) {
    console.error("loginWithLaoID error:", err?.response?.data || err.message);
    return res.status(500).json({ message: "Lỗi khi xác thực với LaoID" });
  }
};

