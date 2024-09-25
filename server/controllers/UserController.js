const User = require("../models/User");

// post new user data into the db
const createUser = async (req, res) => {
    const { user_id, fname, lname, email, password } = req.body;
    try {
        // create a model instance 
        const newUser = await User.create({ user_id, fname, lname, email, password });
        res.json({ data: newUser });
    } catch (err) {
        console.error(err);
    }
};

// get all users data in the db
const getUsers = async (req, res) => {
    try {
        const allUsers = await User.findAll();
        res.json({ data: allUsers });
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    createUser,
    getUsers
};