// initialize sequelize with postgres database URL

// import sequelize
const { Sequelize } = require('sequelize');

// create new instance of sequelize
const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: "postgres",
    logging: false, // update to false to turn off logging
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

module.exports = sequelize;