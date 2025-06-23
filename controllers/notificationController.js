const Notif = require('../models/notificationSchema');
const User = require('../models/usersSchema');

exports.notifyUser = async(notifData) => {
    const notifs = new Notif(notifData);

    await notifs.save();
}

exports.notifyAllWithRole = async({ notifData, role }) => {
    const usersWithRole = await User.find({ role: role });

    if (usersWithRole.length === 0) {
        console.log('No users found with the specified role');
        return;
    }
    
    const notifications = usersWithRole
        .filter(user => user._id !== undefined && user._id !== null)
        .map(user => {
            return new Notif({
                ...notifData,
                userId: user._id
            });
        });
    
    await Notif.insertMany(notifications);
}

// Create a new notification
exports.createNotif = async (req, res) => {
    try {
        const notifs = new Notif(req.body);
        await notifs.save();

        // Add the notification to the sales agent's notifications array
        // const salesAgent = await User.findById(req.body.salesAgent);

        // if (salesAgent) {
        //     salesAgent.notifs.push(notif._id);
        //     await salesAgent.save();
        // }

        res.status(201).json({ message: 'Notification created successfully', notifs });
    } catch (error) {
        res.status(500).json({ message: 'Error creating notifications', error: error.message });
    }
};

// Get all notifications
exports.getAllNotifs = async (req, res) => {
    try {
        const notifs = await Notif.find({ userId: req.query.userId })
            .populate('userId', 'name last role')
            .populate('contentId', '_id')
            .sort({ createdAt: -1 });
        
        res.status(200).json(notifs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
    }
}

// Get new notifications count
exports.getNewNotifs = async (req, res) => {
    try {
        const notifs = await Notif.find({
            userId: req.query.userId,
            createdAt: { $gt: req.query.lastChecked },
        });

        res.status(200).json(notifs);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
    }
};

exports.markNotifAsRead = async (req, res) => {
  try {
        const updatedNotif = await Notif.findByIdAndUpdate(
            req.body.notifId,
            { read: true },
            { new: true }
        );

        if (!updatedNotif) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.status(200).json({
            message: 'Notification marked as read',
            notification: updatedNotif
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
    }
};

// Get a specific notification by ID
exports.getNotifById = async (req, res) => {
    try {
        const notif = await Notif.findById(req.params.id).populate('salesAgent', 'name email');
        if (!notif) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json(notif);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving notifications', error: error.message });
    }
};

// Update a notification by ID
exports.updateNotif = async (req, res) => {
    try {
        const notif = await Notif.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!notif) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ message: 'Notification updated successfully', notif });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications', error: error.message });
    }
};

// Delete a notification by ID
exports.deleteNotif = async (req, res) => {
    try {
        const notif = await Notif.findByIdAndDelete(req.params.id);
        if (!notif) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notifications', error: error.message });
    }
};
