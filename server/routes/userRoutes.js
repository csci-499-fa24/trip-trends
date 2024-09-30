const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.post("/create-user", UserController.createUser);
router.get("/get-users", UserController.getUsers);
router.get("/get-user/:id", UserController.getUserById);
router.put("/update-user/:id", UserController.updateUser);
router.delete("/delete-user/:id", UserController.deleteUser);
router.post("/auth/google", UserController.createGoogleUser);

module.exports = router;
