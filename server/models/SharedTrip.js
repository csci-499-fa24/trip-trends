const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Trip = require('./Trip');

//db schema to add a shared trip
const SharedTrip = sequelize.define('sharedtrips', {
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
            onUpdate: 'CASCADE', 
            onDelete: 'CASCADE',
        },
    },
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
}, {
    tableName: 'sharedtrips',
    timestamps: false,
    indexes: [{
        unique: true,
        fields: ['user_id', 'trip_id']
    }]
});
User.belongsToMany(Trip, {
    through: SharedTrip,
    foreignKey: 'user_id',
    otherKey: 'trip_id',
});

Trip.belongsToMany(User, {
    through: SharedTrip,
    foreignKey: 'trip_id',
    otherKey: 'user_id',
});

module.exports = SharedTrip;