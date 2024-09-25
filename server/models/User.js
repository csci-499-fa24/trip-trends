const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

//  db schema to add a user
const User = sequelize.define('user', {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fname: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    lname: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
        // validate: {
        //     isEmail: true
        // }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    tableName: 'users',
    timestamps: false
});

module.exports = User;

