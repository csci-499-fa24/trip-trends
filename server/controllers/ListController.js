const Trip = require('../models/Trip');
const List = require('../models/List');

// Function to create a new list item
const createListItem = async (req, res) => {
    const { tripId } = req.params; // Get tripId from URL parameters
    const { name, list_type, is_completed } = req.body; // Get fields from the request body

    try {
        // Create the new list item
        const newListItem = await List.create({
            trip_id: tripId,
            name,
            list_type,
            is_completed: is_completed || false, // Default to false if not provided
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
            message: 'Internal server error',
            error: error.message
        });
    }
};

const updateListCompletion = async (req, res) => {
    const { tripId, listId } = req.params; // Get tripId and listId from URL parameters
    const { isCompleted } = req.body; // Get isCompleted from the request body

    try {
        // Find the list item by tripId and listId
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

        // Update the isCompleted field
        listItem.is_completed = isCompleted;

        // Save the changes
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

module.exports = {
    createListItem,
    updateListCompletion
};
