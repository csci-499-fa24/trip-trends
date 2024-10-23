const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

//db schema to add a shared trip
const Image = sequelize.define('image', {
    image_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
    image_url: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'images',
    timestamps: false
});

module.exports = Image;