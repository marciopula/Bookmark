const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Device = sequelize.define('Device', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  deviceId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bookmarkCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'deviceId'],
      name: 'devices_userId_deviceId_unique'
    }
  ]
});

module.exports = Device;