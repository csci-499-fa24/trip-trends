require('dotenv').config()
const express = require("express");
const cors = require('cors')
const app = express();
const db = require('./config/db');
const { syncDatabase } = require('./models');

// import route modules
const userRoutes = require('./routes/userRoutes');
const tripRoutes = require('./routes/tripRoutes');
const sharedTripRoutes = require('./routes/sharedTripRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const tripLocationRoutes = require('./routes/tripLocationRoutes');
const imageRoutes = require('./routes/imageRoutes');

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    next();
});

// check if server is running
app.get("/api/home", (req, res) => {
    res.json({ message: "Hello World!" });
});

// define API endpoints
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/shared-trips", sharedTripRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/trip-locations", tripLocationRoutes);
app.use("/api/images", imageRoutes);

// start server
const port = process.env.PORT || 8080;

// sync database
db.authenticate() // check if db is connected
    .then(() => {
        console.log("Database connection successful");
        return db.sync(); // sync models with db
    })
    .then(() => {
        app.listen(port, () => {
            console.log(`Server started on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('Unable to connect to database:', err);
    });