const { Sequelize } = require('sequelize');
// const sequelize = new Sequelize(process.env.DATABASE_URL);
const sequelize = require('../config/db');

// import models
const User = require('./User');
const Trip = require('./Trip');
const SharedTrip = require('./SharedTrip');
const TripLocation = require('./TripLocation');
const Expense = require('./Expense');

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

User.hasMany(SharedTrip, { foreignKey: 'user_id' });
SharedTrip.belongsTo(User, { foreignKey: 'user_id' });

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