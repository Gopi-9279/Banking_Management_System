const express = require("express")
const authMiddleware = require("../middleware/auth.middleware.js")
const accountController = require("../controllers/account.controller.js")



const router = express.Router()


/**
 * - POST /api/accounts/
 * - Create a new Account
 * - Protected Route
 */

router.post("/",authMiddleware.authMiddleware,accountController.createAccountController)


module.exports = router