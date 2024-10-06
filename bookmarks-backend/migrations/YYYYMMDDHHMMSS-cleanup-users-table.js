'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Get all existing indexes
      const indexes = await queryInterface.showIndex('Users');
      
      // Remove all indexes except the primary key and the email unique index
      for (const index of indexes) {
        if (index.name !== 'PRIMARY' && index.name !== 'users_email_unique') {
          await queryInterface.removeIndex('Users', index.name);
          console.log(`Removed index: ${index.name}`);
        }
      }

      // Check if the email unique index exists
      const emailIndexExists = indexes.some(index => 
        index.name === 'users_email_unique' || 
        (index.fields.includes('email') && index.unique)
      );

      if (!emailIndexExists) {
        await queryInterface.addIndex('Users', ['email'], {
          unique: true,
          name: 'users_email_unique'
        });
        console.log('Added unique index: users_email_unique');
      } else {
        console.log('Email unique index already exists, skipping creation');
      }

      console.log('Users table cleanup completed successfully');
    } catch (error) {
      console.error('Error in migration:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('Down migration not implemented for safety reasons.');
  }
};