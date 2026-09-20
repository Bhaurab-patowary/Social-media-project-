const { Router } = require('express')
const authController = require('../controller/auth.controller')
const { authUser } = require('../middleware/auth.middleware')
const upload = require('../middleware/upload.middleware')

const authRoute = Router()

authRoute.post('/register', authController.registerController)
authRoute.post('/login', authController.loginController)
// Profile & Logout endpoints
authRoute.get('/profile', authUser, authController.getProfileController)
authRoute.get('/logout', authUser, authController.logoutController)
authRoute.put('/profile', authUser, upload.single("avatar"), authController.updateProfileController)

module.exports = authRoute



