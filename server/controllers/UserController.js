const User = require("../models/User");

// POST new user data into the db
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

// GET all user data in the db
const getUsers = async (req, res) => {
    try {
        const allUsers = await User.findAll();
        res.json({ data: allUsers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// GET specific user data by userId
const getUserById = async (req, res) => {
    const id = req.params.id;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ data: user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// PUT request to update user data
const updateUser = async (req, res) => {
    const id = req.params.id;
    const { fname, lname, email, image } = req.body;
    try {
        // find user by id
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json();
        }
        // update user data
        const updatedUser = await user.update({ fname, lname, email, image });
        res.json({ data: updatedUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

// DELETE user data
const deleteUser = async (req, res) => {
    const id = req.params.id;
    try {
        // delete user by id
        const deletedCount = await User.destroy({ where: { user_id: id } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(204).json();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser
};