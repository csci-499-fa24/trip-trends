require('dotenv').config()
const express = require("express");
const cors = require('cors')
const app = express();
const { Sequelize, DataTypes } = require('sequelize'); 

app.use(cors());
app.use(express.json());

app.get("/api/home", (req, res) => {
    res.json({message: "Hello World!"});
});

const sequelize = new Sequelize(process.env.DB_URL, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
})

// connect to db and authenticate
sequelize.authenticate().then(() => {
    console.log("Database connection successful");
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
});

// db schema to add a trip
const aTrip = sequelize.define("trip", {
    // attributes
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    budget: {
        type: DataTypes.DOUBLE,
        allowNull: false
    }
});

// post new trip data into the db
app.post("/create-trip", async (req, res) => {
    const {name, start_date, end_date, budget} = req.body;
    try {
        // create a model instance 
        const newTrip = await aTrip.create({name, start_date, end_date, budget});
        res.json(newTrip);
    } catch (err) {
        console.error(err);
    }
});

// get all trip data in the db
app.get("/get-trips", async (req, res) => {
    try {
        const allTrips = await aTrip.findAll();
        res.json(allTrips);
    } catch (err) {
        console.error(err);
    }
});

aTrip.sync({force: true});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
