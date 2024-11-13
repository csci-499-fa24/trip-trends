const express = require('express');
const router = express.Router();
const ListController = require('../controllers/ListController');

router.post('/create-item/:tripId', ListController.createListItem);
router.put('/update-completion/:tripId/:listId', ListController.updateListCompletion);

module.exports = router;