const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

// OTP store (in-memory, replace with DB in production)
const otpStore = new Map();

// Email transporter setup (Gmail SMTP)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,      // Gmail email
    pass: process.env.GMAIL_PASS       // App password from Google account
  }
});

// ... existing register, login, update-profile, change-password routes ...

// Forgot Password - generate OTP & send email
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in otpStore with expiry (e.g., 5 minutes)
    const expiry = Date.now() + (parseInt(process.env.OTP_EXPIRY_MINUTES) || 5) * 60 * 1000;
    otpStore.set(email, { otp, expiry });

    // Send OTP email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}. It is valid for ${process.env.OTP_EXPIRY_MINUTES || 5} minutes.`
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending OTP', error: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = otpStore.get(email);

  if (!record) return res.status(400).json({ message: 'No OTP requested for this email' });

  if (Date.now() > record.expiry) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  res.json({ message: 'OTP verified' });
});

// Reset password after OTP verified
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const record = otpStore.get(email);
  if (!record) return res.status(400).json({ message: 'No OTP requested for this email' });

  if (Date.now() > record.expiry) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP expired' });
  }

  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    otpStore.delete(email);  // Clear OTP after successful reset

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Error resetting password', error: err.message });
  }
});

module.exports = router;
