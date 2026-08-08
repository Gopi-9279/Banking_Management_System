const express = require("express");
const authContoller = require("../controllers/auth.controllers.js")

const router = express.Router()
/* POST /api/auth/registration */
router.post("/register",authContoller.userRegistrationController)

/* POST /api/auth/login */
router.post("/login",authContoller.userLoginController)


module.exports = router