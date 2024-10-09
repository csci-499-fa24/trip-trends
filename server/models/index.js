const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);

// import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Trip = require('./Trip')(sequelize, Sequelize.DataTypes);
const SharedTrip = require('./SharedTrip')(sequelize, Sequelize.DataTypes);
const TripLocation = require('./TripLocation')(sequelize, Sequelize.DataTypes);
const Expense = require('./Expense')(sequelize, Sequelize.DataTypes);

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
