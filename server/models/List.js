const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const List = sequelize.define('List', {
    list_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'all_trips', 
            key: 'trip_id',
        },
        onDelete: 'CASCADE', 
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    list_type: {
        type: DataTypes.ENUM('purchase list', 'sightseeing list'), 
        allowNull: false,
    },
    is_completed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: 'lists',
    timestamps: false, 
});

module.exports = List;