const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');


//  db schema to add a user
const User = sequelize.define('user', {
    user_id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    fname: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isAlpha: true,
            len: [2, 50],
        }
    },
    lname: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
            isAlpha: true,
            len: [2, 50],
        }
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true
        }
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
    // password: {
    //     type: DataTypes.STRING(255),
    //     allowNull: false
    // }
}, {
    tableName: 'users',
    timestamps: false
});
// User.beforeCreate(user => user.id = uuid());

module.exports = User;
