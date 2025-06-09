//Backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { deleteUserAccount } = require('../controllers/userController');

router.delete('/me', authenticate, deleteUserAccount);

module.exports = router;
