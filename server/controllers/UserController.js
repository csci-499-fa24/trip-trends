const User = require("../models/User");
const jwt = require('jsonwebtoken');


// post new user data into the db
const createUser = async (req, res) => {
    const { user_id, fname, lname, email, image } = req.body;
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
    createUser,
    getUsers,
    createGoogleUser
};