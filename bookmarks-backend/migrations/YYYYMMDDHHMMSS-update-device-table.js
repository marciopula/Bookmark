'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the index already exists
      const indexes = await queryInterface.showIndex('Devices');
      const indexExists = indexes.some(index => 
        index.name === 'devices_userId_deviceId_unique' || 
        (index.fields.includes('userId') && index.fields.includes('deviceId') && index.unique)
      );
      
      if (!indexExists) {
        // Remove any existing non-unique index on these columns if it exists
        try {
          await queryInterface.removeIndex('Devices', ['userId', 'deviceId']);
        } catch (removeError) {
          console.log('No existing index to remove');
        }

        // Add the new unique index
        await queryInterface.addIndex('Devices', ['userId', 'deviceId'], {
          unique: true,
          name: 'devices_userId_deviceId_unique'
        });
        console.log('Index devices_userId_deviceId_unique created successfully');
      } else {
        console.log('Unique index on userId and deviceId already exists, skipping creation');
      }
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeIndex('Devices', 'devices_userId_deviceId_unique');
      console.log('Index devices_userId_deviceId_unique removed successfully');
    } catch (error) {
      console.error('Error removing index:', error);
      throw error;
    }
  }
};