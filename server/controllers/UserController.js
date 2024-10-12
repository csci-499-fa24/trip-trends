const User = require("../models/User");
const jwt = require('jsonwebtoken');


// POST new user data
// const createUser = async (req, res) => {
//     const { fName, lName, email, image } = req.body;
//     try {
//         // create model instance 
//         const newUser = await User.create({ fname: fName, lname: lName, email, image });
//         res.status(201).json({ data: newUser });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Internal Server Error", error: err.message });
//     }
// };

// GET all user data
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
    const userId = req.params.userId;
    try {
        const user = await User.findByPk(userId);
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
    const userId = req.params.userId;
    const { fname, lname, email, image } = req.body;
    try {
        // find user by userId
        const user = await User.findByPk(userId);
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
    const userId = req.params.userId;
    try {
        // delete user by userId
        const deletedCount = await User.destroy({ where: { user_id: userId } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(204).json();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
};
        
// Endpoint to handle Google login/signup
const createGoogleUser = async (req, res) => {
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
};

module.exports = {
    //createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    createGoogleUser
};