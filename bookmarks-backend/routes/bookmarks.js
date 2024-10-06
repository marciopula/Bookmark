const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Bookmark = require('../models/Bookmark');
const Device = require('../models/Device');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

router.post('/', auth, async (req, res) => {
  const { deviceId, bookmarks, chunkIndex, totalChunks } = req.body;

  let retries = 0;
  let device;
  let totalSynced = 0;

  while (retries < MAX_RETRIES) {
    try {
      await sequelize.transaction(async (t) => {
        device = await Device.findOne({ 
          where: { deviceId: deviceId, userId: req.user.id },
          transaction: t,
          lock: t.LOCK.UPDATE
        });

        if (!device) {
          throw new Error('Device not found');
        }

        if (chunkIndex === 0) {
          await Bookmark.destroy({ where: { deviceId: device.id }, transaction: t });
          device.bookmarkCount = 0;
        }

        const bookmarksToUpsert = bookmarks.map(bookmark => ({
          id: bookmark.id,
          userId: req.user.id,
          deviceId: device.id,
          parentId: bookmark.parentId,
          title: bookmark.title,
          url: bookmark.url,
          dateAdded: new Date(bookmark.dateAdded),
          isFolder: bookmark.isFolder
        }));

        await Bookmark.bulkCreate(bookmarksToUpsert, {
          updateOnDuplicate: ['title', 'url', 'dateAdded', 'isFolder', 'parentId'],
          transaction: t
        });

        device.bookmarkCount += bookmarks.length;
        await device.save({ transaction: t });

        totalSynced = device.bookmarkCount;
      });

      return res.json({ 
        message: `Chunk ${chunkIndex + 1}/${totalChunks} synced successfully`, 
        count: bookmarks.length,
        totalCount: totalSynced
      });
    } catch (err) {
      if (err.name === 'SequelizeDatabaseError' && err.parent.code === 'ER_LOCK_DEADLOCK') {
        retries++;
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error('Error syncing bookmarks:', err);
        return res.status(500).json({ msg: 'Server error', error: err.message });
      }
    }
  }

  console.error(`Failed to sync bookmarks after ${MAX_RETRIES} retries`);
  res.status(500).json({ msg: 'Server error: Max retries reached' });
});

router.get('/:deviceId', auth, async (req, res) => {
  try {
    const { search = '' } = req.query;

    const device = await Device.findOne({ 
      where: { 
        [Op.or]: [
          { id: req.params.deviceId },
          { deviceId: req.params.deviceId }
        ],
        userId: req.user.id 
      } 
    });

    if (!device) {
      return res.status(404).json({ msg: 'Device not found' });
    }

    const whereClause = {
      deviceId: device.id,
      [Op.or]: [
        { title: { [Op.like]: `%${search}%` } },
        { url: { [Op.like]: `%${search}%` } }
      ]
    };

    const bookmarks = await Bookmark.findAll({
      where: whereClause,
      order: [
        ['isFolder', 'DESC'],
        ['title', 'ASC']
      ]
    });

    const buildTree = (bookmarks, parentId = null) => {
      return bookmarks
        .filter(b => b.parentId === parentId)
        .map(bookmark => ({
          ...bookmark.toJSON(),
          children: buildTree(bookmarks, bookmark.id)
        }))
        .sort((a, b) => {
          if (a.isFolder === b.isFolder) {
            return a.title.localeCompare(b.title);
          }
          return a.isFolder ? -1 : 1;
        });
    };

    const bookmarkTree = buildTree(bookmarks);

    res.json({
      bookmarks: bookmarkTree,
      totalBookmarks: bookmarks.length
    });
  } catch (err) {
    console.error('Error in GET /bookmarks/:deviceId:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;