const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

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
    role: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'owner',
        validate: {
            isIn: [['owner', 'editor', 'viewer']]
        }
    },
    favorite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'sharedtrips',
    timestamps: false,
    indexes: [{
        unique: true,
        fields: ['user_id', 'trip_id']
    }]
});

module.exports = SharedTrip;