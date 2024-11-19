const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// db schema to add a expenses
const Expense = sequelize.define('expense', {
    expense_id: {
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
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
    },
    posted: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    image: {
        type: DataTypes.BLOB,
        allowNull: true,
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    
}, {
    tableName: 'expenses',
    timestamps: false
});

module.exports = Expense;