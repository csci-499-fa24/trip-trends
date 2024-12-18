const { DataTypes } = require('sequelize');
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
                if (new Date(value) < new Date(this.start_date)) {
                    throw new Error('End date must be on or after the start date');
                }
            }
        }        
    },
    budget: {
        type: DataTypes.DOUBLE,
        allowNull: false
    }
}, {
    tableName: 'all_trips',
    timestamps: false
});

module.exports = Trip;