const User = require("../models/User");

// post new user data into the db
const createUser = async (req, res) => {
    const { user_id, fname, lname, email, image} = req.body;
    try {
        // create a model instance 
        const newUser = await User.create({ user_id, fname, lname, email, image });
        res.status(201).json({ data: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// get all users data in the db
const getUsers = async (req, res) => {
    try {
        const allUsers = await User.findAll();
        res.json({ data: allUsers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    createUser,
    getUsers
};