const { Router } = require('express')
const { listerFil, lireRecette, publierRecette } = require('../controllers/filController')
const { exigerSession } = require('../middleware/authMiddleware')

const router = Router();

router.get('/', listerFil)
router.get('/:id', lireRecette)
router.post('/', exigerSession, publierRecette)

module.exports = router
