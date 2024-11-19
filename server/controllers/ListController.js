const Trip = require('../models/Trip');
const List = require('../models/List');

// Function to create a new list item
const createListItem = async (req, res) => {
    const { tripId } = req.params;
    const { name, list_type, is_completed } = req.body;

    try {
        // Create the new list item
        const newListItem = await List.create({
            trip_id: tripId,
            name,
            list_type,
            is_completed: is_completed || false,
        });

        return res.status(201).json({
            success: true,
            message: 'List item created successfully.',
            data: newListItem
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Failed to create list item.',
        });
    }
};


//Update list item completion state
const updateListCompletion = async (req, res) => {
    const { tripId, listId } = req.params;
    const { isCompleted } = req.body;

    try {
        const listItem = await List.findOne({
            where: {
                trip_id: tripId,
                list_id: listId
            }
        });

        if (!listItem) {
            return res.status(404).json({
                success: false,
                message: 'List item not found.'
            });
        }

        listItem.is_completed = isCompleted;

        await listItem.save();

        return res.status(200).json({
            success: true,
            message: 'List item updated successfully.',
            data: listItem
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

//Update list item name
const updateListName = async (req, res) => {
    const { tripId, listId } = req.params;
    const { name } = req.body;
    try {
        const listItem = await List.findOne({
            where: {
                trip_id: tripId,
                list_id: listId
            }
        });

        if (!listItem) {
            return res.status(404).json({
                success: false,
                message: 'List item not found.'
            });
        }

        listItem.name = name;

        await listItem.save();

        return res.status(200).json({
            success: true,
            message: 'List item name updated successfully.',
            data: listItem
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

//Delete list item
const deleteListItem = async (req, res) => {
    const { tripId, listId } = req.params;

    try {
        const listItem = await List.findOne({
            where: {
                trip_id: tripId,
                list_id: listId
            }
        });

        if (!listItem) {
            return res.status(404).json({
                success: false,
                message: 'List item not found.'
            });
        }

        await listItem.destroy();

        return res.status(200).json({
            success: true,
            message: 'List item deleted successfully.'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

//Get all purchase item based on tip id
const getPurchaseListsByTripId = async (req, res) => {
    const { tripId } = req.params;

    try {
        const purchaseLists = await List.findAll({
            where: {
                trip_id: tripId,
                list_type: 'purchase',
            },
        });

        if (!purchaseLists || purchaseLists.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No purchase lists found for trip ID ${tripId}`,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Purchase lists fetched successfully.',
            data: purchaseLists,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

//get all sightseeing item based on trip id
const getSightseeingListsByTripId = async (req, res) => {
    const { tripId } = req.params;

    try {
        const sightseeingLists = await List.findAll({
            where: {
                trip_id: tripId,
                list_type: 'sightseeing',
            },
        });

        if (!sightseeingLists || sightseeingLists.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No sightseeing lists found for trip ID ${tripId}`,
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Sightseeing lists fetched successfully.',
            data: sightseeingLists,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message,
        });
    }
};

module.exports = {
    createListItem,
    updateListCompletion,
    updateListName,
    deleteListItem,
    getPurchaseListsByTripId,
    getSightseeingListsByTripId
};
