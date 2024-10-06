'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Get all existing indexes
      const indexes = await queryInterface.showIndex('Devices');
      
      // Remove all deviceId indexes except the primary key
      for (const index of indexes) {
        if (index.name.startsWith('deviceId') && index.name !== 'PRIMARY') {
          await queryInterface.removeIndex('Devices', index.name);
          console.log(`Removed index: ${index.name}`);
        }
      }

      // Check if the composite unique index already exists
      const compositeIndexExists = indexes.some(index => 
        index.name === 'devices_userId_deviceId_unique' || 
        (index.fields.includes('userId') && index.fields.includes('deviceId') && index.unique)
      );

      if (!compositeIndexExists) {
        await queryInterface.addIndex('Devices', ['userId', 'deviceId'], {
          unique: true,
          name: 'devices_userId_deviceId_unique'
        });
        console.log('Added composite index: devices_userId_deviceId_unique');
      } else {
        console.log('Composite index already exists, skipping creation');
      }

      console.log('Migration completed successfully');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Down migration not implemented for safety reasons.');
  }
};