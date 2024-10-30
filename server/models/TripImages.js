const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TripImages = sequelize.define('TripImages', {
    image_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'all_trips', // Name of the referenced table
            key: 'trip_id',
        },
        onDelete: 'CASCADE',
    },
    image: {
        type: DataTypes.BLOB, // Stores binary image data
        allowNull: false,
    },
    uploaded_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
}, {
    tableName: 'trip_images',
    timestamps: false,
});

module.exports = TripImages;