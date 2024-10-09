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
            onUpdate: 'CASCADE', 
            onDelete: 'CASCADE',
        },
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    longitude: {
        type: DataTypes.DECIMAL(10,7),
        allowNull: true
    },
    latitude: {
        type: DataTypes.DECIMAL(10,7),
        allowNull: true,
    }
}, {
    tableName: 'tlocation',
    timestamps: false,
    underscored: true
});

TripLocation.removeAttribute('id');
// Trip.hasMany(TripLocation, 
//     { foreignKey: 'trip_id', 
//     onDelete: 'CASCADE'}, 
// );
// TripLocation.belongsTo(Trip, 
//     { foreignKey: 'trip_id', 
//     onDelete: 'CASCADE'}
// );

module.exports = TripLocation;