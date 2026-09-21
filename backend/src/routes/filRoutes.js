const express = require('express');
const { exigerSession } = require('../middleware/authMiddleware');
const { publier, consulterFil } = require('../controllers/filController');

const router = express.Router();

router.get('/', consulterFil);
router.post('/', exigerSession, publier);

module.exports = router;
