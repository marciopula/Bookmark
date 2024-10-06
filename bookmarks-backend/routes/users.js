const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

const User = require('../models/User');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not set. Using default secret. DO NOT USE THIS IN PRODUCTION!');
  process.env.JWT_SECRET = 'default_secret_key_change_this';
}

const JWT_SECRET = process.env.JWT_SECRET.trim();

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      let user = await User.findOne({ where: { email } });

      if (user) {
        return res.status(400).json({ msg: 'User already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user = await User.create({
        name,
        email,
        password: hashedPassword
      });

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        JWT_SECRET,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) {
            console.error('JWT Sign Error:', err);
            return res.status(500).json({ msg: 'Error generating token', error: err.message });
          }
          res.json({ token, msg: 'User registered successfully' });
        }
      );
    } catch (err) {
      console.error('Server error:', err);
      res.status(500).json({ msg: 'Server error', error: err.message });
    }
  }
);

module.exports = router;