require('dotenv').config()
const express = require("express");
const cors = require('cors')
const app = express();
const { Sequelize, DataTypes } = require('sequelize');
const jwt = require('jsonwebtoken');


app.use(cors());
app.use(express.json());

app.get("/api/home", (req, res) => {
    res.json({ message: "Hello World!" });
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
const aTrip = sequelize.define("all_trips", {
    trip_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
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
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    tableName: 'all_trips',
    timestamps: false
});

//  db schema to add a user
const User = sequelize.define('user', {
    user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fname: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    lname: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        unique: true,
        allowNull: false
    },
    image: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: false
});

// db schema to add a expenses
const Expenses = sequelize.define('expense', {
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
        type: DataTypes.STRING(255),
        allowNull: true,
    }
}, {
    tableName: 'expenses',
    timestamps: false
});


//db schema to add a shared trip
const sharedTrip = sequelize.define('sharedtrips', {
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id',
        },
    },
    trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'all_trips',
            key: 'trip_id',
        },
    },
}, {
    tableName: 'sharedtrips',
    timestamps: false,
});
User.belongsToMany(aTrip, {
    through: sharedTrip,
    foreignKey: 'user_id',
    otherKey: 'trip_id',
});

aTrip.belongsToMany(User, {
    through: sharedTrip,
    foreignKey: 'trip_id',
    otherKey: 'user_id',
});


// db schema to add a trip location
const TLocation = sequelize.define('tlocation', {
    trip_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'all_trips',
            key: 'trip_id',
        },
    },
    location: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
}, {
    tableName: 'tlocation',
    timestamps: false,

    underscored: true
});
TLocation.removeAttribute('id');
aTrip.hasMany(TLocation, { foreignKey: 'trip_id' });
TLocation.belongsTo(aTrip, { foreignKey: 'trip_id' });


// post new trip data into the db
app.post("/api/create-trip", async (req, res) => {
    const { name, start_date, end_date, budget, image } = req.body;
    try {
        // create a model instance 
        const newTrip = await aTrip.create({ name, start_date, end_date, budget, image });
        res.json({ data: newTrip });
    } catch (err) {
        console.error(err);
    }
});

// get all trip data in the db
app.get("/api/get-trips", async (req, res) => {
    try {
        const allTrips = await aTrip.findAll();
        res.json({ data: allTrips });
    } catch (err) {
        console.error(err);
    }
});

// post new user data into the db
app.post("/api/create-user", async (req, res) => {
    const { user_id, fname, lname, email, password } = req.body;
    try {
        // create a model instance 
        const newUser = await User.create({ user_id, fname, lname, email, password });
        res.json({ data: newUser });
    } catch (err) {
        console.error(err);
    }
});

// get all users data in the db
app.get("/api/get-users", async (req, res) => {
    try {
        const allUsers = await User.findAll();
        res.json({ data: allUsers });
    } catch (err) {
        console.error(err);
    }
});

//  post new expense to the db
app.post("/api/create-expense", async (req, res) => {
    const { expense_id, trip_id, name, amount, category, currency, posted, notes, image } = req.body;
    try {
        // create a model instance 
        const newExpense = await Expenses.create({ expense_id, trip_id, name, amount, category, currency, posted, notes, image });
        res.json({ data: newExpense });
    } catch (err) {
        console.error(err);
    }
});

// get all expenses from db
app.get("/api/get-expenses", async (req, res) => {
    try {
        const expenses = await Expenses.findAll();
        res.json({ data: expenses });
    } catch (err) {
        console.error(err);
    }
});

// post new shared trip to db
app.post("/api/create-shared-trips", async (req, res) => {
    const { user_id, trip_id } = req.body;
    try {
        // create a model instance 
        const newSharedTrip = await sharedTrip.create({ user_id, trip_id });
        res.json({ data: newSharedTrip });
    } catch (err) {
        console.error(err);
    }
});

// get all shared trips from db
app.get("/api/get-shared-trips", async (req, res) => {
    try {
        const sharedTrips = await sharedTrip.findAll();
        res.json({ data: sharedTrips });
    } catch (err) {
        console.error(err);
    }
});

// post a trip location in db
app.post("/api/create-tlocation", async (req, res) => {
    const { trip_id, location } = req.body;
    try {
        // create a model instance 
        const tripLocation = await TLocation.create({ trip_id, location });
        res.json({ data: tripLocation });
    } catch (err) {
        console.error(err);
    }
}); 

// get all trip locations from db
app.get("/api/get-tlocations", async (req, res) => {
    try {
        const tlocation = await TLocation.findAll();
        res.json({ data: tlocation });
    } catch (err) {
        console.error(err);
    }
});

// Endpoint to handle Google login/signup
app.post('/auth/google', async (req, res) => {
    const { token } = req.body;

    try {
        // Decode the token and get user details from Google
        const decoded = jwt.decode(token);

        const email = decoded.email;
        const name = decoded.name;
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts[1];
        const picture = decoded.picture;

        // Check if the user already exists in the database
        const user = await User.findOne({ where: { email } });

        if (user) {
            // User exists, return success message
            return res.status(200).json({ message: 'User Already Exists', user });
        } else {
            // User does not exist, insert the user into the database
            const newUser = await User.create({
                fname: firstName,
                lname: lastName,
                email,
                image: picture
            });

            return res.status(201).json({ message: 'User created successfully', user: newUser });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error processing request' });
    }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
