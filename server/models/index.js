const { Sequelize } = require('sequelize');
// const sequelize = new Sequelize(process.env.DATABASE_URL);
const sequelize = require('../config/db');

// import models
const User = require('../models/User');
const Trip = require('../models/Trip');
const SharedTrip = require('../models/SharedTrip');
const TripLocation = require('../models/TripLocation');
const Expense = require('../models/Expense');

// define associations
// SharedTrip associations
User.belongsToMany(Trip, {
    through: SharedTrip,
    foreignKey: 'user_id',
    otherKey: 'trip_id',
    onDelete: 'CASCADE',
});

Trip.belongsToMany(User, {
    through: SharedTrip,
    foreignKey: 'trip_id',
    otherKey: 'user_id',
    onDelete: 'CASCADE',
});

// TripLocation associations
// TripLocation.removeAttribute('id');
Trip.hasMany(TripLocation, 
    { foreignKey: 'trip_id', 
        onDelete: 'CASCADE'}, 
);

TripLocation.belongsTo(Trip, 
    { foreignKey: 'trip_id', 
        onDelete: 'CASCADE'}
);

// export models and sequelize instance
module.exports = { User, Trip, SharedTrip, TripLocation, Expense, sequelize };
