const express = require('express');
const router = express.Router();
const ListController = require('../controllers/ListController');

router.post('/create-item/:tripId', ListController.createListItem);
router.put('/update-completion/:tripId/:listId', ListController.updateListCompletion);
router.put('/update-name/:tripId/:listId/', ListController.updateListName);
router.delete('/delete-item/:tripId/:listId', ListController.deleteListItem);
router.get('/get-purchaseList/:tripId', ListController.getPurchaseListsByTripId);
router.get('/get-sightseeingList/:tripId', ListController.getSightseeingListsByTripId);

module.exports = router;