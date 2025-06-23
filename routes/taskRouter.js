const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { requireAuthUser, hasRole } = require('../middlewares/auth');

// Create a new task (Sales Agent)
router.post('/', requireAuthUser, hasRole('salesAgent', 'operationalOfficer'), taskController.createTask);

// Get all tasks (Sales Agent)
router.get('/', requireAuthUser, hasRole('salesAgent', 'operationalOfficer'), taskController.getAllTasks);

// Get a specific task by ID (Sales Agent)
router.get('/:id', requireAuthUser, hasRole('salesAgent', 'operationalOfficer'), taskController.getTaskById);

// Update a task by ID (Sales Agent)
router.put('/:id', requireAuthUser, hasRole('salesAgent', 'operationalOfficer'), taskController.updateTask);

// Delete a task by ID (Sales Agent)
router.delete('/:id', requireAuthUser, hasRole('salesAgent', 'operationalOfficer'), taskController.deleteTask);

module.exports = router;