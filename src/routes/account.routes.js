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

/**
 * - GET /api/accounts
 * - Create all accounts of the ledger-in user
 * - Protected Route
 */

router.get("/",authMiddleware.authMiddleware,accountController.getUserAccountsContoller);
module.exports = router

/**
 * - GET /api/accounts/balance/:accountId 
 * - Create all accounts of the ledger-in user
 * - Protected Route
 */

router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getBalanceAccountsController)
