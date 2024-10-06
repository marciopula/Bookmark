'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if the table exists
      const tableExists = await queryInterface.showAllTables().then(tables => tables.includes('Bookmarks'));
      
      if (!tableExists) {
        // If the table doesn't exist, create it
        await queryInterface.createTable('Bookmarks', {
          // Define your table schema here
          // Example:
          id: {
            type: Sequelize.STRING,
            primaryKey: true,
            allowNull: false
          },
          // ... other fields
        });
      } else {
        // If the table exists, modify it
        await queryInterface.changeColumn('Bookmarks', 'id', {
          type: Sequelize.STRING,
          allowNull: false
        });
      }

      // Add the foreign key constraint if it doesn't exist
      const constraints = await queryInterface.showConstraint('Bookmarks', 'fk_bookmark_parent');
      if (constraints.length === 0) {
        await queryInterface.addConstraint('Bookmarks', {
          fields: ['parentId'],
          type: 'foreign key',
          name: 'fk_bookmark_parent',
          references: {
            table: 'Bookmarks',
            field: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Revert changes if necessary
    try {
      await queryInterface.removeConstraint('Bookmarks', 'fk_bookmark_parent');
      await queryInterface.changeColumn('Bookmarks', 'id', {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      });
    } catch (error) {
      console.error('Revert migration error:', error);
      throw error;
    }
  }
};