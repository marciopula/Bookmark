const { Sequelize } = require('sequelize');

const dbName = process.env.DB_NAME.trim();
const dbUser = process.env.DB_USER.trim();
const dbPassword = process.env.DB_PASSWORD.trim();
const dbHost = process.env.DB_HOST.trim();

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'production' ? false : console.log
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
