const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

// db schema to add a trip
const Trip = sequelize.define("all_trips", {
    trip_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    // user_id: { 
    //     type: DataTypes.UUID,
    //     allowNull: false,
    //     references: {
    //         model: 'users', 
    //         key: 'user_id', 
    //     }
    // },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
            isAfterStartDate(value) {
                if (new Date(value) <= new Date(this.start_date)) {
                    throw new Error('End date must be after start date');
                }
            }
        }
    },
    budget: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'all_trips',
    timestamps: false
});
// User.hasMany(Trip, { foreignKey: 'user_id' });
// Trip.belongsTo(User, { foreignKey: 'user_id' });

module.exports = Trip;