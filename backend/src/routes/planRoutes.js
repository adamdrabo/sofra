const express = require('express');
const { obtenirRecettesFiltrees } = require('../controllers/planController');

const router = express.Router();

router.post('/recettes', obtenirRecettesFiltrees);

module.exports = router;
