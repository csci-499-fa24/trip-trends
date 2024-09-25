const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// db schema to add a trip
const Trip = sequelize.define("all_trips", {
    trip_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
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

module.exports = Trip;