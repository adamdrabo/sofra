
const { Router } = require('express')
const { genererPlan, detailRecette } = require('../controllers/planController')

const router = Router()

router.get('/', genererPlan)
router.get('/recettes/:id', detailRecette)

module.exports = router
