const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Trip = require('./Trip');

// db schema to add a trip location
const Location = sequelize.define('trip_locations', {
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
Location.removeAttribute('id');
Trip.hasMany(Location, { foreignKey: 'trip_id' });
Location.belongsTo(Trip, { foreignKey: 'trip_id' });

module.exports = Location;