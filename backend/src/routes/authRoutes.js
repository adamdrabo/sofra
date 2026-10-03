const { Router } = require('express')
const { inscription, connexion, moi } = require('../controllers/authController')
const { exigerSession } = require('../middleware/authMiddleware')

const router = Router()

router.post('/inscription', inscription)
router.post('/connexion', connexion)
router.get('/moi', exigerSession, moi)

module.exports = router
