const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Bookmark = sequelize.define('Bookmark', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  deviceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  parentId: {
    type: DataTypes.STRING,
    allowNull: true,
    references: {
      model: 'Bookmarks',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateAdded: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isFolder: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['id', 'userId', 'deviceId']
    }
  ]
});

Bookmark.hasMany(Bookmark, { as: 'children', foreignKey: 'parentId' });
Bookmark.belongsTo(Bookmark, { as: 'parent', foreignKey: 'parentId' });

module.exports = Bookmark;