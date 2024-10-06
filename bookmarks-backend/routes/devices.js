const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const Device = require('../models/Device');
const Bookmark = require('../models/Bookmark');

router.get('/user', auth, async (req, res) => {
  try {
    const devices = await Device.findAll({ 
      where: { userId: req.user.id },
      attributes: ['id', 'name', 'deviceId', 'bookmarkCount']
    });
    res.json(devices);
  } catch (err) {
    console.error('Error in GET /devices/user:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', [
  auth,
  [
    check('name', 'Name is required').not().isEmpty(),
    check('deviceId', 'Device ID is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, deviceId } = req.body;

  try {
    let device = await Device.findOne({ where: { deviceId } });

    if (device) {
      return res.status(400).json({ msg: 'Device already registered' });
    }

    device = await Device.create({
      userId: req.user.id,
      name,
      deviceId,
      bookmarkCount: 0
    });

    res.json(device);
  } catch (err) {
    console.error('Error registering device:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const devices = await Device.findAll({ 
      where: { userId: req.user.id },
      attributes: ['id', 'name', 'deviceId', 'bookmarkCount', 'createdAt', 'updatedAt']
    });
    res.json(devices);
  } catch (err) {
    console.error('Error fetching devices:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const device = await Device.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!device) {
      return res.status(404).json({ msg: 'Device not found' });
    }

    await Bookmark.destroy({ where: { deviceId: device.id } });
    await device.destroy();

    res.json({ msg: 'Device and associated bookmarks removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.put('/:id', [auth, [
  check('name', 'Name is required').not().isEmpty()
]], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const device = await Device.findOne({ where: { id: req.params.id, userId: req.user.id } });

    if (!device) {
      return res.status(404).json({ msg: 'Device not found' });
    }

    device.name = req.body.name;
    await device.save();

    res.json(device);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

router.get('/:deviceId', auth, async (req, res) => {
  try {
    const device = await Device.findOne({ 
      where: { deviceId: req.params.deviceId, userId: req.user.id },
      attributes: ['id', 'deviceId', 'name', 'bookmarkCount', 'createdAt', 'updatedAt']
    });

    if (!device) {
      return res.status(404).json({ msg: 'Device not found' });
    }

    res.json(device);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;