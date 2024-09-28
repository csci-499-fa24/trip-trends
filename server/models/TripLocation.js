const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Trip = require('./Trip');

// db schema to add a trip location
const TripLocation = sequelize.define('TripLocation', {
    trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'all_trips',
            key: 'trip_id',
        },
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: 'tlocation',
    timestamps: false,
    underscored: true
});

TripLocation.removeAttribute('id');
Trip.hasMany(TripLocation, { foreignKey: 'trip_id' });
TripLocation.belongsTo(Trip, { foreignKey: 'trip_id' });

module.exports = TripLocation;