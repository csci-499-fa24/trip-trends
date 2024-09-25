require('dotenv').config()
const express = require("express");
const cors = require('cors')
const app = express();
const db = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const tripRoutes = require('./routes/tripRoutes');
const sharedTripRoutes = require('./routes/sharedTripRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const locationRoutes = require('./routes/locationRoutes');

app.use(cors());
app.use(express.json());

// connect to db and authenticate
db.authenticate().then(() => {
    console.log("Database connection successful");
})
    .catch((err) => {
        console.error('Unable to connect to the database:', err);
    });

// check if server is running
app.get("/api/home", (req, res) => {
    res.json({ message: "Hello World!" });
});

app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/shared-trips", sharedTripRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/locations", locationRoutes);


// start server
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
