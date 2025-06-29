const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { requireAuthUser, hasRole } = require('../middlewares/auth');

// Create a new task (Sales Agent)
router.post('/', requireAuthUser, hasRole('admin'), taskController.createTask);

// Get all tasks (Sales Agent)
router.get('/', requireAuthUser, hasRole('admin'), taskController.getAllTasks);
router.get('/getUserTasks', requireAuthUser, hasRole('salesAgent', 'operationalOfficer'), taskController.getUserTasks);

// Get a specific task by ID (Sales Agent)
router.get('/:id', requireAuthUser, hasRole('salesAgent', 'operationalOfficer', 'admin'), taskController.getTaskById);

// Update a task by ID (Sales Agent)
router.put('/:id', requireAuthUser, hasRole('admin'), taskController.updateTask);

// Delete a task by ID (Sales Agent)
router.delete('/:id', requireAuthUser, hasRole('admin'), taskController.deleteTask);

module.exports = router;