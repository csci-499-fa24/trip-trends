const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

//router.post("/", UserController.createUser);
router.get("/", UserController.getUsers);
router.get("/:userId", UserController.getUserById);
router.put("/:userId", UserController.updateUser);
router.delete("/:userId", UserController.deleteUser);
router.post("/auth/google", UserController.createGoogleUser);

module.exports = router;
